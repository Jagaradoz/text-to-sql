import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartConfig } from "@/types/api";
import { ResolvedChart } from "@/types/home";
import { isNumberLike, toChartNumber } from "./format-utils";

export const PIE_COLORS = ["#f4f4f5", "#a1a1aa", "#71717a", "#d4d4d8", "#52525b", "#e4e4e7"];

export function renderChart(chart: ResolvedChart) {
  const { type, rows, xAxis, yAxis } = chart;

  if (type === "line") {
    return (
      <LineChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey={xAxis} stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 8 }} />
        <Line type="monotone" dataKey={yAxis} stroke="#f5f5f5" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    );
  }

  if (type === "pie") {
    return (
      <PieChart>
        <Tooltip contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 8 }} />
        <Pie data={rows} dataKey={yAxis} nameKey={xAxis} innerRadius={70} outerRadius={110} paddingAngle={3}>
          {rows.map((entry, index) => (
            <Cell key={`cell-${String(entry[xAxis])}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return (
    <BarChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
      <XAxis dataKey={xAxis} stroke="#a1a1aa" tickLine={false} axisLine={false} />
      <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
      <Tooltip contentStyle={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: 8 }} />
      <Bar dataKey={yAxis} radius={[6, 6, 0, 0]} fill="#e5e7eb" />
    </BarChart>
  );
}

export function getResolvedChart(rows: Record<string, unknown>[], chartConfig: ChartConfig): ResolvedChart | null {
  if (rows.length === 0) return null;
  const columns = Object.keys(rows[0]);
  const numericColumns = columns.filter((col) => rows.some((row) => isNumberLike(row[col])));
  const categoricalColumns = columns.filter((col) => !numericColumns.includes(col));
  const yAxis = (chartConfig.y_axis && numericColumns.includes(chartConfig.y_axis)) ? chartConfig.y_axis : numericColumns[0];
  const xAxis = (chartConfig.x_axis && columns.includes(chartConfig.x_axis)) ? chartConfig.x_axis : categoricalColumns[0] ?? columns[0];
  if (!xAxis || !yAxis) return null;
  const type = resolveChartType(chartConfig.type ?? "", rows, xAxis, yAxis);
  return {
    rows: rows.map((row) => ({ ...row, [yAxis]: toChartNumber(row[yAxis]) })),
    type,
    xAxis,
    yAxis,
  };
}

export function resolveChartType(type: string, rows: Record<string, unknown>[], xAxis: string, yAxis: string): "bar" | "line" | "pie" {
  if (type === "line" || type === "bar" || type === "pie") return type;
  if (rows.length <= 6 && isNumberLike(rows[0][yAxis]) && typeof rows[0][xAxis] === "string") return "pie";
  return "bar";
}
