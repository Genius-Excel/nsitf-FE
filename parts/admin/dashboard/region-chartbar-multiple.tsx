"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { useRegionalComplianceChart } from "@/hooks/Usedashboardcharts";

interface RegionChartBarMultipleProps {
  dashboardData: DashboardSummaryResponse | null;
  loading?: boolean;
}

/**
 * CORRECTED CHART CONFIGURATION:
 * Shows Target vs Actual contributions (both in ₦)
 * This makes semantic sense unlike the previous version that mixed ₦ and percentages
 */
const chartConfig = {
  target: {
    label: "Target",
    color: "hsl(var(--chart-1))",
  },
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RegionChartBarMultiple({
  dashboardData,
  loading,
}: RegionChartBarMultipleProps) {
  const { data, scale } = useRegionalComplianceChart(dashboardData);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regional Compliance Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading regional chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regional Compliance Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No regional data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Compliance Performance</CardTitle>
        <CardDescription>
          Target vs Actual Contributions by Region (₦)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 max-h-[450px]">
        <ChartContainer config={chartConfig} className="w-full max-h-[400px]">
          <BarChart
            data={data}
            height={400}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="region"
              tickLine={false}
              tickMargin={10}
              axisLine={{ stroke: "#d1d5db" }}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              tickMargin={10}
              stroke="#6b7280"
              fontSize={12}
              domain={scale ? [0, scale.max] : undefined}
              ticks={scale?.ticks}
              tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
              }
            />
            <Bar dataKey="target" fill="var(--color-target)" radius={4} />
            <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * ALTERNATIVE VERSION: Show only performance percentages
 * Uncomment this if you want a single-bar percentage chart instead
 */

/*
const chartConfigPercentage = {
  performance_percent: { 
    label: "Performance %", 
    color: "hsl(var(--chart-1))" 
  },
} satisfies ChartConfig;

export function RegionChartPerformance({ dashboardData, loading }: RegionChartBarMultipleProps) {
  const { data } = useRegionalComplianceChart(dashboardData);

  // ... similar loading/error handling ...

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Performance Rate</CardTitle>
        <CardDescription>Percentage of Target Achieved by Region</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigPercentage}>
          <BarChart data={data} height={400}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value) => `${Number(value).toFixed(2)}%`}
              />} 
            />
            <Bar 
              dataKey="performance_percent" 
              fill="var(--color-performance_percent)" 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
*/
