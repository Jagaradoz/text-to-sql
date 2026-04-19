import Link from "next/link";
import { Database } from "lucide-react";
import type { DatabaseOverviewItem } from "@/types/api";

export function DatabaseCard({ db }: { db: DatabaseOverviewItem }) {
  return (
    <div className="flex items-center gap-5 rounded-md border border-border bg-card px-5 py-5">
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
        <Database className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold uppercase tracking-wide">{db.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{db.description}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/?table=${encodeURIComponent(db.name)}`}
          className="inline-flex items-center gap-1.5 rounded bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
        >
          Ask Now →
        </Link>
      </div>
    </div>
  );
}
