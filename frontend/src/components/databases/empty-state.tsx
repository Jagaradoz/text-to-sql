import { Database, ServerCrash } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border bg-card/50 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary">
        <ServerCrash className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">No databases found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The backend did not return any connected databases.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-4 py-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Connect a database via the backend configuration
        </span>
      </div>
    </div>
  );
}
