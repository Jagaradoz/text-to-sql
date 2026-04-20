from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File, Header
from typing import Optional
from sqlalchemy.orm import Session
import pandas as pd
import io
import re

from src.database.connection import get_db
from src.services.database.records import inspect_table
from src.database.models import TableMetadata
from src.services.ai.analyzer import analyze_dataframe_schema
from src.schemas.database import DatabaseOverviewItem, DatabaseOverviewResponse, TableRecordsResponse
from src.constants import MAX_UPLOAD_SIZE, DEFAULT_PAGE_SIZE

router = APIRouter()

@router.get("/schema", response_model=DatabaseOverviewResponse)
def schema_overview(db: Session = Depends(get_db)):
    """
    Returns a list of all tables and their human-readable descriptions,
    sourced from the `table_metadata` database table.
    """
    try:
        rows = db.query(TableMetadata).order_by(TableMetadata.id).all()
        databases = [
            DatabaseOverviewItem(name=row.table_name, description=row.description)
            for row in rows
        ]
        return DatabaseOverviewResponse(databases=databases)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")


@router.get("/{table_name}", response_model=TableRecordsResponse)
def inspect_table_endpoint(
    table_name: str,
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    limit: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=500, description="Records per page"),
):
    """
    Returns a slice of raw records from the specified table (capped at MAX_RECORDS_LIMIT).
    Used by the database Inspect feature on the frontend.

    Security: table_name is validated against the live database inspector
    allowlist.
    """
    try:
        result = inspect_table(table_name, page=page, limit=limit)
        return TableRecordsResponse(**result)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")


@router.post("/upload")
def upload_data_schema(
    file: UploadFile = File(...),
    x_ai_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Receives a .csv or .xlsx file, processes it into a new database table safely,
    and uses AI to generate and store descriptions for the new table.
    """
    if not x_ai_api_key:
        raise HTTPException(status_code=400, detail="An OpenAI API key is required to upload data. Please provide one in your settings.")
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv, .xls, or .xlsx file.")

    content = file.file.read()

    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"The uploaded file exceeds the maximum allowed size of {MAX_UPLOAD_SIZE // (1024*1024)} MB.")

    file_stream = io.BytesIO(content)

    # 1. Parse File to DataFrame
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_stream)
        else:
            df = pd.read_excel(file_stream)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Unable to read the file. Please ensure it is a valid, uncorrupted spreadsheet.")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded file contains no data.")

    # Generate a clean table name from the filename
    base_name = file.filename.rsplit(".", 1)[0]
    # Strict sanitization: remove all non-alphanumeric characters (including _, -)
    table_name = re.sub(r'[^a-zA-Z0-9]', '', base_name).lower()
    
    if not table_name:
        raise HTTPException(status_code=400, detail="The file name must contain at least one letter or number to be used as a database table.")

    # Prefix numeric starts
    if table_name[0].isdigit():
        table_name = "t_" + table_name

    # 2. Insert into Database
    try:
        from src.config import settings
        df.to_sql(name=table_name, con=settings.DATABASE_URL, if_exists="replace", index=False)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while saving your data. Please check the file formatting and try again.")

    # 3. AI Analysis for metadata
    try:
        df_preview = df.head(3).to_dict(orient="records")
        dtypes_dict = {str(k): str(v) for k, v in df.dtypes.items()}
        metadata_list = analyze_dataframe_schema(table_name, df_preview, dtypes_dict, api_key=x_ai_api_key)
    except Exception as e:
        # We don't fail the upload just because AI analysis failed, but we log/return it.
        metadata_list = [{"table_name": table_name, "description": f"Imported data from {file.filename}"}]
        print(f"AI analysis failed: {e}")

    # 4. Sync metadata to table_metadata
    created_tables = []
    for item in metadata_list:
        meta_table_name = item.get("table_name")
        description = item.get("description")
        
        if not meta_table_name:
            continue
            
        db_item = db.query(TableMetadata).filter(TableMetadata.table_name == meta_table_name).first()
        if db_item:
            db_item.description = description
        else:
            db_item = TableMetadata(table_name=meta_table_name, description=description)
            db.add(db_item)
        
        created_tables.append(meta_table_name)
    
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully processed data file. Tables documented: {', '.join(created_tables)}",
        "metadata": metadata_list
    }
