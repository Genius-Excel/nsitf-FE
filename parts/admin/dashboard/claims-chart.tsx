"use client";

import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { useClaimsDistributionChart } from "@/hooks/Usedashboardcharts";

interface ClaimsPieChartProps {
  dashboardData: DashboardSummaryResponse | null;
  loading?: boolean;
}

// Chart configuration
const chartConfig = {
  medicalRefunds: { label: "Medical Refunds", color: "#2563eb" },
  disability: { label: "Disability", color: "#16a34a" },
  deathClaims: { label: "Death Claims", color: "#eab308" },
  lossOfProductivity: { label: "Loss of Productivity", color: "#dc2626" },
} as const;

export function ClaimsPieChart({
  dashboardData,
  loading,
}: ClaimsPieChartProps) {
  const { data } = useClaimsDistributionChart(dashboardData);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Claims Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading claims chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Claims Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No claims data available.</p>
        </CardContent>
      </Card>
    );
  }

  const period = dashboardData?.data?.filters?.period || "2025";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims Distribution</CardTitle>
        <CardDescription>
          Distribution of claim types for {period}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fillOpacity={0.8}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Data as of {period}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
