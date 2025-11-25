"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { useMonthlyPerformanceChart } from "@/hooks/Usedashboardcharts";

interface DashboardLineChartProps {
  dashboardData: DashboardSummaryResponse | null;
  loading?: boolean;
}

export function DashboardLineChart({
  dashboardData,
  loading,
}: DashboardLineChartProps) {
  const { data, scale } = useMonthlyPerformanceChart(dashboardData);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Monthly Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Monthly Performance Trends</CardTitle>
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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Monthly Performance Trends
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          Performance trends across key metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                domain={scale ? [0, scale.max] : undefined}
                ticks={scale?.ticks}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "#e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#374151" }}
                verticalAlign="top"
                height={36}
              />
              <Line
                type="monotone"
                dataKey="claims"
                name="Claims"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="inspections"
                name="Inspections"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="hse"
                name="HSE Activities"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
