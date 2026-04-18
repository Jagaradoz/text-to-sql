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
import { Database, LoaderCircle, Send } from "lucide-react";
import { ChartConfig, QueryResponse } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

const PAGE_SIZE = 8;
const SQL_KEYWORDS = new Set([
  "select", "from", "where", "group", "by", "order", "limit", "join",
  "left", "right", "inner", "outer", "on", "as", "and", "or", "count",
  "sum", "avg", "min", "max", "distinct", "having", "case", "when",
  "then", "else", "end", "desc", "asc",
]);

type TabKey = "data" | "visualization" | "details";

export default function Home() {
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const activeQuery = useAppStore((state) => state.activeQuery);
  const getSchema = useAppStore((state) => state.getSchema);
  const submitQuery = useAppStore((state) => state.submitQuery);
  const resetError = useAppStore((state) => state.resetError);

  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("data");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void getSchema();
  }, [getSchema]);

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
    if (!nextQuery || isLoading) return;
    resetError();
    setInput(nextQuery);
    setCurrentPage(1);
    setActiveTab("data");
    await submitQuery(nextQuery);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="space-y-10">
      {/* Hero heading */}
      <div className="text-center pt-10">
        <h1 className="text-4xl font-black leading-none sm:text-5xl">
          Ask Your Database
        </h1>
        <p className="mt-6 text- font-medium text-muted-foreground/70">
          Generate SQL queries and visualize insights using natural language.
        </p>
      </div>

      {/* Query box */}
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-4 gap-4 items-start">
          <div className="col-span-3 flex flex-col gap-2">
            <div className="rounded-md border border-border bg-card px-4 py-3 transition-focus focus-within:ring-1 focus-within:ring-ring">
              <input
                id="query-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="Show total revenue by product category..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="ml-1 text-[11px] font-medium tracking-wider text-neutral-500">
              Press {typeof window !== "undefined" && navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Enter to run
            </p>
          </div>

          <button
            id="execute-btn"
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            className="col-span-1 inline-flex h-[46px] items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-bold uppercase tracking-widest text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Running
              </>
            ) : (
              <>
                Execute
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}
      </form>

      {/* Results section */}
      <div className="space-y-4">
        <div className="mt-15">
          <h2 className="text-2xl font-bold">
            Results
          </h2>
          {/* <div className="h-px mt-3 w-full bg-border/100" /> */}
        </div>
        <ResultsPanel
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
      </div>
    </div>
  );
}

/* ─── Results Panel ─────────────────────────────────────────────────────── */

