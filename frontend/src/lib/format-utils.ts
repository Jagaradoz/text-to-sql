import { GenerateResponse } from "@/types/api";

export function normalizeRows(data: GenerateResponse["data"] | undefined): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
  }
  return [];
}

export function isNumberLike(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return value.trim().length > 0 && Number.isFinite(parsed);
  }
  return false;
}

export function toChartNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
