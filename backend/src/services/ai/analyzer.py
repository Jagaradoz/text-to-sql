import json
from typing import List, Dict
from langchain_openai import ChatOpenAI
from src.config import settings
from src.constants import MAX_SQL_CONTENT_CHARS

def analyze_sql_schema(sql_content: str) -> List[Dict[str, str]]:
    """
    Uses LLM to analyze the provided SQL schema content and return 
    a list of table names and their summaries/descriptions.
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured.")

    if len(sql_content) > MAX_SQL_CONTENT_CHARS:
        raise ValueError(f"SQL script too large ({len(sql_content)} chars). Maximum is {MAX_SQL_CONTENT_CHARS} chars.")

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
