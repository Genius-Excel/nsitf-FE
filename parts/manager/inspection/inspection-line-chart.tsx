"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useInspectionDashboard } from "@/hooks/inspection/useInspectionDashboard"

export const description = "A line chart showing inspection-related trends"

// Chart configuration with updated labels and colors
const chartConfig = {
  debtsEstablished: {
    label: "Debts Established",
    color: "#F59E0B", // Amber
  },
  debtsRecovered: {
    label: "Debts Recovered",
    color: "#8B5CF6", // Purple
  },
} satisfies ChartConfig

export function InspectionLineChart() {
  // Fetch inspection dashboard data from backend
  const { data: dashboardData, loading, error } = useInspectionDashboard();

  // Use data from backend instead of hardcoded values
  const chartData = dashboardData?.monthlyDebtsComparison?.data || [];
  const scale = dashboardData?.monthlyDebtsComparison?.scale;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-normal">Inspection Trends (Month to Date (YTD))</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-normal">Inspection Trends (Month to Date (YTD))</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-normal">Inspection Trends (Month to Date (YTD))</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">No inspection data available</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-normal">Inspection Trends (Month to Date (YTD))</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid 
              vertical={true} 
              strokeDasharray="4 4" 
              stroke="#9ca3af" 
              strokeWidth={1.5} 
            />
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
            <Line
              dataKey="debtsEstablished"
              type="monotone"
              stroke="var(--color-debtsEstablished)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="debtsRecovered"
              type="monotone"
              stroke="var(--color-debtsRecovered)"
              strokeWidth={2}
              dot={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}