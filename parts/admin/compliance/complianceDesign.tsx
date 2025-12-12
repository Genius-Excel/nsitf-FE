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
import { useReportUpload } from "@/hooks/compliance";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  ariaLabel: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  colorClass,
  ariaLabel,
}) => (
  <div
    className={`${colorClass} p-4 sm:p-5 rounded-lg border transition-all hover:shadow-md`}
    role="article"
    aria-label={ariaLabel}
  >
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
      <div className="opacity-60" aria-hidden="true">
        {icon}
      </div>
    </div>
    <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
      {value}
    </p>
  </div>
);

export const DashboardCards: React.FC<{ metrics: DashboardMetrics }> = ({
  metrics,
}) => {
  return (
    <section aria-labelledby="dashboard-metrics-heading" className="mb-6">
      <h2 id="dashboard-metrics-heading" className="sr-only">
        Dashboard Metrics Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          label="Total Actual Contributions"
          value={formatCurrency(metrics.totalActualContributions)}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50 border-green-200"
          ariaLabel={`Total contributions: ${formatCurrency(
            metrics.totalActualContributions
          )}`}
        />

        <MetricCard
          label="Contributions Target"
          value={formatCurrency(metrics.contributionsTarget)}
          icon={<Target className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50 border-blue-200"
          ariaLabel={`Target amount: ${formatCurrency(
            metrics.contributionsTarget
          )}`}
        />

        <MetricCard
          label="Performance Rate"
          value={`${metrics.performanceRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50 border-green-200"
          ariaLabel={`Performance rate: ${metrics.performanceRate.toFixed(
            1
          )} percent`}
        />

        <MetricCard
          label="Total Employers"
          value={metrics.totalEmployers.toLocaleString()}
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50 border-blue-200"
          ariaLabel={`Total employers: ${metrics.totalEmployers.toLocaleString()}`}
        />

        <MetricCard
          label="Total Employees"
          value={metrics.totalEmployees.toLocaleString()}
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50 border-green-200"
          ariaLabel={`Total employees: ${metrics.totalEmployees.toLocaleString()}`}
        />
      </div>
    </section>
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
}> = ({ entries, onViewDetails, sortConfig, onSort }) => {
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const canReview = userRole === "regional_manager";
  const canApprove = userRole && ["admin", "manager"].includes(userRole);

  const handleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map(e => e.id)));
    }
  };

  const handleSelectEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleBulkReview = async () => {
    if (selectedEntries.size === 0) {
      toast.error("Please select at least one entry");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk review compliance entries
      // const response = await fetch('/api/compliance/bulk-review', {
      //   method: 'POST',
      //   body: JSON.stringify({ entryIds: Array.from(selectedEntries) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedEntries.size} entry(ies) marked as reviewed`);
      setSelectedEntries(new Set());
    } catch (error) {
      toast.error("Failed to review entries");
      console.error("Bulk review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedEntries.size === 0) {
      toast.error("Please select at least one entry");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk approve compliance entries
      // const response = await fetch('/api/compliance/bulk-approve', {
      //   method: 'POST',
      //   body: JSON.stringify({ entryIds: Array.from(selectedEntries) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedEntries.size} entry(ies) approved successfully`);
      setSelectedEntries(new Set());
    } catch (error) {
      toast.error("Failed to approve entries");
      console.error("Bulk approve error:", error);
    } finally {
      setIsSubmitting(false);
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
      {(canReview || canApprove) && selectedEntries.size > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedEntries.size} entry(ies) selected
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
          <table className="min-w-full divide-y divide-gray-200" role="table">
            <thead className="bg-gray-50 border-b">
            <tr>
              {(canReview || canApprove) && (
                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedEntries.size === entries.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label="Select all entries"
                  />
                </th>
              )}
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
                {(canReview || canApprove) && (
                  <td className="px-2 py-1.5 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEntries.has(entry.id)}
                      onChange={() => handleSelectEntry(entry.id)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label={`Select entry for ${entry.region}`}
                    />
                  </td>
                )}
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
                  <button
                    onClick={() => onViewDetails(entry)}
                    className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    aria-label={`View details for ${entry.region}`}
                  >
                    <Eye className="w-5 h-5 text-blue-600" aria-hidden="true" />
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
  const [period, setPeriod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Create multi-sheet template matching API requirements
    const wb = XLSX.utils.book_new();

    // COLLECTION sheet
    const collectionData = [
      {
        BRANCH: "",
        "CONTRIBUTION COLLECTED": "",
        TARGET: "",
        "EMPLOYERS REGISTERED": "",
        EMPLOYEES: "",
        "PERFORMANCE RATE": "",
        "REGISTRATION FEES": "",
        "CERTIFICATE FEES": "",
        PERIOD: period || "",
      },
    ];
    const wsCollection = XLSX.utils.json_to_sheet(collectionData);
    XLSX.utils.book_append_sheet(wb, wsCollection, "COLLECTION");

    // CLAIMS sheet
    const claimsData = [{ BRANCH: "", "CLAIMS DATA": "" }];
    const wsClaims = XLSX.utils.json_to_sheet(claimsData);
    XLSX.utils.book_append_sheet(wb, wsClaims, "CLAIMS");

    // INSPECTION sheet
    const inspectionData = [{ BRANCH: "", "INSPECTION DATA": "" }];
    const wsInspection = XLSX.utils.json_to_sheet(inspectionData);
    XLSX.utils.book_append_sheet(wb, wsInspection, "INSPECTION");

    // HSE sheet
    const hseData = [{ BRANCH: "", "HSE DATA": "" }];
    const wsHSE = XLSX.utils.json_to_sheet(hseData);
    XLSX.utils.book_append_sheet(wb, wsHSE, "HSE");

    const selectedRegion = regions.find((r) => r.id === selectedRegionId);
    const regionName = selectedRegion?.name || "Region";
    XLSX.writeFile(wb, `${regionName}_Regional_Report_Template.xlsx`);
  };

  const handleClose = () => {
    setSelectedRegionId("");
    setPeriod("");
    setFile(null);
    setErrors([]);
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
                Upload Compliance Data
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
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Region <span className="text-red-500">*</span>
              </label>
              <select
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
                    Download the template for {regions.find((r) => r.id === selectedRegionId)?.name}
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
                      Processing complete! Uploaded {uploadResponse?.valid_rows || 0} records.
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
                <h4 className="font-semibold text-gray-900 mb-2">Processing Summary</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(uploadResponse.processing_summary).map(([sheet, summary]: [string, any]) => (
                    <div key={sheet} className="flex justify-between items-center">
                      <span className="font-medium">{sheet}:</span>
                      <span className={summary.rows_with_errors > 0 ? "text-red-600" : "text-green-600"}>
                        {summary.valid_records_created} valid / {summary.rows_with_errors} errors
                      </span>
                    </div>
                  ))}
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
