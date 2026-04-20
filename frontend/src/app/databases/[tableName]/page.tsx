"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { fetchTableRecords } from "@/lib/api";
import { TableRecordsResponse } from "@/types/api";
import { formatCellValue } from "@/lib/format-utils";
import { useAppStore } from "@/store/useAppStore";

export default function TableInspectPage({ params }: { params: Promise<{ tableName: string }> }) {
  const { tableName } = use(params);
  const decodedTableName = decodeURIComponent(tableName);

  const databases = useAppStore((state) => state.databases);
  const getDatabases = useAppStore((state) => state.getDatabases);
  
  const dbInfo = databases.find((db) => db.name === decodedTableName);
  const tableDescription = dbInfo?.description || "";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TableRecordsResponse | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Fetch database list if missing (e.g. on hard refresh)
  useEffect(() => {
    if (databases.length === 0) {
      void getDatabases();
    }
  }, [databases.length, getDatabases]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchTableRecords(decodedTableName, currentPage, pageSize);
        if (isMounted) {
          setData(response);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || "Failed to load table records.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [decodedTableName, currentPage, pageSize]);

  // Compute table columns dynamically from the first row of data
  const tableColumns = useMemo(() => {
    if (!data || data.data.length === 0) return [];
    return Object.keys(data.data[0]);
  }, [data]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="pt-10">
        <Link
          href="/databases"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Databases
        </Link>
        <h1 className="text-3xl font-black leading-none sm:text-4xl uppercase tracking-tight">
          {decodedTableName}
        </h1>
        <p className="mt-3 font-medium text-muted-foreground/70">
          {tableDescription}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {isLoading && !data ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Loading records...
            </p>
          </div>
        ) : error ? (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center rounded border border-border bg-card">
            <p className="text-sm text-muted-foreground">This table is empty.</p>
          </div>
        ) : data ? (
          <div className="flex flex-col rounded-md border border-border bg-card">
            {/* Table Header Info */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-secondary/30">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Table Data
              </p>
              <p className="text-xs text-muted-foreground">
                Page {data.meta.page} of {data.meta.total_pages} ({data.meta.total_records} total records)
              </p>
            </div>

            {/* Table Container */}
            <div className="scroll-thin overflow-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-card">
                  <tr>
                    {tableColumns.map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.data.map((row, i) => (
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-secondary/30">
              <p className="text-xs text-muted-foreground">
                Showing {(data.meta.page - 1) * data.meta.limit + 1}–{Math.min(data.meta.page * data.meta.limit, data.meta.total_records)} of {data.meta.total_records}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="rounded border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(data.meta.total_pages, currentPage + 1))}
                  disabled={currentPage === data.meta.total_pages || isLoading}
                  className="rounded border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}