import React from "react";
import { highlightSql } from "@/lib/sql-utils";

interface DetailsViewProps {
  explanation: string;
  sql: string;
}

export function DetailsView({ explanation, sql }: DetailsViewProps) {
  return (
    <div className="flex flex-col gap-6 px-5">
      <div className="scroll-thin overflow-auto">
        <p className="mb-3 text-base font-bold text-muted-foreground">
          Generated SQL
        </p>
        <pre className="overflow-x-auto rounded border border-border bg-secondary/30 p-4 text-sm leading-7">
          <code>{highlightSql(sql)}</code>
        </pre>
      </div>
      <div className="scroll-thin overflow-auto">
        <p className="mb-3 text-base font-bold text-muted-foreground">
          Explanation
        </p>
        <div className="p-4 text-sm leading-7 text-muted-foreground">
          {explanation || "No explanation was returned by the backend."}
        </div>
      </div>
    </div>
  );
}
