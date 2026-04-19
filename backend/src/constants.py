# Application
API_PREFIX = "/api"

# Database / Pagination
DEFAULT_PAGE_SIZE = 50           # Standard page size for all endpoints
MAX_RECORDS_LIMIT = 500          # Cap on paginated table records (inspect endpoint)

# AI / Generate
GENERATE_LIMIT = 50              # Fixed cap for generated query results
AGENT_QUERY_LIMIT = 200          # Cap on agent SQL query results (LangChain tool)
MAX_SQL_CONTENT_CHARS = 50_000   # Max SQL script size for AI schema analysis

# Upload
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB max file upload size

# Seed Data
DEFAULT_TABLE_METADATA = [
    {"table_name": "users", "description": "Stores user account information such as name, email, and country."},
    {"table_name": "products", "description": "Product catalog with pricing, category, and stock levels."},
    {"table_name": "orders", "description": "Customer orders with status tracking and total amounts."},
]
