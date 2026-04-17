import Link from "next/link";
import { Database } from "lucide-react";
import type { DatabaseItem } from "@/lib/api";

function formatLastQueried(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const STATUS_CONFIG = {
  connected: {
    dot: "bg-emerald-400",
    label: "CONNECTED",
    labelClass: "text-emerald-400",
  },
  syncing: {
    dot: "bg-amber-400",
    label: "SYNCING",
    labelClass: "text-amber-400",
  },
  error: {
    dot: "bg-red-400",
    label: "ERROR",
    labelClass: "text-red-400",
  },
} as const;

export function DatabaseCard({ db }: { db: DatabaseItem }) {
  const status = STATUS_CONFIG[db.status] ?? STATUS_CONFIG.connected;

  return (
    <div className="flex items-center gap-5 rounded-md border border-border bg-card px-5 py-5">
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
        <Database className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold uppercase tracking-wide">{db.name}</p>
          <span className="rounded border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {db.type}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{db.description}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
          <span className={`flex items-center gap-1.5 font-semibold ${status.labelClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-muted-foreground">
            LAST QUERIED: {formatLastQueried(db.last_queried_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="rounded border border-border bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition hover:bg-secondary"
        >
          Settings
        </button>
        <Link
          href={`/?db=${String(db.id)}`}
          className="inline-flex items-center gap-1.5 rounded bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
        >
          Query Now →
        </Link>
      </div>
    </div>
  );
}
