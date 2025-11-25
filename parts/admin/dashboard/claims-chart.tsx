"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { useClaimsDistributionChart } from "@/hooks/Usedashboardcharts";
import { CHART_COLORS } from "@/lib/Constants";

interface ClaimsPieChartProps {
  dashboardData: DashboardSummaryResponse | null;
  loading?: boolean;
}

export function ClaimsPieChart({
  dashboardData,
  loading,
}: ClaimsPieChartProps) {
  const { data } = useClaimsDistributionChart(dashboardData);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Claims Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Loading claims chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Claims Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No claims data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Claims Distribution
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          Distribution of claim types by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "#e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
