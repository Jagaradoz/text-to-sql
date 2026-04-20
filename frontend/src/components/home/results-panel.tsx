import React from "react";
import { Database, LoaderCircle } from "lucide-react";
import { GenerateResponse } from "@/types/api";
import { DataView } from "./data-view";
import { DetailsView } from "./details-view";

interface ResultsPanelProps {
  activeResult: GenerateResponse | null;
  currentPage: number;
  isLoading: boolean;
  paginatedRows: Record<string, unknown>[];
  rows: Record<string, unknown>[];
  setCurrentPage: (page: number) => void;
  tableColumns: string[];
  totalPages: number;
  pageSize: number;
}

export function ResultsPanel({
  activeResult,
  currentPage,
  isLoading,
  paginatedRows,
  rows,
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
    <div className="space-y-6">
      <div className="min-h-[260px] space-y-3">
        <p className="px-5 text-base font-bold text-muted-foreground">
          Table
        </p>
        <div className="px-5">
          <DataView
            currentPage={currentPage}
            paginatedRows={paginatedRows}
            rows={rows}
            setCurrentPage={setCurrentPage}
            tableColumns={tableColumns}
            totalPages={totalPages}
            pageSize={pageSize}
          />
        </div>
      </div>

      {activeResult && (
        <DetailsView explanation={activeResult.explanation} sql={activeResult.sql} />
      )}
    </div>
  );
}
