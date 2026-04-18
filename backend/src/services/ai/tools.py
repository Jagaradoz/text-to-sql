import json
from langchain_core.tools import tool
from sqlalchemy import text
from src.database.connection import engine
from src.services.database.introspection import get_db_schema
from src.services.sql_validator import validate_sql_safety
from src.constants import AGENT_QUERY_LIMIT

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

@tool("get_database_schema")
def get_database_schema_tool() -> str:
    """Retrieves the full database schema including tables, columns, and relationships."""
    schema = get_db_schema()
    return format_schema_for_ai(schema)

@tool("execute_sql_query")
def execute_sql_query_tool(sql: str) -> str:
    """Executes a SQL SELECT query safely against the database and returns the JSON results."""
    # Safety check (raises ValueError if malicious)
    validate_sql_safety(sql)
    
    # Wrap in subquery with LIMIT to prevent unbounded results
    escaped_sql = sql.replace(":", "\\:")
    safe_sql = f"SELECT * FROM ({escaped_sql}) AS agent_sub LIMIT {AGENT_QUERY_LIMIT}"
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(safe_sql))
            rows = [dict(row._mapping) for row in result]
            return json.dumps(rows, default=str)
    except Exception as e:
        return f"Database Execution Error: {str(e)}"

@tool("generate_visualization")
def generate_visualization_tool(query_summary: str, columns: list[str]) -> str:
    """ Suggests a simple Recharts configuration based on the data. """
    # Simple heuristic
    chart_type = "bar"
    if "date" in str(columns).lower() or "time" in str(columns).lower():
        chart_type = "line"
        
    config = {
        "type": chart_type,
        "x_axis": columns[0] if len(columns) > 0 else "unknown",
        "y_axis": columns[1] if len(columns) > 1 else "unknown"
    }
    return json.dumps(config)
