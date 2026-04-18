from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.routers import health, schema, generate
from src.database.connection import engine, SessionLocal
from src.database.models import Base, TableMetadata

app = FastAPI(
    title="Text-to-SQL Data Assistant",
    description="Conversational AI system for querying Databases."
)

# Set up CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api"

app.include_router(health.router, prefix=api_prefix, tags=["system"])
app.include_router(schema.router, prefix=api_prefix + "/database", tags=["database"])
app.include_router(generate.router, prefix=api_prefix + "/generate", tags=["generate"])


# Default descriptions seeded from the original hardcoded dictionary
DEFAULT_TABLE_METADATA = [
    {"table_name": "users",         "description": "Stores user account information such as name, email, and country."},
    {"table_name": "products",      "description": "Product catalog with pricing, category, and stock levels."},
    {"table_name": "orders",        "description": "Customer orders with status tracking and total amounts."},
    {"table_name": "order_items",   "description": "Line items linking orders to products with quantity and unit price."},
    {"table_name": "query_history", "description": "Log of natural language queries and their generated SQL results."},
]


@app.on_event("startup")
def on_startup():
    # Ensure all tables exist (safe no-op if they already do)
    Base.metadata.create_all(bind=engine)

    # Seed table_metadata if it is empty
    db = SessionLocal()
    try:
        if db.query(TableMetadata).count() == 0:
            for item in DEFAULT_TABLE_METADATA:
                db.add(TableMetadata(**item))
            db.commit()
            print("✅ Seeded table_metadata with default descriptions.")
        else:
            print("ℹ️  table_metadata already seeded — skipping.")
    except Exception as e:
        print(f"⚠️  Failed to seed table_metadata: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
