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
  ValuationMetric,
  ShortTermForecast,
  LongTermForecast,
} from "@/lib/types";

interface ValuationForecastingDesignProps {
  valuationMetrics: ValuationMetric[];
  claimTrendProjections: ClaimTrendProjection[];
  contributionGrowth: ContributionGrowth[];
  inspectionTrends: InspectionTrend[];
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
  shortTermForecasts,
  longTermForecasts,
  forecastModel,
  selectedMetric,
  onForecastModelChange,
  onSelectedMetricChange,
  onExportReport,
}: ValuationForecastingDesignProps) {
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="claims">Claim Trends</TabsTrigger>
              <TabsTrigger value="contributions">
                Contribution Growth
              </TabsTrigger>
              <TabsTrigger value="inspections">Inspection Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="claims" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={claimTrendProjections}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorForecast"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
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
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="#e0e7ff"
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="#ffffff"
                      name="Lower Bound"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </AreaChart>
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
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
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
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
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
                      fill="#e5e7eb"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      name="Planned"
                    />
                  </BarChart>
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
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
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
                    dataKey="liabilities"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Liabilities"
                  />
                  <Line
                    type="monotone"
                    dataKey="reserves"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Reserves"
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
                <BarChart
                  data={longTermForecasts}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
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
                    yAxisId="left"
                    dataKey="claims"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                    name="Claims"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="reserves"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                    name="Reserves"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growth"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Growth %"
                  />
                </BarChart>
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
