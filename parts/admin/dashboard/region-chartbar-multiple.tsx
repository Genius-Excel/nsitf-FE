"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import HttpService from "@/services/httpServices"; 

// --- Types
interface RegionalPerformance {
  region: string;
  target: number;
  actual: number;
  performance_percent: number;
}

interface DashboardResponse {
  message: string;
  data: {
    regional_compliance_performance: RegionalPerformance[];
  };
}

interface RegionChartBarMultipleProps {
  data?: { month: string; claims: number; compliance: number }[];
}

// Chart configuration with gray and green colors
const chartConfig = {
  claims: { label: "Claims", color: "#6b7280" }, // Gray
  compliance: { label: "Compliance", color: "#16a34a" }, // Green
} satisfies ChartConfig;

export function RegionChartBarMultiple({ data: propData }: RegionChartBarMultipleProps) {
  const [data, setData] = useState<{ month: string; claims: number; compliance: number }[]>(propData || []);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) return; // skip fetch if data is provided

    const fetchRegionalData = async () => {
      const http = new HttpService();
      try {
        const res = await http.getData("/api/dashboard/summary");
        const apiData: DashboardResponse = res.data;

        // Map API response to chart format
        const formattedData = apiData.data.regional_compliance_performance.map((item) => ({
          month: item.region,
          claims: item.actual,
          compliance: item.performance_percent,
        }));

        setData(formattedData);
      } catch (err: any) {
        console.error("Failed to fetch regional chart data:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalData();
  }, [propData]);

  if (loading) return <p>Loading regional chart...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data || data.length === 0) return <p className="text-gray-500">No regional data available.</p>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Compliance Performance</CardTitle>
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
              dataKey="month"
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
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="claims" fill="var(--color-claims)" radius={4} />
            <Bar dataKey="compliance" fill="var(--color-compliance)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
