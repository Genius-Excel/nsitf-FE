"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import HttpService from "@/services/httpServices";

// ---------------------- Types ----------------------
interface MonthlyPerformance {
  month: string;
  claims: number;
  inspections: number;
  hse: number;
}

interface DashboardLineChartResponse {
  message: string;
  data: {
    monthly_performance_trend: MonthlyPerformance[] | null;
  };
}

// ---------------------- Chart Config ----------------------
const chartConfig = {
  claims: { label: "Claims", colorVar: "--color-claims" },
  inspections: { label: "Inspections", colorVar: "--color-inspections" },
  hse: { label: "HSE Activities", colorVar: "--color-hse" },
} as const;

// ---------------------- Component ----------------------
export const description = "An area chart showing claims, compliance, and inspection trends";

export function DashboardLineChart() {
  const [data, setData] = useState<MonthlyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchChartData = async () => {
    const http = new HttpService();
    try {
      const res = await http.getData("/api/dashboard/summary");

      // Safely extract the array
      let monthlyTrend: MonthlyPerformance[] = [];

      if (res?.data?.data?.monthly_performance_trend && Array.isArray(res.data.data.monthly_performance_trend)) {
        monthlyTrend = res.data.data.monthly_performance_trend;
      } else if (res?.data?.monthly_performance_trend && Array.isArray(res.data.monthly_performance_trend)) {
        monthlyTrend = res.data.monthly_performance_trend;
      }

      setData(monthlyTrend);
    } catch (err: any) {
      console.error("Failed to fetch line chart data:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch chart data");
    } finally {
      setLoading(false);
    }
  };

  fetchChartData();
}, []);


  // if (loading) return <p>Loading chart...</p>;
  // if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={data} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
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
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            {Object.entries(chartConfig).map(([key, { colorVar }]) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(${colorVar})`}
                fillOpacity={0.3}
                stroke={`var(${colorVar})`}
                strokeWidth={2}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
