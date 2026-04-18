from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.routers import health, schema, history, query

app = FastAPI(
    title="Text-to-SQL Data Assistant",
    description="Conversational AI system for querying PostgreSQL databases.",
    version="1.0.0"
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
app.include_router(history.router, prefix=api_prefix + "/history", tags=["history"])
app.include_router(query.router, prefix=api_prefix + "/query", tags=["query"])

@app.get("/")
def root():
    return {"message": "Welcome to Text-to-SQL API", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
