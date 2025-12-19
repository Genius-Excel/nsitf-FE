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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiskMetric,
  TrendlineData,
  RegionalRiskData,
  RiskEntity,
} from "@/lib/types";
import { RISK_COLORS } from "@/lib/Constants";

interface RiskAnalysisDesignProps {
  riskMetrics: RiskMetric[];
  trendlineData: TrendlineData[];
  regionalRiskData: RegionalRiskData[];
  riskEntities: RiskEntity[];
  regions: Array<{ id: string; name: string }>;
  selectedRegion: string;
  selectedRiskType: string;
  timeHorizon: string;
  onRegionChange: (value: string) => void;
  onRiskTypeChange: (value: string) => void;
  onTimeHorizonChange: (value: string) => void;
  onApplyFilters: () => void;
}

export function RiskAnalysisDesign({
  riskMetrics,
  trendlineData,
  regionalRiskData,
  riskEntities,
  regions,
  selectedRegion,
  selectedRiskType,
  timeHorizon,
  onRegionChange,
  onRiskTypeChange,
  onTimeHorizonChange,
  onApplyFilters,
}: RiskAnalysisDesignProps) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return RISK_COLORS.critical;
    if (score >= 65) return RISK_COLORS.high;
    if (score >= 45) return RISK_COLORS.medium;
    return RISK_COLORS.low;
  };

  const getRiskBadge = (category: string) => {
    const colorMap: Record<string, string> = {
      High: "bg-red-600",
      Medium: "bg-amber-600",
      Low: "bg-green-600",
    };
    return (
      <Badge className={colorMap[category] || "bg-gray-600"}>
        {category} Risk
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "high":
        return "bg-amber-50 border-amber-200";
      case "medium":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case "critical":
        return "text-red-700";
      case "high":
        return "text-amber-700";
      case "medium":
        return "text-blue-700";
      case "success":
        return "text-green-700";
      default:
        return "text-gray-700";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-amber-600";
      case "medium":
        return "bg-blue-600";
      case "success":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-10">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-bold text-black-900">
            Risk Analytics
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
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2">Risk Type</label>
            <Select value={selectedRiskType} onValueChange={onRiskTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="claims">Claims</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="hse">HSE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2">Time Horizon</label>
            <Select value={timeHorizon} onValueChange={onTimeHorizonChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select horizon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
                <SelectItem value="5y">5 Years</SelectItem>
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

      {/* Overall Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {riskMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className={`p-6 border-2 ${getCategoryColor(metric.category)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-white">
                  <Icon
                    className={`h-5 w-5 ${
                      metric.category === "critical"
                        ? "text-red-600"
                        : metric.category === "high"
                        ? "text-amber-600"
                        : metric.category === "medium"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <Badge className={getCategoryBadgeColor(metric.category)}>
                  {metric.category === "critical"
                    ? "Critical"
                    : metric.category === "high"
                    ? "High"
                    : metric.category === "medium"
                    ? "Medium"
                    : "Overall Score"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-1">{metric.title}</p>
              <p
                className={`text-green-700 ${getCategoryTextColor(
                  metric.category
                )}`}
              >
                {metric.value}
              </p>
              <p className="text-muted-foreground mt-2">{metric.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Performance Trendlines */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Performance Trendlines
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Risk metrics and regional analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="w-full">
            <TabsList>
              <TabsTrigger value="trends">
                Incident & Recovery Trends
              </TabsTrigger>
              <TabsTrigger value="regional">
                Regional Risk Breakdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendlineData}
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
                      dataKey="incidentFreq"
                      stroke="#dc2626"
                      strokeWidth={2}
                      name="Incident Frequency"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="complianceImprovement"
                      stroke="#16a34a"
                      strokeWidth={2}
                      name="Compliance Improvement %"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="recoveryRate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Recovery Success Rate %"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-muted-foreground">
                    Incident Frequency Trend
                  </p>
                  <p className="text-red-700">-35.7% (Improving)</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-muted-foreground">
                    Compliance Improvement
                  </p>
                  <p className="text-green-700">+6.8%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-muted-foreground">Recovery Success Rate</p>
                  <p className="text-blue-700">+9.8%</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="mt-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionalRiskData}
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
                      dataKey="highRisk"
                      stackId="a"
                      fill="#dc2626"
                      name="High Risk"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    />
                    <Bar
                      dataKey="mediumRisk"
                      stackId="a"
                      fill="#f59e0b"
                      name="Medium Risk"
                      barSize={24}
                    />
                    <Bar
                      dataKey="lowRisk"
                      stackId="a"
                      fill="#16a34a"
                      name="Low Risk"
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Drill-Down Table */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Risk Drill-Down - Employer & Sector Details
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Detailed risk analysis by entity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Incidents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskEntities.map((entity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {entity.entity}
                    </TableCell>
                    <TableCell>{entity.region}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${entity.riskScore}%`,
                              backgroundColor: getRiskColor(entity.riskScore),
                            }}
                          ></div>
                        </div>
                        <span>{entity.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(entity.category)}</TableCell>
                    <TableCell>{entity.claims}</TableCell>
                    <TableCell>{entity.compliance}%</TableCell>
                    <TableCell>{entity.incidents}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
