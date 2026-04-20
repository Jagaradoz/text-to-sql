"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { normalizeRows } from "@/lib/format-utils";
import { Hero } from "@/components/home/hero";
import { QueryForm } from "@/components/home/query-form";
import { ResultsPanel } from "@/components/home/results-panel";
import { Sparkles } from "lucide-react";

const PAGE_SIZE = 8;

export default function Home() {
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const activeResult = useAppStore((state) => state.activeResult);
  const getDatabases = useAppStore((state) => state.getDatabases);
  const submitGenerate = useAppStore((state) => state.submitGenerate);
  const resetError = useAppStore((state) => state.resetError);
  const activeModel = useAppStore((state) => state.activeModel);
  const provider = useAppStore((state) => state.provider);
  const apiKey = useAppStore((state) => state.apiKey);

  const [input, setInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void getDatabases();
  }, [getDatabases]);

  const rows = useMemo(() => normalizeRows(activeResult?.data), [activeResult?.data]);
  const tableColumns = useMemo(
    () => (rows.length > 0 ? Object.keys(rows[0]) : []),
    [rows],
  );

  const totalPages = activeResult?.meta?.total_pages ?? Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [currentPage, rows]);

  const handleSubmit = async (promptText?: string) => {
    const nextPrompt = (promptText ?? input).trim();
    if (!nextPrompt || isLoading) return;
    resetError();
    setInput(nextPrompt);
    setCurrentPage(1);
    // Extra params are handled inside store.submitGenerate
    await submitGenerate({ prompt: nextPrompt });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="space-y-10">
      <div className="relative">
        <Hero />
      </div>

      <QueryForm
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={onSubmit}
        error={error}
        provider={provider}
        activeModel={activeModel}
        apiKey={apiKey}
      />

      {/* Results section */}
      <div className="space-y-4">
        {/* <div className="mt-15">
          <h2 className="text-2xl font-bold">Results</h2>
        </div> */}
        <ResultsPanel
          activeResult={activeResult}
          currentPage={currentPage}
          isLoading={isLoading}
          paginatedRows={paginatedRows}
          rows={rows}
          setCurrentPage={setCurrentPage}
          tableColumns={tableColumns}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