function ResultsPanel({
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
  /* Empty / awaiting state */
  if (!activeQuery && !isLoading) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-md">
        <Database className="h-13 w-13 text-muted-foreground/50" />
        <p className="text-sm font-light">
          Your desired results will appear here
        </p>
      </div>
    );
  }

  /* Loading overlay */
  if (isLoading) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Finding answers…
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {(["data", "visualization", "details"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-widest transition ${activeTab === tab
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab === "data" ? "Data View" : tab === "visualization" ? "Visualization" : "Query Details"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[260px]">
        {activeTab === "data" && (
          <DataView
            currentPage={currentPage}
            paginatedRows={paginatedRows}
            rows={rows}
            setCurrentPage={setCurrentPage}
            tableColumns={tableColumns}
            totalPages={totalPages}
          />
        )}
        {activeTab === "visualization" && activeQuery && (
          <VisualizationView chartConfig={activeQuery.chart_config} rows={rows} />
        )}
        {activeTab === "details" && activeQuery && (
          <QueryDetailsView explanation={activeQuery.explanation} sql={activeQuery.sql} />
        )}
      </div>
    </div>
  );
}

/* ─── Data View ─────────────────────────────────────────────────────────── */

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
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        The query completed, but no rows were returned.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">
          {rows.length} rows · {tableColumns.length} columns
        </p>
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      <div className="scroll-thin overflow-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-card">
            <tr>
              {tableColumns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedRows.map((row, i) => (
              <tr key={`row-${currentPage}-${i}`} className="hover:bg-secondary/30">
                {tableColumns.map((col) => (
                  <td key={`${col}-${i}`} className="px-5 py-3 text-sm text-muted-foreground">
                    <span className="text-foreground">{formatCellValue(row[col])}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Visualization View ────────────────────────────────────────────────── */

function VisualizationView({ chartConfig, rows }: { chartConfig: ChartConfig; rows: Record<string, unknown>[] }) {
  const resolvedChart = useMemo(() => getResolvedChart(rows, chartConfig), [chartConfig, rows]);

  if (!resolvedChart) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Not enough structured numeric data to render a chart.
      </div>
    );
  }

  return (
    <div className="p-5">
      <p className="mb-4 text-xs text-muted-foreground">
        {resolvedChart.type.toUpperCase()} chart · X: <span className="text-foreground">{resolvedChart.xAxis}</span> · Y:{" "}
        <span className="text-foreground">{resolvedChart.yAxis}</span>
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(resolvedChart)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Query Details View ────────────────────────────────────────────────── */

function QueryDetailsView({ explanation, sql }: { explanation: string; sql: string }) {
  return (
    <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
      <div className="scroll-thin overflow-auto border-b border-border p-5 lg:border-b-0 lg:border-r">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Generated SQL
        </p>
        <pre className="overflow-x-auto rounded border border-border bg-secondary/30 p-4 text-sm leading-7">
          <code>{highlightSql(sql)}</code>
        </pre>
      </div>
      <div className="scroll-thin overflow-auto p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          AI Explanation
        </p>
        <div className="rounded border border-border bg-secondary/30 p-4 text-sm leading-7 text-muted-foreground">
          {explanation || "No explanation was returned by the backend."}
        </div>
      </div>
    </div>
  );
}

/* ─── Chart helpers (unchanged logic) ───────────────────────────────────── */

function renderChart(chart: ResolvedChart) {
  const { type, rows, xAxis, yAxis } = chart;

  if (type === "line") {
    return (
      <LineChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey={xAxis} stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 8 }} />
        <Line type="monotone" dataKey={yAxis} stroke="#f5f5f5" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    );
  }

  if (type === "pie") {
    return (
      <PieChart>
        <Tooltip contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 8 }} />
        <Pie data={rows} dataKey={yAxis} nameKey={xAxis} innerRadius={70} outerRadius={110} paddingAngle={3}>
          {rows.map((entry, index) => (
            <Cell key={`cell-${String(entry[xAxis])}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
      <Tooltip contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 8 }} />
      <Bar dataKey={yAxis} radius={[6, 6, 0, 0]} fill="#e5e7eb" />
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

function getResolvedChart(rows: Record<string, unknown>[], chartConfig: ChartConfig): ResolvedChart | null {
  if (rows.length === 0) return null;
  const columns = Object.keys(rows[0]);
  const numericColumns = columns.filter((col) => rows.some((row) => isNumberLike(row[col])));
  const categoricalColumns = columns.filter((col) => !numericColumns.includes(col));
  const yAxis = numericColumns.includes(chartConfig.y_axis) ? chartConfig.y_axis : numericColumns[0];
  const xAxis = columns.includes(chartConfig.x_axis) ? chartConfig.x_axis : categoricalColumns[0] ?? columns[0];
  if (!xAxis || !yAxis) return null;
  const type = resolveChartType(chartConfig.type, rows, xAxis, yAxis);
  return {
    rows: rows.map((row) => ({ ...row, [yAxis]: toChartNumber(row[yAxis]) })),
    type,
    xAxis,
    yAxis,
  };
}

function resolveChartType(type: string, rows: Record<string, unknown>[], xAxis: string, yAxis: string): "bar" | "line" | "pie" {
  if (type === "line" || type === "bar" || type === "pie") return type;
  if (rows.length <= 6 && isNumberLike(rows[0][yAxis]) && typeof rows[0][xAxis] === "string") return "pie";
  return "bar";
}

/* ─── Utility functions (unchanged) ─────────────────────────────────────── */

function normalizeRows(data: QueryResponse["data"] | undefined): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
  }
  return [];
}

function isNumberLike(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return value.trim().length > 0 && Number.isFinite(parsed);
  }
  return false;
}

function toChartNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function highlightSql(sql: string) {
  return sql.split(/(\s+|\b)/).map((part, index) => {
    const normalized = part.toLowerCase();
    if (SQL_KEYWORDS.has(normalized)) {
      return <span key={`${part}-${index}`} className="font-semibold text-sky-300">{part}</span>;
    }
    if (/^'.*'$/.test(part)) {
      return <span key={`${part}-${index}`} className="text-emerald-300">{part}</span>;
    }
    if (/^\d+(\.\d+)?$/.test(part)) {
      return <span key={`${part}-${index}`} className="text-amber-300">{part}</span>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
