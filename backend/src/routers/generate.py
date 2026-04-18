import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from typing import Union, List, Dict, Any, Optional
from src.services.ai_service import run_agent_query
from src.services.sql_validator import validate_sql_safety
from src.constants import GENERATE_LIMIT

logger = logging.getLogger(__name__)


def log_failed_generate(prompt: str, error_message: str):
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
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
def generate(req: GenerateRequest):
    try:
        # Run LangChain agent — the AI decides the SQL
        result_dict = run_agent_query(req.prompt)

        raw_sql = result_dict.get("sql", "").strip()
        explanation = result_dict.get("explanation", "")
        chart_config = result_dict.get("chart_config", {})

        # First, validate the raw AI SQL before wrapping/executing
        validate_sql_safety(raw_sql)

        # Extra guard: reject if raw SQL contains semicolons (prevents multi-statement injection)
        if ";" in raw_sql.rstrip(";"):
            raise ValueError("Semicolons are not permitted in generated SQL.")

        from src.database.connection import engine

        # Escape colons in the raw SQL so SQLAlchemy does not treat them as bind parameters
        escaped_sql = raw_sql.replace(":", "\\:")

        # Security: Wrap the AI-generated SQL in a subquery with a fixed LIMIT.
        # raw_sql is validated (single SELECT only, no semicolons) before use.
        # SQL fragments cannot be parameterized, so f-string is used after validation.
        safe_sql = f"SELECT * FROM ({escaped_sql}) AS sub LIMIT :limit"

        with engine.connect() as conn:
            # Get total count using a subquery
            count_result = conn.execute(
                text(f"SELECT COUNT(*) FROM ({escaped_sql}) AS count_sub")
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
        # Validation errors from sql_validator (safety check failures)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Generate failed for prompt '{req.prompt}': {e}")

        log_failed_generate(req.prompt, str(e))
        raise HTTPException(status_code=500, detail=f"AI Agent failed: {str(e)}")
