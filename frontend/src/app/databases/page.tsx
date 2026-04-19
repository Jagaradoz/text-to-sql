"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DatabaseCard } from "@/components/databases/database-card";
import { EmptyState } from "@/components/databases/empty-state";

export default function DatabasesPage() {
  const databases = useAppStore((state) => state.databases);
  const isLoading = useAppStore((state) => state.isLoading);
  const getDatabases = useAppStore((state) => state.getDatabases);

  useEffect(() => {
    void getDatabases();
  }, [getDatabases]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            Databases
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage your connected data sources.
          </p>
        </div>
      </div>

      <hr className="border-border" />

      {/* Content area */}
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading databases…</p>
        </div>
      ) : databases.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {databases.map((db) => (
            <DatabaseCard key={db.name} db={db} />
          ))}
        </div>
      )}
    </div>
  );
}
