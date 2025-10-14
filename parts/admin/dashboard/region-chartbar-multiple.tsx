"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A multiple bar chart showing claims and compliance"

// Sample data for claims and compliance
const chartData = [
  { month: "Lagos", claims: 186, compliance: 80 },
  { month: "Abuja", claims: 305, compliance: 200 },
  { month: "Portharcourt", claims: 237, compliance: 120 },
  { month: "Kano", claims: 73, compliance: 190 },
  { month: "Ibadan", claims: 209, compliance: 130 },
]

// Chart configuration with gray and green colors
const chartConfig = {
  claims: {
    label: "Claims",
    color: "#6b7280", // Gray
  },
  compliance: {
    label: "Compliance",
    color: "#16a34a", // Green
  },
} satisfies ChartConfig

export function RegionChartBarMultiple() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Compliance Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[450px]">
        <ChartContainer config={chartConfig} className="w-full max-h-[400px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            height={400} // Set height to 400px
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={{ stroke: "#d1d5db" }}
              tickFormatter={(value) => `${value}`}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              tickMargin={10}
              tickFormatter={(value) => `${value}`}
              stroke="#6b7280"
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="claims" fill="var(--color-claims)" radius={4} />
            <Bar dataKey="compliance" fill="var(--color-compliance)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}