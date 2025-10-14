"use client"

import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A pie chart showing the distribution of claim types"

// Sample data for claim types
const chartData = [
  { name: "Medical Refunds", value: 400 },
  { name: "Disability", value: 300 },
  { name: "Death Claims", value: 200 },
  { name: "Loss of Productivity", value: 100 },
]

// Chart configuration with labels and colors
const chartConfig = {
  medicalRefunds: {
    label: "Medical Refunds",
    color: "#2563eb", // Blue
  },
  disability: {
    label: "Disability",
    color: "#16a34a", // Green
  },
  deathClaims: {
    label: "Death Claims",
    color: "#eab308", // Yellow
  },
  lossOfProductivity: {
    label: "Loss of Productivity",
    color: "#dc2626", // Red
  },//@ts-ignore
} satisfies ChartConfig

// Define colors for the pie chart segments
const COLORS = [
  chartConfig.medicalRefunds.color,
  chartConfig.disability.color,
  chartConfig.deathClaims.color,
  chartConfig.lossOfProductivity.color,
]

export function ClaimsPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims Distribution</CardTitle>
        <CardDescription>
          Showing the distribution of claim types for 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fillOpacity={0.8}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => chartConfig[value]?.label || value}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Data as of October 2025
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}