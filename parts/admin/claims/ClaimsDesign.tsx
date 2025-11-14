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
}

export const ClaimsProcessingChart: React.FC<ClaimsProcessingChartProps> = ({
  data,
}) => (
  <div className="bg-card rounded-lg border border-border p-6 mb-6">
    <h2 className="text-lg font-semibold text-foreground mb-4">
      Claims Processing: YTD vs Target
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" className="text-muted-foreground" />
        <YAxis className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value) => [value, ""]}
        />
        <Legend />
        <Bar
          dataKey="processed"
          name="Claims Processed"
          fill="#22c55e"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="target"
          name="Target"
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

interface ClaimTypeCardsProps {
  claimTypes: Array<{ type: string; count: number; color: string }>;
}

export const ClaimTypeCards: React.FC<ClaimTypeCardsProps> = ({ claimTypes }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    {claimTypes.map((item) => (
      <div
        key={item.type}
        className={`rounded-lg border border-border p-6 ${item.color}`}
      >
        <p className="text-sm font-medium text-muted-foreground">{item.type}</p>
        <p className="text-xl font-semibold mt-2 text-foreground">
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Claim ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Employer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Claimant
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Type
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Amount Requested (₦)
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Amount Paid (₦)
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Date Processed
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Date Paid
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Sector
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Class
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Payment Period
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
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
                  <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                    {claim.claimId}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                    {claim.employer}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-[150px] truncate">
                    {claim.claimant}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={getTypeTextColor(claim.type)}>
                      {claim.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap text-right">
                    {formatCurrency(claim.amountRequested)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(claim.amountPaid)}
                      </span>
                      {difference && (
                        <span className="text-xs text-destructive mt-1">
                          {difference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
                    <Badge
                      className={`${getStatusBadgeColor(
                        claim.status
                      )} font-medium text-xs`}
                    >
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(claim.dateProcessed)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
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
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {claim.sector || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                      {claim.class || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {claim.date || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
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