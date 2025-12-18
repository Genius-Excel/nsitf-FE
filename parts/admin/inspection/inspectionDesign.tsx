"use client";
import React, { useState, useEffect } from "react";
import { Eye, CircleCheck, CheckCircle, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import type {
  InspectionRecord,
  InspectionStatCard,
  UpcomingInspection,
  MonthlyDebtsComparisonData,
} from "@/lib/types/inspection";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { SearchBar } from "@/components/design-system/SearchBar";

// ============= STATISTICS CARDS =============
interface InspectionStatisticsCardsProps {
  stats: InspectionStatCard[];
}

export const InspectionStatisticsCards =
  React.memo<InspectionStatisticsCardsProps>(({ stats }) => {
    const colorMap: Record<
      string,
      "green" | "blue" | "orange" | "purple" | "gray"
    > = {
      "#3b82f6": "blue",
      "#22c55e": "green",
      "#f59e0b": "orange",
      "#16a34a": "green",
    };

    return (
      <MetricsGrid columns={5}>
        {stats.map((stat, idx) => (
          <MetricCard
            key={idx}
            title={stat.title}
            value={stat.value}
            colorScheme={colorMap[stat.bgColor] || "gray"}
          />
        ))}
      </MetricsGrid>
    );
  });

// ============= BAR CHART =============
interface InspectionBarChartProps {
  data: MonthlyDebtsComparisonData;
}

export const InspectionBarChart = React.memo<InspectionBarChartProps>(
  ({ data }) => (
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
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.data}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                domain={[0, data.scale?.max || "auto"]}
                ticks={data.scale?.ticks}
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
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
  )
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
  onUpload?: () => void;
}

export const SearchAndFilters = React.memo<SearchAndFiltersProps>(
  ({ searchTerm, onSearchChange, onFilterClick, onUpload }) => (
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Search by branch, period..."
      onFilter={onFilterClick}
      onUpload={onUpload}
      showUpload={!!onUpload}
      uploadButtonText="Upload Inspection Data"
      uploadButtonColor="green"
      showFilter={false}
    />
  )
);

// ============= INSPECTIONS TABLE =============
interface InspectionsTableProps {
  inspections: InspectionRecord[];
  onView?: (inspection: InspectionRecord) => void;
  onRefresh?: () => void;
}

export const InspectionsTable = React.memo<InspectionsTableProps>(
  ({ inspections, onView, onRefresh }) => {
    const [selectedInspections, setSelectedInspections] = useState<Set<string>>(
      new Set()
    );
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const user = getUserFromStorage();
      if (user) {
        setUserRole(user.role);
      }
    }, []);

    const normalizedRole = userRole?.toLowerCase();
    const canReview =
      normalizedRole === "regional_manager" ||
      normalizedRole === "regional officer";
    const canApprove =
      normalizedRole && ["admin", "manager"].includes(normalizedRole);

    const handleSelectAll = () => {
      if (selectedInspections.size === inspections.length) {
        setSelectedInspections(new Set());
      } else {
        setSelectedInspections(new Set(inspections.map((i) => i.id)));
      }
    };

    const handleSelectInspection = (inspectionId: string) => {
      const newSelected = new Set(selectedInspections);
      if (newSelected.has(inspectionId)) {
        newSelected.delete(inspectionId);
      } else {
        newSelected.add(inspectionId);
      }
      setSelectedInspections(newSelected);
    };

    const handleBulkReview = async () => {
      if (selectedInspections.size === 0) {
        toast.error("Please select at least one inspection");
        return;
      }

      setIsSubmitting(true);
      try {
        // TODO: Call API to bulk review inspection records
        // const response = await fetch('/api/inspection/bulk-review', {
        //   method: 'POST',
        //   body: JSON.stringify({ inspectionIds: Array.from(selectedInspections) })
        // });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success(
          `${selectedInspections.size} inspection(s) marked as reviewed`
        );
        setSelectedInspections(new Set());
      } catch (error) {
        toast.error("Failed to review inspections");
        console.error("Bulk review error:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleBulkApprove = async () => {
      if (selectedInspections.size === 0) {
        toast.error("Please select at least one inspection");
        return;
      }

      setIsSubmitting(true);
      try {
        // TODO: Call API to bulk approve inspection records
        // const response = await fetch('/api/inspection/bulk-approve', {
        //   method: 'POST',
        //   body: JSON.stringify({ inspectionIds: Array.from(selectedInspections) })
        // });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success(
          `${selectedInspections.size} inspection(s) approved successfully`
        );
        setSelectedInspections(new Set());
      } catch (error) {
        toast.error("Failed to approve inspections");
        console.error("Bulk approve error:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

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
        {selectedInspections.size > 0 && (
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedInspections.size} inspection(s) selected
            </span>
            <div className="flex gap-2">
              {canReview && (
                <Button
                  onClick={handleBulkReview}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Mark as Reviewed"}
                </Button>
              )}
              {canApprove && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Approve Selected"}
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedInspections.size === inspections.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label="Select all inspections"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  REGION
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BRANCH
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Inspection conducted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUMULATIVE Debt established (₦)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CUMULATIVE Debt recovered (₦)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  Performance rate (%) (D/E)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DEMAND NOTICE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PERIOD
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  APPROVAL STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.map((inspection) => {
                const recoveryRate =
                  (inspection.debtEstablished || 0) > 0
                    ? (
                        ((inspection.debtRecovered || 0) /
                          (inspection.debtEstablished || 1)) *
                        100
                      ).toFixed(1)
                    : "0";

                return (
                  <tr
                    key={inspection.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInspections.has(inspection.id)}
                        onChange={() => handleSelectInspection(inspection.id)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        aria-label={`Select inspection for ${inspection.branch}`}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {inspection.region || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {inspection.branch || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                      {(inspection.inspectionsConducted || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(inspection.debtEstablished || 0)}
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-green-700">
                          {formatCurrency(inspection.debtRecovered || 0)}
                        </span>
                        <span className="text-xs text-gray-600 mt-0.5">
                          {recoveryRate}% recovered
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <Badge
                        className={`${getPerformanceBadge(
                          inspection.performanceRate || 0
                        )} font-medium`}
                      >
                        {inspection.performanceRate || 0}%
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {inspection.demandNotice || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {inspection.period || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inspection.recordStatus?.toLowerCase() === "approved"
                            ? "bg-green-100 text-green-800"
                            : inspection.recordStatus?.toLowerCase() ===
                              "reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inspection.recordStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onView?.(inspection)}
                        title={`View details for ${inspection.branch}`}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
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
  }
);
