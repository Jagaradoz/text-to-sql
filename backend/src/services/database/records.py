from sqlalchemy import inspect, text
from src.database.connection import engine
from src.constants import MAX_RECORDS_LIMIT

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
