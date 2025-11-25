"use client";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface StatisticsCardsProps {
  stats: StatCard[];
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => (
  <MetricsGrid columns={5}>
    {stats.map((stat, idx) => {
      const colorSchemes: Array<"green" | "blue" | "purple" | "orange" | "gray"> = [
        "green",
        "green",
        "blue",
        "purple",
        "orange",
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
    <div className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-lg">
      <div className="p-4 sm:p-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          Claims Processing: YTD vs Target
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
          Monthly claims processed compared to target
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
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
                }}
                formatter={(value) => [Number(value).toLocaleString(), ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#374151" }}
                verticalAlign="top"
                height={36}
              />
              <Bar
                dataKey="processed"
                name="Claims Processed"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="target"
                name="Target"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={24}
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
    {claimTypes.map((item) => (
      <div
        key={item.type}
        className={`rounded-lg border border-border p-3 sm:p-4 ${item.color}`}
      >
        <p className="text-xs font-medium text-muted-foreground truncate">{item.type}</p>
        <p className="text-base sm:text-lg font-semibold mt-1 text-foreground">
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
  />
);

interface ClaimsTableProps {
  claims: Claim[];
  onView?: (claim: Claim) => void;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({ claims, onView }) => {
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
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Claim ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Employer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Claimant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Amount Requested (₦)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Amount Paid (₦)
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Date Processed
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Date Paid
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Sector
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Class
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Payment Period
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
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
                  <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                    {claim.claimId}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">
                    {claim.employer}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[130px] truncate">
                    {claim.claimant}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span className={getTypeTextColor(claim.type)}>
                      {claim.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap text-right">
                    {formatCurrency(claim.amountRequested)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(claim.amountPaid)}
                      </span>
                      {difference && (
                        <span className="text-xs text-destructive mt-0.5">
                          {difference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-center">
                    <Badge
                      className={`${getStatusBadgeColor(
                        claim.status
                      )} font-medium text-xs`}
                    >
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(claim.dateProcessed)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
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
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {claim.sector || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                      {claim.class || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {claim.date || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => onView?.(claim)}
                      title={`View details for claim ${claim.claimId}`}
                      className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                      aria-label={`View details for claim ${claim.claimId}`}
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