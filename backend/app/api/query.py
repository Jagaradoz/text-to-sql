from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Union, List, Dict, Any
from app.domain.db import get_db
from app.domain.models import QueryHistory
from app.services.ai_service import run_agent_query

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
        raise HTTPException(status_code=500, detail=f"AI Agent failed: {str(e)}")
