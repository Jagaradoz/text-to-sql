# Product Requirements Document (PRD)
## Text-to-SQL Web Application

### 1. Vision & Overview
The product vision is to democratize data access by allowing business stakeholders, analysts, and non-technical users to query complex relational databases using natural language. Instead of waiting on data teams to write custom SQL queries, users receive instant, accurate, and visual answers. This application serves as a bridge between AI intent and core business data.

### 2. Target Users
- **Business Analysts:** Needing quick answers without writing complex JOINs.
- **Non-technical Stakeholders:** Seeking insights into business metrics (sales, users, products).
- **Administrators:** Needing visibility into query histories and data usage.

### 3. Core Features
1. **Natural Language Interface:** Accept plain-English business questions.
2. **Text-to-SQL Conversion:** Leverage LLMs to generate accurate SQL queries tailored to the current schema.
3. **Execution & Results:** Safely execute generated SQL on a PostgreSQL database and return structured results.
4. **Data Visualization:** Dynamically generate relevant charts (bar, line, pie) based on the data shape returned.
5. **Query Explainability:** Provide a natural language summary of what the generated SQL query does.
6. **Query History:** Log user questions, generated SQL, and execution status for auditability and reuse.
7. **"Demo" Sandbox:** Support a frictionless, pre-populated mock database experience for immediate utilization.

### 4. System Architecture
The application utilizes a decoupled, modern architecture:
- **Frontend Layer:** Next.js (App Router), Tailwind CSS, Shadcn UI, Zustand (state), Recharts (visualization).
- **Backend Layer:** FastAPI (Python), SQLAlchemy (ORM), Uvicorn.
- **AI/LLM Layer:** LangChain (orchestration), OpenAI API (gpt-4o or gpt-3.5-turbo).
- **Data Layer:** PostgreSQL as the primary database.

### 5. Database Schema Design (E-Commerce Use Case)
The initial schema focuses on a representative e-commerce model that naturally supports complex JOINs and aggregations:
- `users`: id, name, email, signup_date, country
- `products`: id, name, category, price, stock
- `orders`: id, user_id, order_date, status, total_amount
- `order_items`: id, order_id, product_id, quantity, unit_price

### 6. Security and SQL Safety Validation
Because executing LLM-generated SQL inherently introduces risk, safety is mandated through a three-layer validation system:
1. **Prompt Level Constraints:** Instruct the LLM to strictly output `SELECT` statements only.
2. **AST/Middleware Validation:** Before execution, parse the incoming SQL in FastAPI. Reject any query containing mutations (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `EXEC`).
3. **Database-Level Failsafe (Crucial):** All user queries must be executed using a highly restricted, **Read-Only** PostgreSQL role (e.g., `db_reader`).

### 7. AI Prompt Strategy
Effective Text-to-SQL relies heavily on context injection. The core system prompt will adhere to the following principles:
- **Schema Injection:** Dynamically supply table structures, column definitions, and foreign key relationships.
- **Role and Constraints:** Define the LLM as an expert DBA, restricting it from making DML statements or referencing non-existent tables.
- **Output Format:** Require the LLM to yield exclusively the raw SQL string without markdown formatting to enable direct parsing.
- **Few-Shot Prompting:** Optionally provide examples of complex aggregations to guide the model.

### 8. Core API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check |
| `GET` | `/api/database/schema` | Retrieves table schemas to populate the UI |
| `POST` | `/api/query/generate` | Accepts natural language; returns SQL, Explanation, Data, and Chart Config |

### 9. User Interface Design Requirements
- **Dashboard:** Features a prominent search bar optimized for natural language, accompanied by a collapsible schema viewer to inform the user of available data.
- **Results Pane:** Tabbed interface separating the Data Table, Chart Visualizations, the Underlying SQL, and the Plain English Explanation.
- **Interactive Loading States:** Provide contextual feedback ("Analyzing schema..." -> "Writing SQL..." -> "Running query...") while the LLM generates the query.
- **Graceful Error Handling:** In the event of a malformed SQL query, catch the database error gracefully, and automatically prompt the AI with the error trace to attempt a syntax correction.
