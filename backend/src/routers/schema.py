from fastapi import APIRouter, HTTPException
from src.database.connection import get_db_schema

router = APIRouter()

@router.get("/schema")
def schema_info():
    try:
        schema = get_db_schema()
        return {"schema": schema}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")
