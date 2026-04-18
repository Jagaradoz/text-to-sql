from sqlalchemy import inspect, text
from src.database.connection import engine
from src.constants import MAX_RECORDS_LIMIT

def inspect_table(table_name: str) -> dict:
    """
    Fetches raw records from any known table, capped at MAX_RECORDS_LIMIT.
    
    Security measures:
      - table_name is validated via an allowlist (inspector) before use.
      - LIMIT and OFFSET are fixed/parameterized to prevent SQL injection.
    """
    inspector = inspect(engine)
    valid_tables = inspector.get_table_names()

    if table_name not in valid_tables:
        raise KeyError(f"Table '{table_name}' not found in database.")

    # Use fixed maximum limit to prevent memory exhaustion
    limit = MAX_RECORDS_LIMIT
    offset = 0

    # Quote the identifier to prevent injection even with allowlist validation
    from sqlalchemy import quoted_name
    quoted_table = str(quoted_name(table_name, quote=True))

    with engine.connect() as conn:
        # COUNT query — table name is quoted and allowlist-validated
        count_result = conn.execute(text(f"SELECT COUNT(*) FROM {quoted_table}"))
        total_records = count_result.scalar()

        # Data query — LIMIT is parameterized, table name is quoted
        data_result = conn.execute(
            text(f"SELECT * FROM {quoted_table} LIMIT :limit OFFSET :offset"),
            {"limit": limit, "offset": offset}
        )
        rows = [dict(row._mapping) for row in data_result]

    return {
        "table_name": table_name,
        "meta": {
            "page": 1,
            "limit": limit,
            "total_records": total_records,
            "total_pages": 1,
        },
        "data": rows,
    }
