from pydantic import BaseModel
from typing import List, Dict, Any


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
