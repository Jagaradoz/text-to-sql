from pydantic import BaseModel
from typing import Union, List, Dict, Any, Optional


class GenerateRequest(BaseModel):
    prompt: str
    provider: str = "openai"
    model_name: Optional[str] = None


class GenerateMeta(BaseModel):
    total_records: int
    limit: int
    page: int
    total_pages: int
    warning: Optional[str] = None


class GenerateResponse(BaseModel):
    sql: str
    explanation: str
    chart_config: dict
    meta: GenerateMeta
    data: Union[List[Dict[str, Any]], str]
