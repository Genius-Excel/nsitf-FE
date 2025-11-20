"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { useMonthlyPerformanceChart } from "@/hooks/Usedashboardcharts";

interface DashboardLineChartProps {
  dashboardData: DashboardSummaryResponse | null;
  loading?: boolean;
}

// Chart configuration - using CSS variables for proper theming
const chartConfig = {
  claims: {
    label: "Claims",
    color: "hsl(var(--chart-1))",
  },
  inspections: {
    label: "Inspections",
    color: "hsl(var(--chart-2))",
  },
  hse: {
    label: "HSE Activities",
    color: "hsl(var(--chart-3))",
  },
} as const;

export function DashboardLineChart({
  dashboardData,
  loading,
}: DashboardLineChartProps) {
  const { data, scale } = useMonthlyPerformanceChart(dashboardData);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">
            No performance data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
            margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              tickMargin={8}
              stroke="#6b7280"
              fontSize={12}
              domain={scale ? [0, scale.max] : undefined}
              ticks={scale?.ticks}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="claims"
              type="natural"
              fill="var(--color-claims)"
              fillOpacity={0.3}
              stroke="var(--color-claims)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="inspections"
              type="natural"
              fill="var(--color-inspections)"
              fillOpacity={0.3}
              stroke="var(--color-inspections)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="hse"
              type="natural"
              fill="var(--color-hse)"
              fillOpacity={0.3}
              stroke="var(--color-hse)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
