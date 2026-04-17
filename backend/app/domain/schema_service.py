from sqlalchemy import inspect
from app.domain.db import engine

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

def format_schema_for_ai(schema_info):
    """
    Formats the schema info into a text description for inclusion in prompt.
    """
    description = ""
    for table in schema_info:
        description += f"Table: {table['table_name']}\n"
        description += "Columns:\n"
        for col in table['columns']:
            description += f" - {col['name']} ({col['type']})\n"
        
        if table['foreign_keys']:
            description += "Relationships:\n"
            for fk in table['foreign_keys']:
                description += f" - {table['table_name']}({', '.join(fk['constrained_columns'])}) references {fk['referred_table']}({', '.join(fk['referred_columns'])})\n"
        description += "\n"
    return description
