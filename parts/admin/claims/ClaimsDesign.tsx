"use client";
import { useState, useEffect } from "react";
import { Eye, CheckCircle, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getStatusBadgeColor, getTypeTextColor } from "@/lib/utils";
import { ChartDataPoint, Claim, StatCard } from "@/lib/types";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { SearchBar } from "@/components/design-system/SearchBar";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

interface StatisticsCardsProps {
  stats: StatCard[];
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => (
  <MetricsGrid columns={7}>
    {stats.map((stat, idx) => {
      const colorSchemes: Array<"green" | "blue" | "purple" | "orange" | "gray"> = [
        "green",
        "green",
        "blue",
        "purple",
        "orange",
        "purple",
        "blue",
      ];

      return (
        <MetricCard
          key={idx}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          colorScheme={colorSchemes[idx] || "green"}
        />
      );
    })}
  </MetricsGrid>
);

interface ClaimsProcessingChartProps {
  data: ChartDataPoint[];
  maxValue?: number;
  ticks?: number[];
}

export const ClaimsProcessingChart: React.FC<ClaimsProcessingChartProps> = ({
  data,
  maxValue,
  ticks,
}) => {
  // Determine the maximum value across all data points
  const maxDataValue = Math.max(
    ...data.map((d) => Math.max(d.processed || 0, d.target || 0))
  );

  // Format function for Y-axis based on value range
  const formatYAxis = (value: number): string => {
    if (maxDataValue >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (maxDataValue >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="border shadow-sm bg-gradient-to-br from-white to-gray-50 rounded-lg">
      <div className="p-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900">
          Claims Processing: YTD vs Target
        </h2>
        <p className="text-[10px] text-gray-600 mt-0.5">
          Monthly claims processed compared to target
        </p>
      </div>
      <div className="p-2">
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                domain={[0, maxValue || 'auto']}
                ticks={ticks}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "#e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: "11px",
                }}
                formatter={(value) => [Number(value).toLocaleString(), ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, color: "#374151" }}
                verticalAlign="top"
                height={28}
              />
              <Bar
                dataKey="processed"
                name="Claims Processed"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="target"
                name="Target"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface ClaimTypeCardsProps {
  claimTypes: Array<{ type: string; count: number; color: string }>;
}

export const ClaimTypeCards: React.FC<ClaimTypeCardsProps> = ({ claimTypes }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
    {claimTypes.map((item) => (
      <div
        key={item.type}
        className={`rounded-lg border border-border p-2 ${item.color}`}
      >
        <p className="text-[10px] font-medium text-muted-foreground truncate">{item.type}</p>
        <p className="text-sm font-semibold mt-0.5 text-foreground">
          {item.count.toLocaleString()} claims
        </p>
      </div>
    ))}
  </div>
);

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  onExport?: () => void;
  onUpload?: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onExport,
  onUpload,
}) => (
  <SearchBar
    searchTerm={searchTerm}
    onSearchChange={onSearchChange}
    placeholder="Search by claim ID, employer, or claimant..."
    onFilter={onFilterClick}
    onExport={onExport}
    onUpload={onUpload}
    showUpload={true}
    showFilter={false}
  />
);

interface ClaimsTableProps {
  claims: Claim[];
  onView?: (claim: Claim) => void;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({ claims, onView }) => {
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user role
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  // Permission checks
  const canReview = userRole === "regional_manager";
  const canApprove = userRole && ["admin", "manager"].includes(userRole);

  // Select/deselect all
  const handleSelectAll = () => {
    if (selectedClaims.size === claims.length) {
      setSelectedClaims(new Set());
    } else {
      setSelectedClaims(new Set(claims.map(c => c.id)));
    }
  };

  // Select/deselect individual claim
  const handleSelectClaim = (claimId: string) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimId)) {
      newSelected.delete(claimId);
    } else {
      newSelected.add(claimId);
    }
    setSelectedClaims(newSelected);
  };

  // Bulk review handler
  const handleBulkReview = async () => {
    if (selectedClaims.size === 0) {
      toast.error("Please select at least one claim");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk review claims
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedClaims.size} claim(s) marked as reviewed`);
      setSelectedClaims(new Set());
      // Optionally refresh data here
    } catch (error) {
      toast.error("Failed to review claims");
      console.error("Bulk review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk approve handler
  const handleBulkApprove = async () => {
    if (selectedClaims.size === 0) {
      toast.error("Please select at least one claim");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk approve claims
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedClaims.size} claim(s) approved successfully`);
      setSelectedClaims(new Set());
      // Optionally refresh data here
    } catch (error) {
      toast.error("Failed to approve claims");
      console.error("Bulk approve error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!claims || claims.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground">No claims found</p>
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

  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
      
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString; // Return as-is if formatting fails
    }
  };

  // Helper function to calculate difference
  const calculateDifference = (requested: number, paid: number): string => {
    const diff = requested - paid;
    if (diff === 0) return "";
    const percentage = ((diff / requested) * 100).toFixed(1);
    return diff > 0 ? `-${percentage}%` : `+${Math.abs(Number(percentage))}%`;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      {/* Bulk Action Buttons */}
      {(canReview || canApprove) && selectedClaims.size > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedClaims.size} claim(s) selected
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
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted border-b border-border">
              <tr>
                {(canReview || canApprove) && (
                  <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedClaims.size === claims.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label="Select all claims"
                    />
                  </th>
                )}
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  ECS NO.
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Employer
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  BENEFICIARY
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Type
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  GENDER
                </th>
                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Amount REQUESTED (₦)
                </th>
                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Amount PAID (₦)
                </th>
                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Status
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Date PROCESSED
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  DATE PAID
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  SECTOR
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  CLASS
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  PERIOD
                </th>
                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
          <tbody className="divide-y divide-border bg-card">
            {claims.map((claim) => {
              const difference = calculateDifference(
                claim.amountRequested,
                claim.amountPaid
              );

              return (
                <tr key={claim.id} className="hover:bg-muted/50 transition-colors">
                  {(canReview || canApprove) && (
                    <td className="px-2 py-1.5 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedClaims.has(claim.id)}
                        onChange={() => handleSelectClaim(claim.id)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        aria-label={`Select claim ${claim.claimId}`}
                      />
                    </td>
                  )}
                  <td className="px-2 py-1.5 text-xs font-medium text-foreground whitespace-nowrap">
                    {claim.claimId}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground max-w-[150px] truncate">
                    {claim.employer}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground max-w-[120px] truncate">
                    {claim.claimant}
                  </td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap">
                    <span className={getTypeTextColor(claim.type)}>
                      {claim.type}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {claim.gender || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-xs font-semibold text-foreground whitespace-nowrap text-right">
                    {formatCurrency(claim.amountRequested)}
                  </td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(claim.amountPaid)}
                      </span>
                      {difference && (
                        <span className="text-[10px] text-destructive mt-0.5">
                          {difference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap text-center">
                    <Badge
                      className={`${getStatusBadgeColor(
                        claim.status
                      )} font-medium text-[10px]`}
                    >
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(claim.dateProcessed)}
                  </td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap">
                    <span
                      className={
                        claim.datePaid
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60 italic"
                      }
                    >
                      {formatDate(claim.datePaid)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {claim.sector || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium">
                      {claim.class || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {claim.date || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => onView?.(claim)}
                      title={`View details for claim ${claim.claimId}`}
                      className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                      aria-label={`View details for claim ${claim.claimId}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};