import json
from typing import List, Dict
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy import text
from src.database.connection import get_db_schema, engine
from src.services.sql_validator import validate_sql_safety
from src.config import settings

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
    # Safety middleware check (throws HTTPException 400 if malicious)
    validate_sql_safety(sql)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
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

# Initialize the OpenAI model prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a senior PostgreSQL DBA and Data Analyst. "
               "You have access to tools to fetch the database schema, run SQL queries, and configure visualizations.\n"
               "Follow these steps rigidly when asked a question:\n"
               "1. Use `get_database_schema` to understand the available tables.\n"
               "2. Think about the correct SQL to answer the user's question.\n"
               "3. Use `execute_sql_query` to run your generated query. STRICTLY USE SELECT ONLY.\n"
               "4. Use `generate_visualization` to suggest a chart type for the results if applicable.\n"
               "5. Formulate your final response to the user explaining what you found and how the data is structured.\n"
               "Your final response MUST be a JSON object with the exact keys: 'sql' (the raw string), 'explanation' (plain english summary), 'data' (the raw JSON array returned from execution passed inline), and 'chart_config' (the JSON config)."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

def run_agent_query(user_input: str) -> dict:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured in .env.")
        
    llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=settings.OPENAI_API_KEY)
    tools = [get_database_schema_tool, execute_sql_query_tool, generate_visualization_tool]
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    response = agent_executor.invoke({"input": user_input})
    output_str = response.get("output", "{}")
    
    try:
        # Clean markdown wrappers if GPT returned pure JSON
        if "```json" in output_str:
            output_str = output_str.split("```json")[1].split("```")[0].strip()
        elif "```" in output_str:
            output_str = output_str.split("```")[1].split("```")[0].strip()
            
        return json.loads(output_str)
    except json.JSONDecodeError:
        return {
            "sql": "Error parsing JSON",
            "explanation": output_str,
            "data": [],
            "chart_config": {}
        }


def analyze_sql_schema(sql_content: str) -> List[Dict[str, str]]:
    """
    Uses LLM to analyze the provided SQL schema content and return 
    a list of table names and their summaries/descriptions.
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured.")

    llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=settings.OPENAI_API_KEY)
    
    analysis_prompt = f"""
    Analyze the following SQL DDL script. 
    Identify every table that will be created and provide a 1-sentence description of its purpose based on its columns and structure.
    
    Return ONLY a JSON list of objects with the keys 'table_name' and 'description'.
    Example: [{{"table_name": "users", "description": "Stores user profiles and login credentials"}}]
    
    SQL Content:
    {sql_content}
    """
    
    response = llm.invoke(analysis_prompt)
    output_str = response.content.strip()
    
    # Clean markdown wrappers if present
    if "```json" in output_str:
        output_str = output_str.split("```json")[1].split("```")[0].strip()
    elif "```" in output_str:
        output_str = output_str.split("```")[1].split("```")[0].strip()
        
    try:
        data = json.loads(output_str)
        if isinstance(data, list):
            return data
        return []
    except json.JSONDecodeError:
        return []
