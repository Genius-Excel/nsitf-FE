"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import HttpService from "@/services/httpServices";

// --- Types
interface ClaimsDistribution {
  medical_refunds: number;
  disability: number;
  death: number;
  loss_of_productivity: number;
}

interface ClaimsPieChartResponse {
  message: string;
  data: {
    claims_distribution: ClaimsDistribution;
  };
}

interface ClaimsPieChartProps {
  data?: { name: string; value: number }[];
}

// Chart configuration with labels and colors
const chartConfig = {
  medicalRefunds: { label: "Medical Refunds", color: "#2563eb" },
  disability: { label: "Disability", color: "#16a34a" },
  deathClaims: { label: "Death Claims", color: "#eab308" },
  lossOfProductivity: { label: "Loss of Productivity", color: "#dc2626" },
} as const;

export function ClaimsPieChart({ data: propData }: ClaimsPieChartProps) {
  const [data, setData] = useState<{ name: string; value: number }[]>(propData || []);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) return; // skip fetch if data is provided

    const fetchClaimsData = async () => {
      const http = new HttpService();
      try {
        const res = await http.getData("/api/dashboard/summary");
        const apiData: ClaimsPieChartResponse = res.data;

        const formattedData = [
          { name: chartConfig.medicalRefunds.label, value: apiData.data.claims_distribution.medical_refunds },
          { name: chartConfig.disability.label, value: apiData.data.claims_distribution.disability },
          { name: chartConfig.deathClaims.label, value: apiData.data.claims_distribution.death },
          { name: chartConfig.lossOfProductivity.label, value: apiData.data.claims_distribution.loss_of_productivity },
        ];

        setData(formattedData);
      } catch (err: any) {
        console.error("Failed to fetch pie chart data:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchClaimsData();
  }, [propData]);

  const COLORS = [
    chartConfig.medicalRefunds.color,
    chartConfig.disability.color,
    chartConfig.deathClaims.color,
    chartConfig.lossOfProductivity.color,
  ];

  if (loading) return <p>Loading claims chart...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data || data.length === 0) return <p className="text-gray-500">No claims data available.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims Distribution</CardTitle>
        <CardDescription>Showing the distribution of claim types for 2025</CardDescription>
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
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value) => value} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Data as of November 2025
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
