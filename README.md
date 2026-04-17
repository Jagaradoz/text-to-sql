# Text-to-SQL Data Assistant

A conversational AI data analysis system built on OpenAI function calling and PostgreSQL. Users query complex database metrics through natural chat instead of writing SQL. The AI interprets intent, fetches the schema, maps user requests to valid SQL, executes it securely, and guides the workflow from raw data to visualization.

## Features

- **Conversational Queries**: Ask business questions in English, get data instantly.
- **Parallel UI**: Right panel updates live from tool data — schema viewer, generated SQL, raw data tables, and dynamic charts.
- **Security-First**: Strict read-only database connections and AST query parsing prevent destructive operations.
- **Explainability**: Plain-English explanations of what the generated SQL query is actually doing.
- **Interactive Sandbox**: Ships with a pre-seeded mock E-Commerce schema (Users, Products, Orders) for immediate testing.

## Tools (Function Calling)

The AI operates as an agent with access to specific data tools:

| Tool | Purpose |
|------|---------|
| `get_database_schema` | Retrieves tables, columns, and relationships dynamically |
| `generate_sql_query` | Transforms natural language and schema context into a PostgreSQL query |
| `execute_sql_query` | Safely executes a verified SELECT statement against the database |
| `generate_visualization` | Creates a Recharts configuration based on the data shape |

## Tech Stack

| Technology | Role |
|------------|------|
| Python 3.10+ | Backend language |
| FastAPI | REST API framework |
| PostgreSQL | Core Data Engine (via Docker) |
| OpenAI API | Natural language understanding and tool calling |
| Next.js (App Router) | Frontend React Framework |
| TailwindCSS | Styling |
| shadcn/ui | Component primitives |
| Recharts | Data visualization |

## Project Structure

```
text-to-sql/
├── backend/
│   ├── ai/                # OpenAI Langchain logic, prompts, and tool definitions
│   ├── api/               # FastAPI routers (chat, schema, history)
│   ├── domain/            # SQL execution parsing, DB interactions, SQLAlchemy mappings
│   ├── core/              # Environment config, security middleware
└── frontend/
    └── src/
        ├── app/           # Root Next.js pages and layouts
        ├── features/      # Feature modules (chat, schema-viewer, data-grid, charts)
        └── shared/        # API client, UI components, state stores (Zustand)
```

## Evaluation Flow

**Context → Generate → Validate → Visualize**

Works via chat panel interaction:
- **Context**: System injects current database schema into AI tools.
- **Generate**: AI writes a SQL query based on the user's intent.
- **Validate**: Backend rigidly evaluates the query, preventing modifications, and runs it as `db_reader`.
- **Visualize**: Parallel UI renders the JSON payload into a data grid and relevant chart.

## API

**Base URL:** `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Main conversational endpoint. Returns `{ response, sql, data, tool_data }` |
| `GET`  | `/api/health` | Health check |
| `GET`  | `/api/schema` | Retrieves all tables and schemas for the UI / AI context |
| `POST` | `/api/reset` | Resets conversation session history |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Docker Desktop 
- OpenAI API key — [platform.openai.com](https://platform.openai.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/text-to-sql.git
   cd text-to-sql
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Set up the backend:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Start the backend:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Set up and start the frontend (new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Open `http://localhost:3000` and start chatting.
