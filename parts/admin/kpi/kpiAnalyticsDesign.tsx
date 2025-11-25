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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { KPIMetric, RegionalData, SectorData, MonthlyKPI } from "@/lib/types";
import { CHART_COLORS } from "@/lib/Constants";

interface KPIAnalyticsDesignProps {
  kpiMetrics: KPIMetric[];
  regionalData: RegionalData[];
  sectorData: SectorData[];
  monthlyKPIs: MonthlyKPI[];
  selectedRegion: string;
  selectedSector: string;
  selectedPeriod: string;
  onRegionChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onApplyFilters: () => void;
}

export function KPIAnalyticsDesign({
  kpiMetrics,
  regionalData,
  sectorData,
  monthlyKPIs,
  selectedRegion,
  selectedSector,
  selectedPeriod,
  onRegionChange,
  onSectorChange,
  onPeriodChange,
  onApplyFilters,
}: KPIAnalyticsDesignProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "critical":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-600">On Track</Badge>;
      case "warning":
        return <Badge className="bg-amber-600">At Risk</Badge>;
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-bold text-black-900">
            KPI Analysis
          </h1>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2">Region</label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="lagos">Lagos</SelectItem>
                <SelectItem value="abuja">Abuja</SelectItem>
                <SelectItem value="kano">Kano</SelectItem>
                <SelectItem value="portharcourt">Port Harcourt</SelectItem>
                <SelectItem value="ibadan">Ibadan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2">Sector</label>
            <Select value={selectedSector} onValueChange={onSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2">Time Period</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={onApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className={`p-6 border-2 ${getStatusColor(kpi.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-white">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                {getStatusBadge(kpi.status)}
              </div>
              <h3 className="text-muted-foreground mb-1">{kpi.title}</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-green-700">{kpi.value}</span>
                <div
                  className={`flex items-center gap-1 ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((kpi.actual / kpi.target) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-muted-foreground mt-2">
                Target:{" "}
                {kpi.title.includes("₦") || kpi.title.includes("Rate")
                  ? kpi.target + "%"
                  : kpi.target}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Monthly KPI Comparison */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Monthly KPI Comparison
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Performance trends across key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyKPIs}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
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
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="claims"
                  name="Claims"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="compliance"
                  name="Compliance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="inspections"
                  name="Inspections"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="hse"
                  name="HSE"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Regional and Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Regional Performance
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Claims distribution across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionalData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="region"
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
                    dataKey="claims"
                    name="Claims"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="paid"
                    name="Paid"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="pending"
                    name="Pending"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Breakdown */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sector-wise Claims Distribution
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Claims breakdown by industry sector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      borderColor: "#e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
