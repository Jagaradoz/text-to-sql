import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.constants import API_PREFIX, DEFAULT_TABLE_METADATA
from src.routers import health, database, generate
from src.database.connection import engine, SessionLocal
from src.database.models import Base, TableMetadata

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_rows = {row.table_name: row for row in db.query(TableMetadata).all()}
        desired = {item["table_name"]: item for item in DEFAULT_TABLE_METADATA}

        existing_names = set(existing_rows.keys())
        desired_names = set(desired.keys())

        # Remove stale entries
        for name in existing_names - desired_names:
            db.query(TableMetadata).filter(TableMetadata.table_name == name).delete()

        # Add missing entries and update descriptions for existing ones
        for name, item in desired.items():
            if name not in existing_names:
                db.add(TableMetadata(**item))
            elif existing_rows[name].description != item["description"]:
                existing_rows[name].description = item["description"]

        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to seed table metadata during startup")
    finally:
        db.close()

    yield

    # Shutdown logic (optional)
    # close connections here if needed


app = FastAPI(
    title="Text-to-SQL Data Assistant",
    description="Conversational AI system for querying Databases.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=API_PREFIX, tags=["system"])
app.include_router(database.router, prefix=API_PREFIX + "/database", tags=["database"])
app.include_router(generate.router, prefix=API_PREFIX + "/generate", tags=["generate"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.PORT, reload=True)