import React from "react";
import { Eye } from "lucide-react";
import type { ComplianceEntry, SortConfig, SortField } from "@/lib/types";
import { TableHeader } from "./TableHeader";
import { formatCurrency, getAchievementTextColor } from "@/lib/utils";

interface ComplianceTableProps {
  entries: ComplianceEntry[];
  onViewDetails: (entry: ComplianceEntry) => void; // Accept full entry
  sortConfig: SortConfig | null;
  onSort: (field: SortField) => void;
}

export const ComplianceTable: React.FC<ComplianceTableProps> = ({
  entries,
  onViewDetails,
  sortConfig,
  onSort,
}) => {
  if (entries.length === 0) {
    return (
      <div
        className="text-center py-12 bg-white rounded-lg border"
        role="status"
        aria-live="polite"
      >
        <p className="text-gray-500">
          No entries found. Try adjusting your filters or create a new region.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <TableHeader
                label="Region"
                field="region"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <TableHeader
                label="Branch"
                field="branch"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <TableHeader
                label="Actual Contributions Collected"
                field="contributionCollected"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Contributions Target"
                field="target"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Performance Rate"
                field="achievement"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Employers Registered"
                field="employersRegistered"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Employees Coverage"
                field="employees"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Registration Fees"
                field="registrationFees"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Certificate Fees"
                field="certificateFees"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Period"
                field="period"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <th
                className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-700"
                scope="col"
              >
                Approval Status
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-700"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">
                  {entry.region}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">
                  {entry.branch || <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(entry.contributionCollected)}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-700">
                  {formatCurrency(entry.target)}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right">
                  <span
                    className={`font-semibold ${getAchievementTextColor(
                      entry.achievement
                    )}`}
                  >
                    {entry.achievement.toFixed(1)}%
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-700">
                  {entry.employersRegistered.toLocaleString()}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-700">
                  {entry.employees.toLocaleString()}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-700">
                  {formatCurrency(entry.registrationFees)}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-700">
                  {formatCurrency(entry.certificateFees)}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">
                  {entry.period}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.recordStatus?.toLowerCase() === "approved"
                        ? "bg-green-100 text-green-800"
                        : entry.recordStatus?.toLowerCase() === "reviewed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {entry.recordStatus || "Pending"}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm">
                  <button
                    onClick={() => onViewDetails(entry)}
                    className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    aria-label={`View details for ${entry.region}`}
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
