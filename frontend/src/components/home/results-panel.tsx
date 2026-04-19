import React from "react";
import { Database, LoaderCircle } from "lucide-react";
import { GenerateResponse } from "@/types/api";
import { TabKey } from "@/types/home";
import { DataView } from "./data-view";
import { VisualizationView } from "./visualization-view";
import { DetailsView } from "./details-view";

interface ResultsPanelProps {
  activeResult: GenerateResponse | null;
  activeTab: TabKey;
  currentPage: number;
  isLoading: boolean;
  paginatedRows: Record<string, unknown>[];
  rows: Record<string, unknown>[];
  setActiveTab: (tab: TabKey) => void;
  setCurrentPage: (page: number) => void;
  tableColumns: string[];
  totalPages: number;
  pageSize: number;
}

export function ResultsPanel({
  activeResult,
  activeTab,
  currentPage,
  isLoading,
  paginatedRows,
  rows,
  setActiveTab,
  setCurrentPage,
  tableColumns,
  totalPages,
  pageSize,
}: ResultsPanelProps) {
  /* Empty / awaiting state */
  if (!activeResult && !isLoading) {
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
            {tab === "data" ? "Data View" : tab === "visualization" ? "Visualization" : "Details"}
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
            pageSize={pageSize}
          />
        )}
        {activeTab === "visualization" && activeResult && (
          <VisualizationView chartConfig={activeResult.chart_config} rows={rows} />
        )}
        {activeTab === "details" && activeResult && (
          <DetailsView explanation={activeResult.explanation} sql={activeResult.sql} />
        )}
      </div>
    </div>
  );
}
