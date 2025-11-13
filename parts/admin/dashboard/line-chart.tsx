"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import HttpService from "@/services/httpServices";

// --- Type for API response
interface MonthlyPerformance {
  month: string;
  claims: number;
  inspections: number;
  hse: number;
}

interface DashboardLineChartResponse {
  message: string;
  data: {
    monthly_performance_trend: MonthlyPerformance[];
  };
}

export const description = "An area chart showing claims, compliance, and inspection trends";

const chartConfig: ChartConfig = {
  claims: { label: "Claims", color: "#2563eb" },
  inspections: { label: "Inspections", color: "#eab308" },
  hse: { label: "HSE Activities", color: "#16a34a" },
};

export function DashboardLineChart() {
  const [data, setData] = useState<MonthlyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      const http = new HttpService();
      try {
        const res = await http.getData("/api/dashboard/summary");
        const chartData: DashboardLineChartResponse = res.data;
        // Map API fields to match recharts keys
        const formattedData = chartData.data.monthly_performance_trend.map((item) => ({
          month: item.month,
          claims: item.claims,
          inspections: item.inspections,
          hse: item.hse,
        }));
        setData(formattedData);
      } catch (err: any) {
        console.error("Failed to fetch line chart data:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
              tickFormatter={(value) => `${value}`}
              stroke="#6b7280"
              fontSize={12}
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
