import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Union, List, Dict, Any
from src.database.connection import get_db
from src.database.models import QueryHistory
from src.services.ai_service import run_agent_query

def log_failed_query(query: str, error_message: str):
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "query": query,
        "error": error_message
    }
    
    try:
        with open(log_dir / "failed_queries.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as io_err:
        print(f"Failed to write telemetry: {io_err}")

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    sql: str
    explanation: str
    data: Union[List[Dict[str, Any]], str]
    chart_config: dict

@router.post("/generate", response_model=QueryResponse)
def generate_query(req: QueryRequest, db: Session = Depends(get_db)):
    try:
        # Run LangChain agent
        result_dict = run_agent_query(req.query)
        
        sql = result_dict.get("sql", "")
        explanation = result_dict.get("explanation", "")
        data = result_dict.get("data", [])
        chart_config = result_dict.get("chart_config", {})
        
        # Persist to history table safely
        history_entry = QueryHistory(
            natural_language_query=req.query,
            generated_sql=sql,
            explanation=explanation,
            execution_status="SUCCESS"
        )
        db.add(history_entry)
        db.commit()
        
        return QueryResponse(
            sql=sql,
            explanation=explanation,
            data=data,
            chart_config=chart_config
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Attempt to log failure
        history_entry = QueryHistory(
            natural_language_query=req.query,
            generated_sql="FAILED",
            explanation=str(e),
            execution_status="FAILED"
        )
        try:
            db.add(history_entry)
            db.commit()
        except:
            pass
            
        log_failed_query(req.query, str(e))
        
        raise HTTPException(status_code=500, detail=f"AI Agent failed: {str(e)}")
