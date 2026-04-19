import React from "react";
import { formatCellValue } from "@/lib/format-utils";

interface DataViewProps {
  currentPage: number;
  paginatedRows: Record<string, unknown>[];
  rows: Record<string, unknown>[];
  setCurrentPage: (page: number) => void;
  tableColumns: string[];
  totalPages: number;
  pageSize: number;
}

export function DataView({
  currentPage,
  paginatedRows,
  rows,
  setCurrentPage,
  tableColumns,
  totalPages,
  pageSize,
}: DataViewProps) {
  if (rows.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        The generation completed, but no rows were returned.
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
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, rows.length)} of {rows.length}
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
