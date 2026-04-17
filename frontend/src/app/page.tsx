"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Database,
  LoaderCircle,
  MessageSquare,
  RefreshCcw,
  Send,
  Sparkles,
  TableProperties,
} from "lucide-react";
import { ChartConfig, HistoryItem, QueryResponse, TableSchema } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

const QUICK_SUGGESTIONS = [
  "Top 5 products by revenue",
  "Monthly order growth",
  "Users from USA",
];

const PAGE_SIZE = 8;
const SQL_KEYWORDS = new Set([
  "select",
  "from",
  "where",
  "group",
  "by",
  "order",
  "limit",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "on",
  "as",
  "and",
  "or",
  "count",
  "sum",
  "avg",
  "min",
  "max",
  "distinct",
  "having",
  "case",
  "when",
  "then",
  "else",
  "end",
  "desc",
  "asc",
]);

type TabKey = "data" | "visualization" | "details";

export default function Home() {
  const schema = useAppStore((state) => state.schema);
  const history = useAppStore((state) => state.history);
  const activeQuery = useAppStore((state) => state.activeQuery);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const getSchema = useAppStore((state) => state.getSchema);
  const getHistory = useAppStore((state) => state.getHistory);
  const submitQuery = useAppStore((state) => state.submitQuery);
  const resetError = useAppStore((state) => state.resetError);

  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("data");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void getSchema();
    void getHistory();
  }, [getHistory, getSchema]);

  const rows = useMemo(() => normalizeRows(activeQuery?.data), [activeQuery]);
  const tableColumns = useMemo(
    () => (rows.length > 0 ? Object.keys(rows[0]) : []),
    [rows],
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [currentPage, rows]);

  const handleSubmit = async (queryText?: string) => {
    const nextQuery = (queryText ?? input).trim();
    if (!nextQuery || isLoading) {
      return;
    }

    resetError();
    setInput(nextQuery);
    setCurrentPage(1);
    setActiveTab("data");
    await submitQuery(nextQuery);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0))]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar
          schema={schema}
          history={history}
          isLoading={isLoading}
          onRefresh={() => {
            void getSchema();
            void getHistory();
          }}
          onReuseQuery={(query) => {
            setInput(query);
            void handleSubmit(query);
          }}
        />

        <main className="flex h-full min-h-0 flex-col overflow-hidden border-t border-border/60 lg:border-l lg:border-t-0">
          <section className="border-b border-border/60 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Phase 5 Dashboard
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Ask questions, inspect the SQL, and explore the result set.
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                      Natural language in, schema-aware SQL out. The workspace updates with raw rows,
                      visualization hints, and query details from the backend agent.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-[0_20px_80px_-40px_rgba(255,255,255,0.3)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Model Status
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.7)]" />
                        GPT-4o Connected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-r from-primary/25 via-white/8 to-transparent opacity-80 blur-lg" />
                  <div className="relative rounded-[24px] border border-border/70 bg-card/95 p-3 shadow-2xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                        <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <input
                          value={input}
                          onChange={(event) => setInput(event.target.value)}
                          placeholder="e.g. Total revenue by month for the last year..."
                          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || input.trim().length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Generating
                          </>
                        ) : (
                          <>
                            Run Query
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => {
                        setInput(tip);
                        void handleSubmit(tip);
                      }}
                      className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-secondary/80 hover:text-foreground"
                    >
                      {tip}
                    </button>
                  ))}
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}
              </form>
            </div>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden px-6 py-6 sm:px-8">
            <ResultsWorkspace
              activeQuery={activeQuery}
              activeTab={activeTab}
              currentPage={currentPage}
              isLoading={isLoading}
              paginatedRows={paginatedRows}
              rows={rows}
              setActiveTab={setActiveTab}
              setCurrentPage={setCurrentPage}
              tableColumns={tableColumns}
              totalPages={totalPages}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  history,
  isLoading,
  onRefresh,
  onReuseQuery,
  schema,
}: {
  history: HistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onReuseQuery: (query: string) => void;
  schema: TableSchema[];
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border/60 bg-card/70 backdrop-blur lg:border-b-0">
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Data Assistant</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Schema + History
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-xl border border-border/60 bg-secondary/60 p-2 text-muted-foreground transition hover:text-foreground"
            aria-label="Refresh sidebar data"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="scroll-thin flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Database Schema
            </h3>
          </div>
          <div className="space-y-3">
            {schema.length === 0 ? (
              <EmptySidebarState label="No schema loaded yet." />
            ) : (
              schema.map((table) => (
                <div
                  key={table.table_name}
                  className="rounded-2xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{table.table_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {table.columns.length} columns
                      </p>
                    </div>
                    <span className="rounded-full border border-border/60 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {table.foreign_keys.length} fk
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {table.columns.map((column) => (
                      <div
                        key={`${table.table_name}-${column.name}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-card/70 px-3 py-2 text-xs"
                      >
                        <span className="font-medium">{column.name}</span>
                        <span className="text-muted-foreground">{column.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <TableProperties className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Query History
            </h3>
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <EmptySidebarState label="No saved queries yet." />
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onReuseQuery(item.natural_language_query)}
                  className="block w-full rounded-2xl border border-border/60 bg-background/60 p-4 text-left transition hover:border-primary/30 hover:bg-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${
                        item.execution_status === "SUCCESS"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {item.execution_status}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-medium">
                    {item.natural_language_query}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {item.generated_sql}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

function EmptySidebarState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function ResultsWorkspace({
  activeQuery,
  activeTab,
  currentPage,
  isLoading,
  paginatedRows,
  rows,
  setActiveTab,
  setCurrentPage,
  tableColumns,
  totalPages,
}: {
  activeQuery: QueryResponse | null;
  activeTab: TabKey;
  currentPage: number;
  isLoading: boolean;
  paginatedRows: Record<string, unknown>[];
  rows: Record<string, unknown>[];
  setActiveTab: (tab: TabKey) => void;
  setCurrentPage: (page: number) => void;
  tableColumns: string[];
  totalPages: number;
}) {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-border/60 bg-card/90 shadow-[0_30px_120px_-60px_rgba(255,255,255,0.25)]">
      <div className="border-b border-border/60 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "data", label: "Data View" },
            { key: "visualization", label: "Visualization" },
            { key: "details", label: "Query Details" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isLoading ? <LoadingOverlay /> : null}

        {!activeQuery ? (
          <EmptyWorkspace />
        ) : (
          <>
            {activeTab === "data" ? (
              <DataView
                currentPage={currentPage}
                paginatedRows={paginatedRows}
                rows={rows}
                setCurrentPage={setCurrentPage}
                tableColumns={tableColumns}
                totalPages={totalPages}
              />
            ) : null}

            {activeTab === "visualization" ? (
              <VisualizationView chartConfig={activeQuery.chart_config} rows={rows} />
            ) : null}

            {activeTab === "details" ? (
              <QueryDetailsView
                explanation={activeQuery.explanation}
                sql={activeQuery.sql}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="rounded-3xl border border-border/60 bg-background/50 px-8 py-10">
        <Sparkles className="mx-auto h-10 w-10 text-primary/70" />
        <h3 className="mt-5 text-xl font-semibold">Workspace ready</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Run a natural-language query to populate the data table, generate a chart, and inspect
          the SQL that powers the result.
        </p>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/65 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold">Generating query and fetching data</p>
            <p className="text-xs text-muted-foreground">
              The assistant is building SQL, running it safely, and preparing the workspace.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 animate-pulse rounded-full bg-secondary/80" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-secondary/70" />
          <div className="h-36 animate-pulse rounded-[24px] bg-secondary/60" />
        </div>
      </div>
    </div>
  );
}

function DataView({
  currentPage,
  paginatedRows,
  rows,
  setCurrentPage,
  tableColumns,
  totalPages,
}: {
  currentPage: number;
  paginatedRows: Record<string, unknown>[];
  rows: Record<string, unknown>[];
  setCurrentPage: (page: number) => void;
  tableColumns: string[];
  totalPages: number;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
        The query completed, but no rows were returned.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-sm font-semibold">Raw Result Set</p>
          <p className="text-xs text-muted-foreground">
            {rows.length} rows across {tableColumns.length} columns
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="sticky top-0 bg-card/95 backdrop-blur">
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedRows.map((row, index) => (
              <tr key={`row-${currentPage}-${index}`} className="hover:bg-background/60">
                {tableColumns.map((column) => (
                  <td key={`${column}-${index}`} className="px-5 py-3 align-top text-muted-foreground">
                    <span className="text-foreground">{formatCellValue(row[column])}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function VisualizationView({
  chartConfig,
  rows,
}: {
  chartConfig: ChartConfig;
  rows: Record<string, unknown>[];
}) {
  const resolvedChart = useMemo(() => getResolvedChart(rows, chartConfig), [chartConfig, rows]);

  if (!resolvedChart) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Not enough structured numeric data to render a chart for this result set.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold">Visualization</p>
        <p className="text-xs text-muted-foreground">
          {resolvedChart.type.toUpperCase()} chart using <span className="text-foreground">{resolvedChart.xAxis}</span> on X and{" "}
          <span className="text-foreground">{resolvedChart.yAxis}</span> on Y.
        </p>
      </div>
      <div className="min-h-0 flex-1 p-5">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(resolvedChart)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function QueryDetailsView({
  explanation,
  sql,
}: {
  explanation: string;
  sql: string;
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="scroll-thin min-h-0 overflow-auto border-b border-border/60 p-5 lg:border-b-0 lg:border-r">
        <p className="text-sm font-semibold">Generated SQL</p>
        <pre className="mt-4 overflow-x-auto rounded-[24px] border border-border/60 bg-background/70 p-5 text-sm leading-7">
          <code>{highlightSql(sql)}</code>
        </pre>
      </div>
      <div className="scroll-thin min-h-0 overflow-auto p-5">
        <p className="text-sm font-semibold">AI Explanation</p>
        <div className="mt-4 rounded-[24px] border border-border/60 bg-background/70 p-5 text-sm leading-7 text-muted-foreground">
          {explanation || "No explanation was returned by the backend."}
        </div>
      </div>
    </div>
  );
}

function renderChart(chart: ResolvedChart) {
  const { type, rows, xAxis, yAxis } = chart;

  if (type === "line") {
    return (
      <LineChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey={xAxis} stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 16 }}
        />
        <Line type="monotone" dataKey={yAxis} stroke="#f5f5f5" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    );
  }

  if (type === "pie") {
    return (
      <PieChart>
        <Tooltip
          contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 16 }}
        />
        <Pie data={rows} dataKey={yAxis} nameKey={xAxis} innerRadius={70} outerRadius={110} paddingAngle={3}>
          {rows.map((entry, index) => (
            <Cell
              key={`cell-${String(entry[xAxis])}-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return (
    <BarChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
      <XAxis dataKey={xAxis} stroke="#a1a1aa" tickLine={false} axisLine={false} />
      <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
      <Tooltip
        contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 16 }}
      />
      <Bar dataKey={yAxis} radius={[10, 10, 0, 0]} fill="#e5e7eb" />
    </BarChart>
  );
}

const PIE_COLORS = ["#f4f4f5", "#a1a1aa", "#71717a", "#d4d4d8", "#52525b", "#e4e4e7"];

interface ResolvedChart {
  rows: Record<string, unknown>[];
  type: "bar" | "line" | "pie";
  xAxis: string;
  yAxis: string;
}

function getResolvedChart(
  rows: Record<string, unknown>[],
  chartConfig: ChartConfig,
): ResolvedChart | null {
  if (rows.length === 0) {
    return null;
  }

  const columns = Object.keys(rows[0]);
  const numericColumns = columns.filter((column) =>
    rows.some((row) => isNumberLike(row[column])),
  );
  const categoricalColumns = columns.filter((column) => !numericColumns.includes(column));

  const yAxis = numericColumns.includes(chartConfig.y_axis)
    ? chartConfig.y_axis
    : numericColumns[0];
  const xAxis = columns.includes(chartConfig.x_axis)
    ? chartConfig.x_axis
    : categoricalColumns[0] ?? columns[0];

  if (!xAxis || !yAxis) {
    return null;
  }

  const type = resolveChartType(chartConfig.type, rows, xAxis, yAxis);
  return {
    rows: rows.map((row) => ({
      ...row,
      [yAxis]: toChartNumber(row[yAxis]),
    })),
    type,
    xAxis,
    yAxis,
  };
}

function resolveChartType(
  type: string,
  rows: Record<string, unknown>[],
  xAxis: string,
  yAxis: string,
): "bar" | "line" | "pie" {
  if (type === "line" || type === "bar" || type === "pie") {
    return type;
  }

  if (rows.length <= 6 && isNumberLike(rows[0][yAxis]) && typeof rows[0][xAxis] === "string") {
    return "pie";
  }

  return "bar";
}

function normalizeRows(data: QueryResponse["data"] | undefined): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
  }

  return [];
}

function isNumberLike(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return value.trim().length > 0 && Number.isFinite(parsed);
  }

  return false;
}

function toChartNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function highlightSql(sql: string) {
  return sql.split(/(\s+|\b)/).map((part, index) => {
    const normalized = part.toLowerCase();

    if (SQL_KEYWORDS.has(normalized)) {
      return (
        <span key={`${part}-${index}`} className="font-semibold text-sky-300">
          {part}
        </span>
      );
    }

    if (/^'.*'$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="text-emerald-300">
          {part}
        </span>
      );
    }

    if (/^\d+(\.\d+)?$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="text-amber-300">
          {part}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
