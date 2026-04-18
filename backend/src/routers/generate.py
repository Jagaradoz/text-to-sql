import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Union, List, Dict, Any, Optional
from src.database.connection import get_db
from src.database.models import QueryHistory
from src.services.ai_service import run_agent_query

GENERATE_LIMIT = 50  # Fixed cap for generated query results


def log_failed_generate(prompt: str, error_message: str):
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "prompt": prompt,
        "error": error_message
    }

    try:
        with open(log_dir / "failed_generates.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as io_err:
        print(f"Failed to write telemetry: {io_err}")


router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str


class GenerateMeta(BaseModel):
    total_records: int
    limit: int
    warning: Optional[str] = None


class GenerateResponse(BaseModel):
    sql: str
    explanation: str
    chart_config: dict
    meta: GenerateMeta
    data: Union[List[Dict[str, Any]], str]


@router.post("", response_model=GenerateResponse)
def generate(req: GenerateRequest, db: Session = Depends(get_db)):
    try:
        # Run LangChain agent — the AI decides the SQL
        result_dict = run_agent_query(req.prompt)

        raw_sql = result_dict.get("sql", "").strip()
        explanation = result_dict.get("explanation", "")
        chart_config = result_dict.get("chart_config", {})

        # Security: Wrap the AI-generated SQL in a subquery with a fixed LIMIT.
        # This prevents crashes when the AI already includes a LIMIT,
        # and also guards against excessively large result sets.
        safe_sql = f"SELECT * FROM ({raw_sql}) AS sub LIMIT :limit"

        from src.database.connection import engine
        from src.services.sql_validator import validate_sql_safety

        # First, validate the raw AI SQL before wrapping/executing
        validate_sql_safety(raw_sql)

        with engine.connect() as conn:
            # Get total count using a subquery
            count_result = conn.execute(
                text(f"SELECT COUNT(*) FROM ({raw_sql}) AS count_sub")
            )
            total_records = count_result.scalar()

            # Execute capped query with parameterized limit
            data_result = conn.execute(
                text(safe_sql),
                {"limit": GENERATE_LIMIT}
            )
            rows = [dict(row._mapping) for row in data_result]

        warning = None
        if total_records > GENERATE_LIMIT:
            warning = f"Results are capped at {GENERATE_LIMIT} records. The full query returned {total_records} rows."

        # Persist to history table safely
        history_entry = QueryHistory(
            natural_language_query=req.prompt,
            generated_sql=raw_sql,
            explanation=explanation,
            execution_status="SUCCESS"
        )
        db.add(history_entry)
        db.commit()

        return GenerateResponse(
            sql=raw_sql,
            explanation=explanation,
            chart_config=chart_config,
            meta=GenerateMeta(
                total_records=total_records,
                limit=GENERATE_LIMIT,
                warning=warning,
            ),
            data=rows,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Log failure to DB
        try:
            history_entry = QueryHistory(
                natural_language_query=req.prompt,
                generated_sql="FAILED",
                explanation=str(e),
                execution_status="FAILED"
            )
            db.add(history_entry)
            db.commit()
        except Exception:
            pass

        log_failed_generate(req.prompt, str(e))
        raise HTTPException(status_code=500, detail=f"AI Agent failed: {str(e)}")
