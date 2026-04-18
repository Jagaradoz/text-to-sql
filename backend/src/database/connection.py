from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import func as sa_func
from src.config import settings
from src.constants import MAX_RECORDS_LIMIT

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_schema():
    """
    Introspects the database using SQLAlchemy and returns a list of tables,
    their columns, and relationships.
    """
    inspector = inspect(engine)
    schema_info = []
    
    for table_name in inspector.get_table_names():
        columns = []
        for column in inspector.get_columns(table_name):
            columns.append({
                "name": column["name"],
                "type": str(column["type"]),
                "nullable": column["nullable"],
            })
        
        # Get foreign keys
        foreign_keys = []
        for fk in inspector.get_foreign_keys(table_name):
            foreign_keys.append({
                "constrained_columns": fk["constrained_columns"],
                "referred_table": fk["referred_table"],
                "referred_columns": fk["referred_columns"]
            })
            
        schema_info.append({
            "table_name": table_name,
            "columns": columns,
            "foreign_keys": foreign_keys
        })
        
    return schema_info


def get_db_table_names() -> list[str]:
    """
    Returns only the list of table names in the database.
    No column introspection — lightweight for overview endpoints.
    """
    inspector = inspect(engine)
    return inspector.get_table_names()


def get_db_table_detail(table_name: str) -> dict:
    """
    Returns columns and foreign keys for a single table.
    Raises KeyError if the table does not exist.
    """
    inspector = inspect(engine)

    if table_name not in inspector.get_table_names():
        raise KeyError(f"Table '{table_name}' not found in database.")

    columns = []
    for column in inspector.get_columns(table_name):
        columns.append({
            "name": column["name"],
            "type": str(column["type"]),
            "nullable": column["nullable"],
        })

    foreign_keys = []
    for fk in inspector.get_foreign_keys(table_name):
        foreign_keys.append({
            "constrained_columns": fk["constrained_columns"],
            "referred_table": fk["referred_table"],
            "referred_columns": fk["referred_columns"],
        })

    return {
        "table_name": table_name,
        "columns": columns,
        "foreign_keys": foreign_keys,
    }


def inspect_table(table_name: str, page: int, limit: int) -> dict:
    """
    Fetches a paginated slice of raw records from any known table.
    
    Security measures:
      - table_name is validated via an allowlist (inspector) before use.
      - LIMIT and OFFSET are bound as SQLAlchemy parameters (:limit/:offset),
        never interpolated via f-strings, preventing SQL injection.
      - limit is silently capped at MAX_RECORDS_LIMIT to prevent DoS.
    """
    inspector = inspect(engine)
    valid_tables = inspector.get_table_names()

    if table_name not in valid_tables:
        raise KeyError(f"Table '{table_name}' not found in database.")

    # Silently enforce maximum limit to prevent memory exhaustion
    limit = min(limit, MAX_RECORDS_LIMIT)
    offset = (page - 1) * limit

    # Quote the identifier to prevent injection even with allowlist validation
    from sqlalchemy import quoted_name
    quoted_table = str(quoted_name(table_name, quote=True))

    with engine.connect() as conn:
        # COUNT query — table name is quoted and allowlist-validated
        count_result = conn.execute(text(f"SELECT COUNT(*) FROM {quoted_table}"))
        total_records = count_result.scalar()

        # Data query — LIMIT and OFFSET use named parameters, table name is quoted
        data_result = conn.execute(
            text(f"SELECT * FROM {quoted_table} LIMIT :limit OFFSET :offset"),
            {"limit": limit, "offset": offset}
        )
        rows = [dict(row._mapping) for row in data_result]

    total_pages = (total_records + limit - 1) // limit  # ceiling division

    return {
        "table_name": table_name,
        "meta": {
            "page": page,
            "limit": limit,
            "total_records": total_records,
            "total_pages": total_pages,
        },
        "data": rows,
    }


def execute_raw_sql(sql_content: str):
    """
    Executes multiple SQL statements (DDL/DML) within a single transaction.
    Splits the script into individual statements using sqlparse so each
    can be executed separately (psycopg2 doesn't support multi-statement text()).
    """
    import sqlparse

    statements = [s for s in sqlparse.split(sql_content) if s.strip()]

    with engine.connect() as conn:
        with conn.begin():
            for stmt in statements:
                # Escape colons so SQLAlchemy does not treat them as bind parameters
                conn.execute(text(stmt.replace(":", "\\:")))
