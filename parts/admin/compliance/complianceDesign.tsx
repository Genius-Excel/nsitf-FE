"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  Search,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  TrendingUp,
  Target,
  Users,
  Building2,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  FileSpreadsheet,
  FileCheck,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  ComplianceEntry,
  DashboardMetrics,
  SortConfig,
  SortField,
  Notification as NotificationType,
  UploadError,
  ParseProgress,
} from "@/lib/types";
import {
  formatCurrency,
  formatCurrencyFull,
  getAchievementTextColor,
  calculateAchievement,
  generateId,
} from "@/lib/utils";
import { REQUIRED_COLUMNS, COLUMN_TYPES } from "@/lib/Constants";
import { useReportUpload, useBulkComplianceActions } from "@/hooks/compliance";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/hooks/users";

// ============= NOTIFICATION COMPONENT =============

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  const { type, message, id } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      onClose(id);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
        );
      case "error":
        return (
          <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
        );
      case "warning":
        return (
          <AlertTriangle
            className="w-5 h-5 text-orange-600"
            aria-hidden="true"
          />
        );
      case "info":
        return <Info className="w-5 h-5 text-blue-600" aria-hidden="true" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "info":
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-orange-800";
      case "info":
        return "text-blue-800";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "text-green-600 hover:text-green-800 focus:ring-green-300";
      case "error":
        return "text-red-600 hover:text-red-800 focus:ring-red-300";
      case "warning":
        return "text-orange-600 hover:text-orange-800 focus:ring-orange-300";
      case "info":
        return "text-blue-600 hover:text-blue-800 focus:ring-blue-300";
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${getStyles()} animate-slide-in-right max-w-md`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <p className={`text-sm font-medium flex-1 ${getTextColor()}`}>
          {message}
        </p>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC<{
  notifications: NotificationType[];
  onClose: (id: string) => void;
}> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// ============= DASHBOARD CARDS =============

import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";

export const DashboardCards: React.FC<{ metrics: DashboardMetrics }> = ({
  metrics,
}) => {
  return (
    <MetricsGrid columns={5}>
      <MetricCard
        title="TOTAL ACTUAL CONTRIBUTIONS"
        value={formatCurrency(metrics.totalActualContributions)}
        icon={<TrendingUp className="w-5 h-5" />}
        colorScheme="green"
      />

      <MetricCard
        title="CONTRIBUTIONS TARGET"
        value={formatCurrency(metrics.contributionsTarget)}
        icon={<Target className="w-5 h-5" />}
        colorScheme="blue"
      />

      <MetricCard
        title="PERFORMANCE RATE (Actual / Targeted Contributions)"
        value={`${metrics.performanceRate.toFixed(1)}%`}
        icon={<TrendingUp className="w-5 h-5" />}
        colorScheme="green"
      />

      <MetricCard
        title="TOTAL EMPLOYERS"
        value={metrics.totalEmployers.toLocaleString()}
        icon={<Building2 className="w-5 h-5" />}
        colorScheme="blue"
      />

      <MetricCard
        title="TOTAL EMPLOYEES"
        value={metrics.totalEmployees.toLocaleString()}
        icon={<UserCheck className="w-5 h-5" />}
        colorScheme="green"
      />
    </MetricsGrid>
  );
};

// ============= COMPLIANCE TABLE =============

interface TableHeaderProps {
  label: string;
  field: SortField;
  sortConfig: SortConfig | null;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}

const TableHeader: React.FC<TableHeaderProps> = ({
  label,
  field,
  sortConfig,
  onSort,
  align = "left",
}) => {
  const isSorted = sortConfig?.field === field;
  const direction = sortConfig?.direction;

  return (
    <th className={`px-3 sm:px-4 py-3 text-${align}`} scope="col">
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:underline group"
        aria-label={`Sort by ${label}`}
      >
        <span>{label}</span>
        {isSorted ? (
          direction === "asc" ? (
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown
            className="w-4 h-4 opacity-0 group-hover:opacity-50"
            aria-hidden="true"
          />
        )}
      </button>
    </th>
  );
};

export const ComplianceTable: React.FC<{
  entries: ComplianceEntry[];
  onViewDetails: (entry: ComplianceEntry) => void;
  sortConfig: SortConfig | null;
  onSort: (field: SortField) => void;
  onRefresh?: () => void;
}> = ({ entries, onViewDetails, sortConfig, onSort, onRefresh }) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Import the bulk actions hook
  const { bulkReview, bulkApprove, loading } = useBulkComplianceActions();

  // Get user role
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  // Clear selected records when entries change (after refresh)
  useEffect(() => {
    // Validate selected records still exist after data refresh
    const currentEntryIds = new Set(entries.map((e) => e.id));
    const validSelected = Array.from(selectedRecords).filter((id) =>
      currentEntryIds.has(id)
    );
    if (validSelected.length !== selectedRecords.size) {
      setSelectedRecords(new Set(validSelected));
    }
  }, [entries]);

  // Permission checks
  const normalizedRole = userRole?.toLowerCase();
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer" ||
    normalizedRole === "admin";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  // Select/deselect all
  const handleSelectAll = () => {
    if (selectedRecords.size === entries.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(entries.map((c) => c.id)));
    }
  };

  // Select/deselect individual record
  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  // Bulk review handler
  const handleBulkReview = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    const recordIds = Array.from(selectedRecords);
    const success = await bulkReview(recordIds);

    if (success) {
      setSelectedRecords(new Set());
      // Refresh data immediately to show updated status
      if (onRefresh) {
        await onRefresh();
      }
      toast.success(`${recordIds.length} record(s) marked as reviewed`);
    } else {
      toast.error("Failed to review records");
    }
  };

  // Bulk approve handler
  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    const recordIds = Array.from(selectedRecords);
    const success = await bulkApprove(recordIds);

    if (success) {
      setSelectedRecords(new Set());
      // Refresh data immediately to show updated status
      if (onRefresh) {
        await onRefresh();
      }
      toast.success(`${recordIds.length} record(s) approved successfully`);
    } else {
      toast.error("Failed to approve records");
    }
  };

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
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Bulk Action Buttons */}
      {selectedRecords.size > 0 && (
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedRecords.size} record(s) selected
          </span>
          <div className="flex gap-2">
            {canReview && (
              <Button
                onClick={handleBulkReview}
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {loading ? "Processing..." : "Mark as Reviewed"}
              </Button>
            )}
            {canApprove && (
              <Button
                onClick={handleBulkApprove}
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? "Processing..." : "Approve Selected"}
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200" role="table">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === entries.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label="Select all records"
                  />
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("region")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Region"
                  >
                    <span>Region</span>
                    {sortConfig?.field === "region" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("branch")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Branch"
                  >
                    <span>Branch</span>
                    {sortConfig?.field === "branch" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("contributionCollected")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Collected"
                  >
                    <span>Collected</span>
                    {sortConfig?.field === "contributionCollected" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("target")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Target"
                  >
                    <span>Target</span>
                    {sortConfig?.field === "target" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("achievement")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Performance Rate"
                  >
                    <span>Performance Rate</span>
                    {sortConfig?.field === "achievement" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("employersRegistered")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Total Employers"
                  >
                    <span>Total Employers</span>
                    {sortConfig?.field === "employersRegistered" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("employees")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Total Employees"
                  >
                    <span>Total Employees</span>
                    {sortConfig?.field === "employees" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("registrationFees")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Registration Fees"
                  >
                    <span>Registration Fees</span>
                    {sortConfig?.field === "registrationFees" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("certificateFees")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Certificate Fees"
                  >
                    <span>Certificate Fees</span>
                    {sortConfig?.field === "certificateFees" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  <button
                    onClick={() => onSort("period")}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline group"
                    aria-label="Sort by Period"
                  >
                    <span>Period</span>
                    {sortConfig?.field === "period" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="w-4 h-4 opacity-0 group-hover:opacity-50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
                  scope="col"
                >
                  Approval Status
                </th>
                <th
                  className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words"
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
                  <td className="px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(entry.id)}
                      onChange={() => handleSelectRecord(entry.id)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label={`Select ${entry.region}`}
                    />
                  </td>
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
                      <Eye
                        className="w-5 h-5 text-blue-600"
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============= ADD REGION MODAL =============

export const AddRegionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (data: {
    region: string;
    branch: string;
    target: number;
    period: string;
  }) => void;
  regions: string[];
  onAddRegion: (name: string) => void;
  onDeleteRegion: (name: string) => void;
}> = ({
  isOpen,
  onClose,
  onAddEntry,
  regions,
  onAddRegion,
  onDeleteRegion,
}) => {
  const [formData, setFormData] = useState({
    region: "",
    branch: "",
    target: 0,
    period: "",
  });
  const [newRegionName, setNewRegionName] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setFormData({ region: "", branch: "", target: 0, period: "" });
    setNewRegionName("");
    setFormErrors([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!formData.region.trim()) errors.push("Region is required");
    if (!formData.target || formData.target <= 0)
      errors.push("Target must be greater than 0");

    setFormErrors(errors);
    if (errors.length === 0) {
      onAddEntry(formData);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Create Region
              </h2>
              <p className="text-sm text-gray-600">Add a new region target</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">
                      Please fix the following errors:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Manage Regions
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Add new regions or remove unused ones.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="New region name"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  aria-label="plus"
                  type="button"
                  onClick={() => {
                    if (newRegionName.trim()) {
                      onAddRegion(newRegionName.trim());
                      setNewRegionName("");
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <div
                    key={region}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full"
                  >
                    <span className="text-sm font-medium">{region}</span>
                    <button
                      aria-label="trash"
                      type="button"
                      onClick={() => onDeleteRegion(region)}
                      className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Region Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region <span className="text-red-500">*</span>
                    <select
                      value={formData.region}
                      onChange={(e) =>
                        setFormData({ ...formData, region: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select region</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.target || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="20000000"
                    required
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============= UPLOAD MODAL =============

interface Region {
  id: string;
  name: string;
}

export const ComplianceUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  regions: Region[];
}> = ({ isOpen, onClose, onUploadSuccess, regions }) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  // Get user info for role-based filtering
  const user = getUserFromStorage();
  const userRegionId = user?.region_id;
  const userRole = user?.role?.toLowerCase();
  // Only regional_officer and regional_manager are regional roles
  const normalizedRole = userRole?.toLowerCase().replace(/\s+/g, "_");
  const isRegionalOfficer =
    normalizedRole === "regional_officer" ||
    normalizedRole === "regional_manager";

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch branches for the selected region
  const {
    data: branches,
    loading: branchesLoading,
    fetchBranches,
    clearBranches,
  } = useBranches();

  // Use the upload hook
  const { uploadReport, progress, uploadResponse, isUploading, reset } =
    useReportUpload({
      onSuccess: () => {
        onUploadSuccess();
        setTimeout(() => {
          handleClose();
        }, 2000);
      },
      onError: (error) => {
        setErrors([{ message: error }]);
      },
    });

  // Auto-select region for regional officers (they cannot change it)
  useEffect(() => {
    if (isRegionalOfficer && userRegionId) {
      console.log(
        "🔍 [ComplianceUploadModal] Auto-selecting region for regional officer:",
        userRegionId
      );
      setSelectedRegionId(userRegionId);
    }
  }, [isRegionalOfficer, userRegionId]);

  // Fetch branches when region is selected
  useEffect(() => {
    if (selectedRegionId) {
      console.log(
        "🔍 [ComplianceUploadModal] Fetching branches for region:",
        selectedRegionId
      );
      fetchBranches(selectedRegionId);
    } else {
      clearBranches();
      setSelectedBranchId("");
    }
  }, [selectedRegionId, fetchBranches, clearBranches]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 [ComplianceUploadModal] State:", {
      isOpen,
      userRole,
      userRegionId,
      isRegionalOfficer,
      selectedRegionId,
      regionsCount: regions?.length || 0,
      branchesCount: branches?.length || 0,
      branchesLoading,
    });
  }, [
    isOpen,
    userRole,
    userRegionId,
    isRegionalOfficer,
    selectedRegionId,
    regions,
    branches,
    branchesLoading,
  ]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const handleUploadFile = async () => {
    if (!file || !selectedRegionId || !period) {
      setErrors([
        {
          message:
            "Please select a region, enter period (YYYY-MM), and upload a file",
        },
      ]);
      return;
    }

    setErrors([]);

    try {
      await uploadReport(file, selectedRegionId, period);

      // If upload completed with errors, show them
      if (uploadResponse?.status === "completed_with_errors") {
        setErrors(uploadResponse.errors_sample || []);
      }
    } catch (error) {
      // Error handling is done by the hook
      console.error("Upload error:", error);
    }
  };

  const handleDownloadTemplate = () => {
    const selectedRegion = regions.find((r) => r.id === selectedRegionId);
    const regionName = selectedRegion?.name || "Region";

    // Download pre-made template file from public folder
    const templatePath = "/templates/compliance_template.xlsx";
    const fileName = `${regionName}_Regional_Report_Template.xlsx`;

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = templatePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Template downloaded: ${fileName}`);
  };

  const handleClose = () => {
    setSelectedRegionId("");
    setSelectedBranchId("");
    setPeriod("");
    setFile(null);
    setErrors([]);
    clearBranches();
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Upload Contributions Data
              </h2>
            </div>
            <button
              aria-label="cancel"
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Region Selection/Display */}
            {!isRegionalOfficer ? (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Region <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Select region"
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isUploading}
                >
                  <option value="">Choose a region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Region
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700">
                  {regions.find((r) => r.id === selectedRegionId)?.name ||
                    (user as any)?.organization?.name ||
                    "Your Region"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your assigned region (auto-selected)
                </p>
              </div>
            )}

            {/* Branch Selection - Shows when region is selected */}
            {selectedRegionId && branches && branches.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Branch{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <select
                  aria-label="Select branch"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isUploading || branchesLoading}
                >
                  <option value="">-- All Branches --</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {branchesLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading branches...
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Period <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="YYYY-MM (e.g., 2025-11)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the reporting period in YYYY-MM format
              </p>
            </div>

            {selectedRegionId && period && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm text-blue-800">
                    Download the template for{" "}
                    {regions.find((r) => r.id === selectedRegionId)?.name}
                  </span>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => {
                  if (selectedRegionId && !isUploading) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${
                    isDragging
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  ${
                    !selectedRegionId || isUploading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && setFile(e.target.files[0])
                  }
                  className="hidden"
                  title="Upload File"
                  aria-label="Upload File"
                  disabled={!selectedRegionId || isUploading}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">Upload your file</p>
              </div>
            </div>

            {progress.stage !== "idle" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {progress.message}
                  </span>
                  <span className="text-gray-600">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 h-2 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {progress.stage === "complete" && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Processing complete! Uploaded{" "}
                      {uploadResponse?.valid_rows || 0} records.
                    </span>
                  </div>
                )}
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-2">
                      Found {errors.length} validation error(s):
                    </p>
                    <ul className="space-y-1 text-sm text-red-700">
                      {errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="font-mono">
                          {error.sheet && error.row
                            ? `${error.sheet} - Row ${error.row}, Column "${error.column}": ${error.message}`
                            : error.message || JSON.stringify(error)}
                        </li>
                      ))}
                      {errors.length > 10 && (
                        <li className="text-gray-600 italic">
                          ... and {errors.length - 10} more error(s)
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {uploadResponse && uploadResponse.processing_summary && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Processing Summary
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(uploadResponse.processing_summary).map(
                    ([sheet, summary]: [string, any]) => (
                      <div
                        key={sheet}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium">{sheet}:</span>
                        <span
                          className={
                            summary.rows_with_errors > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {summary.valid_records_created} valid /{" "}
                          {summary.rows_with_errors} errors
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadFile}
              disabled={!file || !selectedRegionId || !period || isUploading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload to Server"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
