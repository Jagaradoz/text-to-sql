import json
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from src.config import settings

def analyze_dataframe_schema(table_name: str, df_preview: List[Dict[str, Any]], dtypes_dict: Dict[str, str]) -> List[Dict[str, str]]:
    """
    Uses LLM to analyze the provided DataFrame schema information and return 
    a description of the table based on its columns and sample data.
    """
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured.")

    llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=settings.OPENAI_API_KEY)
    
    schema_info = {
        "table_name": table_name,
        "columns_and_types": dtypes_dict,
        "sample_data": df_preview
    }
    
    analysis_prompt = f"""
    Analyze the following data table information.
    Provide a 1-sentence description of its purpose based on its name, columns, and sample data.
    
    Return ONLY a JSON list of objects with the keys 'table_name' and 'description'.
    Example: [{{"table_name": "users", "description": "Stores user profiles and login credentials"}}]
    
    Table Information:
    {json.dumps(schema_info, indent=2, default=str)}
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
