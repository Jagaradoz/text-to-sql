from sqlalchemy import inspect, text
from src.database.connection import engine
from src.constants import MAX_RECORDS_LIMIT

def inspect_table(table_name: str, page: int = 1, limit: int = 50) -> dict:
    """
    Fetches raw records from any known table with backend-managed pagination.
    
    Security measures:
      - table_name is validated via an allowlist (inspector) before use.
      - LIMIT and OFFSET are fixed/parameterized to prevent SQL injection.
    """
    inspector = inspect(engine)
    valid_tables = inspector.get_table_names()

    if table_name not in valid_tables:
        raise KeyError(f"Table '{table_name}' not found in database.")

    # Enforce global safety limits on page size
    if limit > MAX_RECORDS_LIMIT:
        limit = MAX_RECORDS_LIMIT
    
    offset = (page - 1) * limit

    # Quote the identifier to prevent injection even with allowlist validation
    from sqlalchemy import quoted_name
    quoted_table = str(quoted_name(table_name, quote=True))

    with engine.connect() as conn:
        # COUNT query — table name is quoted and allowlist-validated
        count_result = conn.execute(text(f"SELECT COUNT(*) FROM {quoted_table}"))
        total_records = count_result.scalar()

        # Data query — LIMIT/OFFSET are parameterized
        data_result = conn.execute(
            text(f"SELECT * FROM {quoted_table} LIMIT :limit OFFSET :offset"),
            {"limit": limit, "offset": offset}
        )
        rows = [dict(row._mapping) for row in data_result]

    total_pages = (total_records + limit - 1) // limit if total_records > 0 else 0

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
