from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from src.database.connection import get_db, get_table_records, execute_raw_sql
from src.database.models import TableMetadata
from src.services.sql_validator import validate_ddl_safety
from src.services.ai_service import analyze_sql_schema

router = APIRouter()


# --- Pydantic Schemas ---

class DatabaseOverviewItem(BaseModel):
    name: str
    description: str


class DatabaseOverviewResponse(BaseModel):
    databases: List[DatabaseOverviewItem]


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total_records: int
    total_pages: int


class TableRecordsResponse(BaseModel):
    table_name: str
    meta: PaginationMeta
    data: List[Dict[str, Any]]


# --- Endpoints ---

@router.get("/schema", response_model=DatabaseOverviewResponse)
def schema_overview(db: Session = Depends(get_db)):
    """
    Returns a list of all tables and their human-readable descriptions,
    sourced from the `table_metadata` database table.
    """
    try:
        rows = db.query(TableMetadata).order_by(TableMetadata.table_name).all()
        databases = [
            DatabaseOverviewItem(name=row.table_name, description=row.description)
            for row in rows
        ]
        return DatabaseOverviewResponse(databases=databases)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")


@router.get("/{table_name}", response_model=TableRecordsResponse)
def table_records(
    table_name: str,
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(default=50, ge=1, le=500, description="Records per page (max 500)"),
):
    """
    Returns a paginated slice of raw records from the specified table.
    Used by the database Inspect feature on the frontend.

    Security: table_name is validated against the live database inspector
    allowlist. limit/offset are parameterized to prevent SQL injection.
    """
    try:
        result = get_table_records(table_name, page, limit)
        return TableRecordsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")


@router.post("/upload")
async def upload_sql_schema(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Receives a .sql file, validates it for safety, executes it to create tables,
    and uses AI to generate and store descriptions for the new tables.
    """
    if not file.filename.endswith(".sql"):
        raise HTTPException(status_code=400, detail="Only .sql files are supported.")

    content = await file.read()
    # Handle files potentially missing BOM or unusual encodings
    try:
        sql_text = content.decode("utf-8")
    except UnicodeDecodeError:
         sql_text = content.decode("latin-1")

    # 1. Security check
    validate_ddl_safety(sql_text)

    # 2. AI Analysis for metadata
    # We do this BEFORE execution in case we want to show it, or just for documentation
    metadata_list = analyze_sql_schema(sql_text)

    # 3. Execute the SQL
    try:
        execute_raw_sql(sql_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL Execution Error: {str(e)}")

    # 4. Sync metadata to table_metadata
    created_tables = []
    for item in metadata_list:
        table_name = item.get("table_name")
        description = item.get("description")
        
        if not table_name:
            continue
            
        # Update or Insert
        db_item = db.query(TableMetadata).filter(TableMetadata.table_name == table_name).first()
        if db_item:
            db_item.description = description
        else:
            db_item = TableMetadata(table_name=table_name, description=description)
            db.add(db_item)
        
        created_tables.append(table_name)
    
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully processed SQL script. Tables documented: {', '.join(created_tables)}",
        "metadata": metadata_list
    }
