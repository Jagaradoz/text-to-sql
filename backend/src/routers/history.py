from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from src.database.connection import get_db
from src.database.models import QueryHistory

router = APIRouter()

@router.get("/", summary="Get query history")
def get_query_history(limit: int = 50, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    history = db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).limit(limit).all()
    return [
        {
            "id": h.id,
            "natural_language_query": h.natural_language_query,
            "generated_sql": h.generated_sql,
            "explanation": h.explanation,
            "execution_status": h.execution_status,
            "created_at": h.created_at
        }
        for h in history
    ]
