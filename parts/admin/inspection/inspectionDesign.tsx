"use client";
import React from "react";
import { Search, Eye, Filter, Download, CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { InspectionRecord, InspectionStatCard, UpcomingInspection, MonthlyChartData } from "@/lib/types";

// ============= STATISTICS CARDS =============
interface InspectionStatisticsCardsProps {
  stats: InspectionStatCard[];
}

export const InspectionStatisticsCards: React.FC<InspectionStatisticsCardsProps> = ({ stats }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
    {stats.map((stat, idx) => (
      <Card key={idx} className={`border-border/50`} style={{ backgroundColor: `${stat.bgColor}15` }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground font-normal text-base">
            {stat.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-medium" style={{ color: stat.bgColor }}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          {stat.change && (
            <p className="text-xs text-green-600 mt-2">{stat.change}</p>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);

// ============= BAR CHART =============
interface InspectionBarChartProps {
  data: MonthlyChartData[];
}

export const InspectionBarChart: React.FC<InspectionBarChartProps> = ({ data }) => (
  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-gray-900">
        Monthly Debts Comparison
      </CardTitle>
      <CardDescription className="text-sm text-gray-600 mt-1">
        Debts Established vs Debts Recovered
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
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
              dataKey="debtsEstablished"
              name="Debts Established"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="debtsRecovered"
              name="Debts Recovered"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

// ============= UPCOMING INSPECTIONS CARD =============
interface UpcomingInspectionCardProps {
  companyName: string;
  location: string;
  date: string;
  inspectorName: string;
  status: "Scheduled" | "Pending";
}

export const UpcomingInspectionCard: React.FC<UpcomingInspectionCardProps> = ({
  companyName,
  date,
  inspectorName,
  location,
  status,
}) => (
  <div className="flex justify-between items-center border py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
    <div className="flex gap-4 items-center">
      <div className="bg-blue-100 rounded-sm p-2">
        <CircleCheck className="text-blue-700 h-4 w-4" />
      </div>
      <div>
        <h4 className="font-medium">{companyName}</h4>
        <p className="text-muted-foreground text-sm">{location}</p>
      </div>
    </div>
    <div className="text-muted-foreground text-right text-sm">
      <p>{date}</p>
      <p>Inspector: {inspectorName}</p>
    </div>
    <Badge
      className={
        status === "Scheduled"
          ? "bg-green-100 text-green-700 font-medium text-sm hover:bg-green-100"
          : "bg-yellow-100 text-yellow-700 font-medium text-sm hover:bg-yellow-100"
      }
    >
      {status}
    </Badge>
  </div>
);

// ============= SEARCH AND FILTERS =============
interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  onExport?: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onExport,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-3 items-center">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search by branch, period..."
        className="pl-10 border-gray-200 text-sm"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    {onExport && (
      <button
        type="button"
        onClick={onExport}
        title="Export to CSV"
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center gap-2"
        aria-label="Export inspections to CSV"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    )}
    <button
      type="button"
      onClick={onFilterClick}
      title="Filter inspections"
      className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
      aria-label="Filter inspections"
    >
      <Filter className="w-4 h-4" />
    </button>
  </div>
);

// ============= INSPECTIONS TABLE =============
interface InspectionsTableProps {
  inspections: InspectionRecord[];
  onView?: (inspection: InspectionRecord) => void;
}

export const InspectionsTable: React.FC<InspectionsTableProps> = ({ inspections, onView }) => {
  if (!inspections || inspections.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No inspection records found</p>
      </div>
    );
  }

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to get performance rate color
  const getPerformanceColor = (rate: number): string => {
    if (rate >= 80) return "text-green-700 font-semibold";
    if (rate >= 60) return "text-yellow-700 font-semibold";
    return "text-red-700 font-semibold";
  };

  // Helper to get performance badge
  const getPerformanceBadge = (rate: number): string => {
    if (rate >= 80) return "bg-green-100 text-green-700";
    if (rate >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Branch
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Inspections Conducted
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Debt Established (₦)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Debt Recovered (₦)
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Performance Rate (%)
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Demand Notice
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Period
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {inspections.map((inspection) => {
              const recoveryRate = inspection.debtEstablished > 0
                ? ((inspection.debtRecovered / inspection.debtEstablished) * 100).toFixed(1)
                : "0";

              return (
                <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {inspection.branch}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-center font-semibold">
                    {inspection.inspectionsConducted.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap text-right">
                    {formatCurrency(inspection.debtEstablished)}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-green-700">
                        {formatCurrency(inspection.debtRecovered)}
                      </span>
                      <span className="text-xs text-gray-600 mt-1">
                        {recoveryRate}% recovered
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                    <Badge className={`${getPerformanceBadge(inspection.performanceRate)} font-semibold`}>
                      {inspection.performanceRate}%
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {inspection.demandNotice}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {inspection.period}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => onView?.(inspection)}
                      title={`View details for ${inspection.branch}`}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900 inline-flex items-center justify-center"
                      aria-label={`View details for ${inspection.branch}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};