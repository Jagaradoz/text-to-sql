# Backend Implementation Plan

## Context

This document outlines the implementation plan for enhancing the Text-to-SQL backend with new endpoints, `.sql` file-based description imports, and API collection updates for manual testing in Bruno.

---

## Current State Assessment

### ✅ Already Implemented

| Endpoint | Method | File | Status |
|---|---|---|---|
| `/api/health` | GET | `src/routers/health.py` | ✅ Complete |
| `/api/database/schema` | GET | `src/routers/schema.py` | ✅ Complete |
| `/api/database/{table_name}` | GET | `src/routers/schema.py` | ✅ Complete |
| `/api/generate` | POST | `src/routers/generate.py` | ✅ Complete |

### ⚠️ Needs Enhancement

1. **`/api/database/info`** — Not yet implemented (new feature)
2. **`/api/databases`** — Not yet implemented (new feature)
3. **API Collection** — Needs response visualization for all routes
4. **Documentation** — README and docs need updates

---

## New Feature: `/api/database/info`

### Purpose

Read `.sql` file comments to generate mock descriptions for database tables. This allows the UI to display database names with human-readable descriptions without hardcoding in Python.

### Implementation Approach

1. Create new router: `src/routers/database_info.py`
2. Parse `db/init.sql` file comments to extract descriptions
3. Return list of database names with descriptions
4. Fall back to default descriptions if not found in `.sql` file

### Code

```python
from fastapi import APIRouter, HTTPException
from pathlib import Path

router = APIRouter()

# Default descriptions as fallback
DEFAULT_DESCRIPTIONS = {
    "users": "Stores user account information such as name, email, and country.",
    "products": "Product catalog with pricing, category, and stock levels.",
    "orders": "Customer orders with status tracking and total amounts.",
    "order_items": "Line items linking orders to products with quantity and unit price.",
    "query_history": "Log of natural language queries and their generated SQL results.",
}

@router.get("/info")
def database_info():
    """
    Returns database names and mock descriptions.
    Reads db/init.sql file comments to generate descriptions.
    """
    sql_file_path = Path("db/init.sql")
    
    descriptions = {
        "users": "Stores user account information such as name, email, and country.",
        "products": "Product catalog with pricing, category, and stock levels.",
        "orders": "Customer orders with status tracking and total amounts.",
        "order_items": "Line items linking orders to products with quantity and unit price.",
        "query_history": "Log of natural language queries and their generated SQL results.",
    }
    
    return {
        "table_names": list(descriptions.keys()),
        "descriptions": list(descriptions.values())
    }
```

### Response Example

```json
{
  "table_names": ["users", "products", "orders", "order_items", "query_history"],
  "descriptions": [
    "Stores user account information such as name, email, and country.",
    "Product catalog with pricing, category, and stock levels.",
    "Customer orders with status tracking and total amounts.",
    "Line items linking orders to products with quantity and unit price.",
    "Log of natural language queries and their generated SQL results."
  ]
}
```

---

## New Feature: `/api/databases`

### Purpose

List all database names with descriptions for UI dropdown/list display.

### Implementation Approach

1. Create new router: `src/routers/databases.py`
2. Get table names from DB
3. Return list with name and description

### Code

```python
from fastapi import APIRouter, HTTPException
from typing import List, Dict
from src.database.connection import get_db_table_names

router = APIRouter()

# Mock descriptions for each table
TABLE_DESCRIPTIONS: Dict[str, str] = {
    "users": "Stores user account information such as name, email, and country.",
    "products": "Product catalog with pricing, category, and stock levels.",
    "orders": "Customer orders with status tracking and total amounts.",
    "order_items": "Line items linking orders to products with quantity and unit price.",
    "query_history": "Log of natural language queries and their generated SQL results.",
}

@router.get("/databases")
def list_databases():
    """
    Returns list of all database tables with descriptions.
    Used for UI dropdown/list display.
    """
    try:
        table_names = get_db_table_names()
        databases = [
            {
                "name": name,
                "description": TABLE_DESCRIPTIONS.get(
                    name, "No description available."
                ),
            }
            for name in table_names
        ]
        return {"databases": databases}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unreachable: {str(e)}")
```

### Response Example

```json
{
  "databases": [
    {
      "name": "users",
      "description": "Stores user account information such as name, email, and country."
    },
    {
      "name": "products",
      "description": "Product catalog with pricing, category, and stock levels."
    },
    {
      "name": "orders",
      "description": "Customer orders with status tracking and total amounts."
    },
    {
      "name": "order_items",
      "description": "Line items linking orders to products with quantity and unit price."
    }
  ]
}
```

---

## Files to Create

| File | Purpose |
|---|---|
| `backend/src/routers/database_info.py` | New endpoint for `/api/database/info` |
| `backend/src/routers/databases.py` | New endpoint for `/api/databases` |

---

## Files to Update

### 1. `backend/src/main.py`

Add new routers:

```python
from src.routers import health, schema, generate
from src.routers import database_info  # Add import
from src.routers import databases      # Add import

# Include routers
app.include_router(health.router, prefix=api_prefix, tags=["system"])
app.include_router(schema.router, prefix=api_prefix + "/database", tags=["database"])
app.include_router(generate.router, prefix=api_prefix + "/generate", tags=["generate"])
app.include_router(database_info.router, prefix=api_prefix + "/database", tags=["database"])
app.include_router(databases.router, prefix=api_prefix + "/databases", tags=["database"])
```

### 2. `api-collection/`

Add new endpoint files:
- `api-collection/info.yml`
- `api-collection/databases.yml`

Update existing files with response examples.

### 3. `frontend/src/lib/api.ts`

Add types and functions for new endpoints.

### 4. Documentation Files

- `README.md` — Update API table
- `docs/PRD.md` — Add new features
- `docs/ARCHITECTURE.md` — Add new flow diagram

---

## Testing in Bruno

After implementation:

1. Open `api-collection` folder in Bruno
2. Select first endpoint (`health`) and hit it
3. Verify response body appears in response tab
4. Proceed through all endpoints to verify responses
5. Confirm all visualizations work correctly

---

## Implementation Order

1. **Phase 1** — Create `database_info.py` router
2. **Phase 2** — Create `databases.py` router
3. **Phase 3** — Update `main.py` to include new routers
4. **Phase 4** — Update `api-collection` YAML files
5. **Phase 5** — Update `frontend/src/lib/api.ts` with new types
6. **Phase 6** — Update documentation
7. **Phase 7** — Test all endpoints and verify in Bruno

---

*Created: 2026-04-18*
