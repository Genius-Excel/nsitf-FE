"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { useRegionalComplianceChart } from "@/hooks/Usedashboardcharts";
import { useRegions } from "@/hooks/compliance/Useregions";

interface RegionChartBarMultipleProps {
  dashboardData: DashboardSummaryResponse | null;
  loading?: boolean;
}

export function RegionChartBarMultiple({
  dashboardData,
  loading,
}: RegionChartBarMultipleProps) {
  const { data: rawData, scale } = useRegionalComplianceChart(dashboardData);
  const { data: allRegions, loading: regionsLoading } = useRegions();

  // Merge all regions with data, showing 0 for regions without data
  const data = useMemo(() => {
    if (!allRegions || allRegions.length === 0) {
      return rawData || [];
    }

    // Create a map of regions with data
    const dataMap = new Map(rawData?.map(item => [item.region, item]) || []);

    // Include all regions, filling in 0 values for those without data
    return allRegions.map(region => {
      const existingData = dataMap.get(region.name);
      return existingData || {
        region: region.name,
        target: 0,
        actual: 0,
        performance_percent: 0,
      };
    });
  }, [allRegions, rawData]);

  if (loading || regionsLoading) {
    return (
      <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Regional Compliance Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Loading regional chart...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Regional Compliance Performance
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          Target vs Actual Contributions by Region (₦)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                domain={scale ? [0, scale.max] : undefined}
                ticks={scale?.ticks}
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "#e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#374151" }}
                verticalAlign="top"
                height={36}
              />
              <Bar
                dataKey="target"
                name="Target"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="actual"
                name="Actual"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
