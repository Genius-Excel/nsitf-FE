"use client";
import { Search, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
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

export const StatisticsCards: React.FC<{ stats: StatCard[] }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stat.value}
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

export const ClaimsProcessingChart: React.FC<{ data: ChartDataPoint[] }> = ({
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
          formatter={(value) => [`${value}`, ""]}
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

export const ClaimTypeCards: React.FC<{
  claimTypes: Array<{ type: string; count: number; color: string }>;
}> = ({ claimTypes }) => (
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
          {item.count} claims
        </p>
      </div>
    ))}
  </div>
);

export const SearchAndFilters: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
}> = ({ searchTerm, onSearchChange, onFilterClick }) => (
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

// export const ClaimsTable: React.FC<{
//   claims: Claim[];
//   onView?: (claim: Claim) => void;
// }> = ({ claims, onView }) => (
//   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//     <table className="w-full">
//       <thead className="bg-white border-b border-gray-200">
//         <tr>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Claim ID
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Employer
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Claimant
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Type
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Amount (₦)
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Status
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Date
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//             Actions
//           </th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-gray-200">
//         {claims.map((claim) => (
//           <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
//             <td className="px-6 py-4 text-sm font-medium text-gray-900">
//               {claim.claimId}
//             </td>
//             <td className="px-6 py-4 text-sm text-gray-600">
//               {claim.employer}
//             </td>
//             <td className="px-6 py-4 text-sm text-gray-600">
//               {claim.claimant}
//             </td>
//             <td className="px-6 py-4 text-sm">
//               <span className={getTypeTextColor(claim.type)}>{claim.type}</span>
//             </td>
//             <td className="px-6 py-4 text-sm font-medium text-gray-900">
//               {new Intl.NumberFormat("en-NG", {
//                 style: "currency",
//                 currency: "NGN",
//                 minimumFractionDigits: 0,
//               }).format(claim.amount)}
//             </td>
//             <td className="px-6 py-4 text-sm">
//               <Badge
//                 className={`${getStatusBadgeColor(
//                   claim.status
//                 )} font-medium text-xs`}
//               >
//                 {claim.status}
//               </Badge>
//             </td>
//             <td className="px-6 py-4 text-sm text-gray-600">{claim.date}</td>
//             <td className="px-6 py-4 text-sm">
//               <button
//                 type="button"
//                 onClick={() => onView?.(claim)}
//                 title={`View details for claim ${claim.claimId}`}
//                 className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
//                 aria-label={`View details for claim ${claim.claimId}`}
//               >
//                 <Eye className="w-4 h-4" />
//               </button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

export const ClaimsTable: React.FC<{
  claims: Claim[];
  onView?: (claim: Claim) => void;
}> = ({ claims, onView }) => {
  // Add guard clause
  if (!claims || claims.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No claims found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Claim ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Employer
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Claimant
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Amount (₦)
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {claims.map((claim) => (
            <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {claim.claimId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {claim.employer}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {claim.claimant}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={getTypeTextColor(claim.type)}>
                  {claim.type}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(claim.amount)}
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge
                  className={`${getStatusBadgeColor(
                    claim.status
                  )} font-medium text-xs`}
                >
                  {claim.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{claim.date}</td>
              <td className="px-6 py-4 text-sm">
                <button
                  type="button"
                  onClick={() => onView?.(claim)}
                  title={`View details for claim ${claim.claimId}`}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                  aria-label={`View details for claim ${claim.claimId}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
