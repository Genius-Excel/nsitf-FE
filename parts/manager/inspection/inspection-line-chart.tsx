"use client"

import { TrendingUp } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

export const description = "A line chart showing inspection-related trends"

// Sample data for debts established, debts recovered, inspected, and letters served
const chartData = [
  { month: "January", debtsEstablished: 120, debtsRecovered: 80, inspected: 150, lettersServed: 200 },
  { month: "February", debtsEstablished: 150, debtsRecovered: 100, inspected: 180, lettersServed: 220 },
  { month: "March", debtsEstablished: 130, debtsRecovered: 90, inspected: 160, lettersServed: 190 },
  { month: "April", debtsEstablished: 100, debtsRecovered: 70, inspected: 140, lettersServed: 170 },
  { month: "May", debtsEstablished: 140, debtsRecovered: 110, inspected: 170, lettersServed: 200 },
  { month: "June", debtsEstablished: 160, debtsRecovered: 120, inspected: 190, lettersServed: 230 },
  { month: "July", debtsEstablished: 180, debtsRecovered: 130, inspected: 200, lettersServed: 240 },
  { month: "August", debtsEstablished: 170, debtsRecovered: 125, inspected: 195, lettersServed: 235 },
  { month: "September", debtsEstablished: 190, debtsRecovered: 140, inspected: 210, lettersServed: 250 },
]

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
  inspected: {
    label: "Inspected",
    color: "#10B981", // Green
  },
  lettersServed: {
    label: "Letters Served",
    color: "#3B82F6", // Blue
  },
} satisfies ChartConfig

export function InspectionLineChart() {
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
            <Line
              dataKey="inspected"
              type="monotone"
              stroke="var(--color-inspected)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lettersServed"
              type="monotone"
              stroke="var(--color-lettersServed)"
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