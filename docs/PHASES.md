# Development Phases & Folder Structure

## 1. Monorepo Folder Structure

```text
text-to-sql-app/
│
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # UI Components (Chat, Tables, Charts)
│   │   ├── lib/              # API utilities, constants
│   │   └── store/            # Zustand state
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                  # FastAPI App
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, security, DB connections
│   │   ├── models/           # SQLAlchemy DB definitions
│   │   ├── services/         # LangChain & OpenAI logic
│   │   └── main.py           # FastAPI entrypoint
│   └── requirements.txt
│
└── docker-compose.yml        # PostgreSQL Local Environment
```

---

## 2. Step-by-Step Development Plan

### Phase 1: Database Foundation & Environment Setup
**Goal:** Establish the PostgreSQL database and scaffolding of the repository.
- Initialize the monorepo structure.
- Configure `docker-compose.yml` to spin up a local PostgreSQL instance.
- Define initialization scripts to bootstrap the mock E-Commerce schema (Users, Products, Orders, Order Items).
- Seed the database with realistic mock data to facilitate testing.
- Create technical users specifically for the application, ensuring a `db_reader` role is scoped to query execution.

### Phase 2: FastAPI Backend Core
**Goal:** Build the backend infrastructure capable of handling database interactions APIs.
- Set up FastAPI, configure Uvicorn, and structure the router patterns.
- Initialize SQLAlchemy and configure database adapters mapping to standard operations and user query operations.
- Build the data retrieval layer to fetch and format the database schema logically.
- Implement foundational CRUD endpoints, like fetching query history (persisted locally) and testing database status.

### Phase 3: AI Translation & Safety Service
**Goal:** Implement the LangChain orchestrator and safeguard constraints.
- Integrate the OpenAI API using LangChain abstractions.
- Design the System Prompt dynamically injecting the schema contexts.
- Develop the AST Validation / Regex middleware function to intercept incoming SQL strings and verify they are strictly `SELECT` statements.
- Build the primary `POST /api/v1/query/generate` endpoint that ties prompt generation to safe PostgreSQL execution.
- Optional addition: Implement a self-correcting loop wherein if an execution error occurs, the trace is passed back to the LLM to correct the query automatically once.

### Phase 4: Next.js Frontend Scaffolding
**Goal:** Create a visually modern, performant React application using Next.js.
- Scaffold the Next.js App Router workspace, installing Shadcn UI components and configuring Tailwind CSS parameters (typography, dark mode).
- Formulate the application layout consisting of a Navigation sidebar (schema reference & historical log) and the primary workspace window.
- Abstract API configurations into reusable Fetch/Axios wrappers for interacting with the local FastAPI instance.
- Define application-wide Zustand stores for caching schema context, active outputs, and history states.

### Phase 5: Visualizations & Interactive UI
**Goal:** Bring the data back to life using rich charting and tabular data components.
- Develop rich, paginated data table components using a performant grid standard (like TanStack Table) capable of handling undefined row lengths.
- Integrate Recharts to generate bar, line, or pie visualization components.
- Construct the primary results UI containing tabs: [Data View, Chart Visualization, Query Details, Explanation View].
- Interlock components to the backend data streams ensuring visualizations respect the varying shape of dynamic results.

### Phase 6: Polish and Edge-cases
**Goal:** Ensure enterprise-grade polish and fault tolerance.
- **Empty States:** Add intuitive, descriptive starting pages providing users "suggested prompts" to query.
- **Error Boundaries:** Show rich error messaging gracefully preventing application crashes on missing data or broken API boundaries. 
- **Loading Sequences:** Provide stepped text loaders to indicate granular progress (`Reading Schema` > `Writing SQL` > `Fetching Data`).
- **Telemetry/Logs:** Log failed generative events cleanly to standardize future prompt optimization pipelines.
