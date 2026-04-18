import json
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from src.config import settings
from .prompts import prompt
from .tools import get_database_schema_tool, execute_sql_query_tool, generate_visualization_tool

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
