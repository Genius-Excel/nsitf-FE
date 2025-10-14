"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export const description = "An area chart showing claims, compliance, and inspection trends"

// Sample data for claims, compliance, and inspection
const chartData = [
  { month: "January", claims: 120, compliance: 90, inspection: 150 },
  { month: "February", claims: 200, compliance: 180, inspection: 220 },
  { month: "March", claims: 160, compliance: 130, inspection: 190 },
  { month: "April", claims: 80, compliance: 100, inspection: 170 },
  { month: "May", claims: 180, compliance: 140, inspection: 200 },
  { month: "June", claims: 210, compliance: 160, inspection: 230 },
]

// Chart configuration with updated labels and colors
const chartConfig = {
  claims: {
    label: "Claims",
    color: "#2563eb", // Blue
  },
  compliance: {
    label: "Compliance",
    color: "#16a34a", // Green
  },
  inspection: {
    label: "Inspection",
    color: "#eab308", // Yellow
  },
} satisfies ChartConfig

export function DashboardLineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 10,
            }}
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
              dataKey="compliance"
              type="natural"
              fill="var(--color-compliance)"
              fillOpacity={0.3}
              stroke="var(--color-compliance)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="inspection"
              type="natural"
              fill="var(--color-inspection)"
              fillOpacity={0.3}
              stroke="var(--color-inspection)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}