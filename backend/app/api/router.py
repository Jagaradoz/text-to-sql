from fastapi import APIRouter
from app.api import health, schema, history, query

api_router = APIRouter()

api_router.include_router(health.router, tags=["system"])
api_router.include_router(schema.router, prefix="/database", tags=["database"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
