import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Download, Calendar, TrendingUp } from "lucide-react";
import {
  ClaimTrendProjection,
  ContributionGrowth,
  InspectionTrend,
  HSETrend,
  ValuationMetric,
  ShortTermForecast,
  LongTermForecast,
} from "@/lib/types";

interface ValuationForecastingDesignProps {
  valuationMetrics: ValuationMetric[];
  claimTrendProjections: ClaimTrendProjection[];
  contributionGrowth: ContributionGrowth[];
  inspectionTrends: InspectionTrend[];
  hseTrends: HSETrend[];
  shortTermForecasts: ShortTermForecast[];
  longTermForecasts: LongTermForecast[];
  forecastModel: string;
  selectedMetric: string;
  onForecastModelChange: (value: string) => void;
  onSelectedMetricChange: (value: string) => void;
  onExportReport: () => void;
}

export function ValuationForecastingDesign({
  valuationMetrics,
  claimTrendProjections,
  contributionGrowth,
  inspectionTrends,
  hseTrends,
  shortTermForecasts,
  longTermForecasts,
  forecastModel,
  selectedMetric,
  onForecastModelChange,
  onSelectedMetricChange,
  onExportReport,
}: ValuationForecastingDesignProps) {
  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-10">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-bold text-black-900">
            Valuation & Forecasting
          </h1>
        </div>
      </div>

      {/* Valuation Summary */}
      <div>
        <h3 className="mb-4">Actuarial Valuation Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {valuationMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={index}
                className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge
                    className={
                      metric.status === "success"
                        ? "bg-green-600"
                        : "bg-amber-600"
                    }
                  >
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-green-700">{metric.value}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Forecasting Models */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Forecasting Models
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Predictive analytics and trend projections
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="claims" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="claims">Claim Trends</TabsTrigger>
              <TabsTrigger value="contributions">
                Contribution Growth
              </TabsTrigger>
              <TabsTrigger value="inspections">Inspection Trends</TabsTrigger>
              <TabsTrigger value="hse">HSE Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="claims" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={claimTrendProjections}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "0.5rem",
                        borderColor: "#e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#374151" }}
                      verticalAlign="top"
                      height={36}
                    />
                    <Bar
                      dataKey="actual"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Actual"
                    />
                    <Bar
                      dataKey="forecast"
                      fill="#60a5fa"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Forecast"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-muted-foreground">Current (Q3 2024)</p>
                  <p className="text-green-700">2,847 claims</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-muted-foreground">Forecast (Q4 2025)</p>
                  <p className="text-blue-700">4,050 claims</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-muted-foreground">Growth Rate</p>
                  <p className="text-amber-700">+42.3%</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={contributionGrowth}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "0.5rem",
                        borderColor: "#e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#374151" }}
                      verticalAlign="top"
                      height={36}
                    />
                    <Bar
                      dataKey="actual"
                      fill="#16a34a"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Forecast"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="inspections" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inspectionTrends}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "0.5rem",
                        borderColor: "#e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#374151" }}
                      verticalAlign="top"
                      height={36}
                    />
                    <Bar
                      dataKey="completed"
                      fill="#16a34a"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Completed"
                    />
                    <Bar
                      dataKey="forecast"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Forecast"
                    />
                    <Bar
                      dataKey="planned"
                      fill="#fb923c"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Planned"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="hse" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={hseTrends}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "0.5rem",
                        borderColor: "#e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#374151" }}
                      verticalAlign="top"
                      height={36}
                    />
                    <Bar
                      dataKey="total"
                      fill="#16a34a"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                      name="Total Activities"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Forecast"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* KPI Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Short-term Forecasts */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Short-term Forecasts (2025)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={shortTermForecasts}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      borderColor: "#e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#374151" }}
                    verticalAlign="top"
                    height={36}
                  />
                  <Line
                    type="monotone"
                    dataKey="claims"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Claims"
                  />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Contributions"
                  />
                  <Line
                    type="monotone"
                    dataKey="inspections"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Inspections"
                  />
                  <Line
                    type="monotone"
                    dataKey="hse"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="HSE"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {shortTermForecasts.map((forecast, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-muted-foreground">
                    {forecast.quarter}
                  </span>
                  <div className="flex gap-4">
                    <span className="text-green-700">{forecast.claims}</span>
                    <span className="text-blue-700">
                      ₦{forecast.contributions}M
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Long-term Forecasts */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Long-term Forecasts (5 Years)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={longTermForecasts}
                  margin={{ top: 20, right: 60, left: 10, bottom: 10 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#16a34a"
                    tick={{ fontSize: 12, fill: "#16a34a" }}
                    label={{
                      value: "Claims",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#16a34a" },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f59e0b"
                    tick={{ fontSize: 12, fill: "#f59e0b" }}
                    tickFormatter={formatYAxis}
                    label={{
                      value: "Contributions",
                      angle: 90,
                      position: "insideRight",
                      style: { fill: "#f59e0b" },
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      borderColor: "#e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    formatter={(value: any) => {
                      if (typeof value === "number") {
                        return value >= 1000000
                          ? formatYAxis(value)
                          : value.toLocaleString();
                      }
                      return value;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#374151" }}
                    verticalAlign="top"
                    height={36}
                  />
                  <Bar
                    dataKey="claims"
                    yAxisId="left"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    name="Claims"
                  />
                  <Bar
                    dataKey="contributions"
                    yAxisId="right"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    name="Contributions"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-muted-foreground">Projected 2029 Claims</p>
                <p className="text-green-700">22,550</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-muted-foreground">Avg. Annual Growth</p>
                <p className="text-blue-700">10.6%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
