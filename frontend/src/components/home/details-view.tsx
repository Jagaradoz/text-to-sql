import React from "react";
import { highlightSql } from "@/lib/sql-utils";

interface DetailsViewProps {
  explanation: string;
  sql: string;
}

export function DetailsView({ explanation, sql }: DetailsViewProps) {
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
