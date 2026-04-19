import React from "react";

export const SQL_KEYWORDS = new Set([
  "select", "from", "where", "group", "by", "order", "limit", "join",
  "left", "right", "inner", "outer", "on", "as", "and", "or", "count",
  "sum", "avg", "min", "max", "distinct", "having", "case", "when",
  "then", "else", "end", "desc", "asc",
]);

export function highlightSql(sql: string) {
  return sql.split(/(\s+|\b)/).map((part, index) => {
    const normalized = part.toLowerCase();
    if (SQL_KEYWORDS.has(normalized)) {
      return (
        <span key={`${part}-${index}`} className="font-semibold text-sky-300">
          {part}
        </span>
      );
    }
    if (/^'.*'$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="text-emerald-300">
          {part}
        </span>
      );
    }
    if (/^\d+(\.\d+)?$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="text-amber-300">
          {part}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
