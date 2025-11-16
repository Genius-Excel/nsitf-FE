"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import HttpService from "@/services/httpServices";


interface RegionalPerformance {
  region: string;
  target: number;
  actual: number;
  performance_percent: number;
}

interface DashboardResponse {
  message: string;
  data: {
    regional_compliance_performance: RegionalPerformance[] | null;
  };
}

interface RegionChartBarProps {
  data?: { region: string; claims: number; compliance: number }[];
}


const chartConfig = {
  claims: { label: "Claims", color: "--color-claims" },    
  compliance: { label: "Compliance", color: "--color-compliance" },
} satisfies ChartConfig;


export function RegionChartBarMultiple({ data: propData }: RegionChartBarProps) {
  const [data, setData] = useState<{ region: string; claims: number; compliance: number }[]>(propData || []);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) return; 

    const fetchRegionalData = async () => {
      const http = new HttpService();
      try {
        const res = await http.getData("/api/dashboard/summary");
        const apiData: DashboardResponse = res.data;

        // Safe extraction
        const regionalData = apiData?.data?.regional_compliance_performance ?? [];
        if (!Array.isArray(regionalData)) {
          setData([]);
          return;
        }

        // Map API response to chart format
        const formattedData = regionalData.map((item) => ({
          region: item.region,
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

  // ---------- Render ----------
  if (loading) return <p>Loading regional chart...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data.length) return <p className="text-gray-500">No regional data available.</p>;

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
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            {Object.entries(chartConfig).map(([key, config]) => (
  <Bar key={key} dataKey={key} fill={config.color} radius={4} />
))}

          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
