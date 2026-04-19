import React, { useMemo } from "react";
import { ResponsiveContainer } from "recharts";
import { ChartConfig } from "@/types/api";
import { getResolvedChart, renderChart } from "@/lib/chart-utils";

interface VisualizationViewProps {
  chartConfig: ChartConfig;
  rows: Record<string, unknown>[];
}

export function VisualizationView({ chartConfig, rows }: VisualizationViewProps) {
  const resolvedChart = useMemo(() => getResolvedChart(rows, chartConfig), [chartConfig, rows]);

  if (!resolvedChart) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Not enough structured numeric data to render a chart.
      </div>
    );
  }

  return (
    <div className="p-5">
      <p className="mb-4 text-xs text-muted-foreground">
        {resolvedChart.type.toUpperCase()} chart · X: <span className="text-foreground">{resolvedChart.xAxis}</span> · Y:{" "}
        <span className="text-foreground">{resolvedChart.yAxis}</span>
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(resolvedChart)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
