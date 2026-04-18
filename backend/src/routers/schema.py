from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from src.database.connection import get_db_table_names, get_db_table_detail

router = APIRouter()

# Mocked descriptions for each table — swap for AI-generated later
TABLE_DESCRIPTIONS: dict[str, str] = {
    "users": "Stores user account information such as name, email, and country.",
    "products": "Product catalog with pricing, category, and stock levels.",
    "orders": "Customer orders with status tracking and total amounts.",
    "order_items": "Line items linking orders to products with quantity and unit price.",
    "query_history": "Log of natural language queries and their generated SQL results.",
}


class DatabaseOverviewItem(BaseModel):
    name: str
    description: str


class DatabaseOverviewResponse(BaseModel):
    databases: List[DatabaseOverviewItem]


class ColumnInfo(BaseModel):
    name: str
    type: str
    nullable: bool


class ForeignKeyInfo(BaseModel):
    constrained_columns: List[str]
    referred_table: str
    referred_columns: List[str]


class TableDetailResponse(BaseModel):
    table_name: str
    columns: List[ColumnInfo]
    foreign_keys: List[ForeignKeyInfo]


@router.get("/schema", response_model=DatabaseOverviewResponse)
def schema_overview():
    try:
        table_names = get_db_table_names()
        databases = [
            DatabaseOverviewItem(
                name=name,
                description=TABLE_DESCRIPTIONS.get(name, "No description available."),
            )
            for name in table_names
        ]
        return DatabaseOverviewResponse(databases=databases)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")


@router.get("/{table_name}", response_model=TableDetailResponse)
def table_detail(table_name: str):
    try:
        detail = get_db_table_detail(table_name)
        return TableDetailResponse(**detail)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")
