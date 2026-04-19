export type TabKey = "data" | "visualization" | "details";

export interface ResolvedChart {
  rows: Record<string, unknown>[];
  type: "bar" | "line" | "pie";
  xAxis: string;
  yAxis: string;
}
