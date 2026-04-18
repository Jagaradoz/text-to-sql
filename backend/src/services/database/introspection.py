from sqlalchemy import inspect
from src.database.connection import engine

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
