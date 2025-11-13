"use client";
import { Search, Eye, Filter, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface StatisticsCardsProps {
  stats: StatCard[];
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stat.value.toLocaleString()}
            </p>
            {stat.change && (
              <p className="text-xs text-green-600 mt-2">{stat.change}</p>
            )}
          </div>
          <div style={{ color: stat.bgColor }} className="text-2xl">
            {stat.icon}
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface ClaimsProcessingChartProps {
  data: ChartDataPoint[];
}

export const ClaimsProcessingChart: React.FC<ClaimsProcessingChartProps> = ({
  data,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Claims Processing: YTD vs Target
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value) => [value, ""]}
        />
        <Legend />
        <Bar
          dataKey="processed"
          name="Claims Processed"
          fill="#00a63e"
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    {claimTypes.map((item) => (
      <div
        key={item.type}
        className={`rounded-lg border border-gray-200 p-4 ${item.color}`}
      >
        <p className="text-sm font-medium text-gray-700">{item.type}</p>
        <p
          className="text-xl font-bold mt-2"
          style={{
            color: item.color.includes("green")
              ? "#00a63e"
              : item.color.includes("blue")
              ? "#3b82f6"
              : item.color.includes("purple")
              ? "#a855f7"
              : "#f59e0b",
          }}
        >
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
  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-3 items-center">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search by claim ID, employer, or claimant..."
        className="pl-10 border-gray-200 text-sm"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    {onUpload && (
      <button
        type="button"
        onClick={onUpload}
        title="Upload Claims Data"
        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
        aria-label="Upload claims data"
      >
        <Upload className="w-4 h-4" />
        Upload Claims Data
      </button>
    )}
    {onExport && (
      <button
        type="button"
        onClick={onExport}
        title="Export to CSV"
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center gap-2"
        aria-label="Export claims to CSV"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    )}
    <button
      type="button"
      onClick={onFilterClick}
      title="Filter claims"
      className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
      aria-label="Filter claims"
    >
      <Filter className="w-4 h-4" />
    </button>
  </div>
);

interface ClaimsTableProps {
  claims: Claim[];
  onView?: (claim: Claim) => void;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({ claims, onView }) => {
  if (!claims || claims.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No claims found</p>
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Claim ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Employer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Claimant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Amount Requested (₦)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Amount Paid (₦)
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Date Processed
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Date Paid
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Sector
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Class
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Payment Period
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {claims.map((claim) => {
              const difference = calculateDifference(
                claim.amountRequested,
                claim.amountPaid
              );

              return (
                <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {claim.claimId}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                    {claim.employer}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-[150px] truncate">
                    {claim.claimant}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <span className={getTypeTextColor(claim.type)}>
                      {claim.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap text-right">
                    {formatCurrency(claim.amountRequested)}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-green-700">
                        {formatCurrency(claim.amountPaid)}
                      </span>
                      {difference && (
                        <span className="text-xs text-red-600 mt-1">
                          {difference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                    <Badge
                      className={`${getStatusBadgeColor(
                        claim.status
                      )} font-medium text-xs`}
                    >
                      {claim.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(claim.dateProcessed)}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <span
                      className={
                        claim.datePaid
                          ? "text-gray-600"
                          : "text-gray-400 italic"
                      }
                    >
                      {formatDate(claim.datePaid)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {claim.sector || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {claim.class || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {claim.date || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => onView?.(claim)}
                      title={`View details for claim ${claim.claimId}`}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900 inline-flex items-center justify-center"
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