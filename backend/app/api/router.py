from fastapi import APIRouter
from app.api import health, schema, history

api_router = APIRouter()

api_router.include_router(health.router, tags=["system"])
api_router.include_router(schema.router, prefix="/database", tags=["database"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
