from sqlalchemy import text
from src.database.connection import engine

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
