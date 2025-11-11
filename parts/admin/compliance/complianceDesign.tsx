"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  Filter,
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
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  ComplianceEntry,
  DashboardMetrics,
  FilterConfig,
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
          label="Contributions"
          value={formatCurrency(metrics.totalActualContributions)}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50 border-green-200"
          ariaLabel={`Total contributions: ${formatCurrency(
            metrics.totalActualContributions
          )}`}
        />

        <MetricCard
          label="Target"
          value={formatCurrency(metrics.contributionsTarget)}
          icon={<Target className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50 border-blue-200"
          ariaLabel={`Target amount: ${formatCurrency(
            metrics.contributionsTarget
          )}`}
        />

        <MetricCard
          label="Performance"
          value={`${metrics.performanceRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50 border-green-200"
          ariaLabel={`Performance rate: ${metrics.performanceRate.toFixed(
            1
          )} percent`}
        />

        <MetricCard
          label="Employers"
          value={metrics.totalEmployers.toLocaleString()}
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50 border-blue-200"
          ariaLabel={`Total employers: ${metrics.totalEmployers.toLocaleString()}`}
        />

        <MetricCard
          label="Employees"
          value={metrics.totalEmployees.toLocaleString()}
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50 border-green-200"
          ariaLabel={`Total employees: ${metrics.totalEmployees.toLocaleString()}`}
        />
      </div>
    </section>
  );
};

// ============= FILTER PANEL =============

export const FilterPanel: React.FC<{
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  availableRegions: string[];
  totalEntries: number;
  filteredCount: number;
}> = ({
  filterConfig,
  onFilterChange,
  availableRegions,
  totalEntries,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRegionToggle = (region: string) => {
    const newRegions = filterConfig.regions.includes(region)
      ? filterConfig.regions.filter((r) => r !== region)
      : [...filterConfig.regions, region];

    onFilterChange({ ...filterConfig, regions: newRegions });
  };

  const handleReset = () => {
    onFilterChange({
      regions: [],
      achievementMin: 0,
      achievementMax: 100,
      periodSearch: "",
      branchSearch: "",
    });
  };

  const hasActiveFilters =
    filterConfig.regions.length > 0 ||
    filterConfig.achievementMin > 0 ||
    filterConfig.achievementMax < 100 ||
    filterConfig.periodSearch ||
    filterConfig.branchSearch;

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4"
      role="search"
      aria-label="Filter compliance entries"
    >
      <button
        arial-label="filter"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset rounded-t-lg"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {filteredCount} of {totalEntries} entries
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div
          id="filter-content"
          className="px-4 py-4 border-t border-gray-200 space-y-4"
        >
          <div>
            <label
              id="region-filter-label"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Regions
            </label>
            <div
              role="group"
              aria-labelledby="region-filter-label"
              className="flex flex-wrap gap-2"
            >
              {availableRegions.map((region) => {
                const isSelected = filterConfig.regions.includes(region);
                return (
                  <button
                    arial-label="region"
                    key={region}
                    onClick={() => handleRegionToggle(region)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      isSelected
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-pressed={isSelected}
                    role="checkbox"
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="achievement-min"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Min Achievement (%)
              </label>
              <input
                id="achievement-min"
                type="number"
                min="0"
                max="100"
                value={filterConfig.achievementMin}
                onChange={(e) =>
                  onFilterChange({
                    ...filterConfig,
                    achievementMin: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="achievement-max"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Max Achievement (%)
              </label>
              <input
                id="achievement-max"
                type="number"
                min="0"
                max="100"
                value={filterConfig.achievementMax}
                onChange={(e) =>
                  onFilterChange({
                    ...filterConfig,
                    achievementMax: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="period-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Period
            </label>
            <input
              id="period-search"
              type="text"
              placeholder="e.g., June 2025"
              value={filterConfig.periodSearch}
              onChange={(e) =>
                onFilterChange({
                  ...filterConfig,
                  periodSearch: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="branch-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Branch
            </label>
            <input
              id="branch-search"
              type="text"
              placeholder="e.g., Ikeja"
              value={filterConfig.branchSearch}
              onChange={(e) =>
                onFilterChange({
                  ...filterConfig,
                  branchSearch: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {hasActiveFilters && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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
                label="Collected"
                field="contributionCollected"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Target"
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
                label="Employers"
                field="employersRegistered"
                sortConfig={sortConfig}
                onSort={onSort}
                align="right"
              />
              <TableHeader
                label="Employees"
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
                label="Cert. Fees"
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

export const ComplianceUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: ComplianceEntry[]) => void;
  regions: string[];
}> = ({ isOpen, onClose, onUploadSuccess, regions }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<ParseProgress>({
    stage: "idle",
    percentage: 0,
    message: "",
  });
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const validateRow = (row: any, rowIndex: number): UploadError[] => {
    const rowErrors: UploadError[] = [];
    REQUIRED_COLUMNS.forEach((column) => {
      const value = row[column];
      if (value === undefined || value === null || value === "") {
        rowErrors.push({
          row: rowIndex + 2,
          column,
          message: `Missing required field`,
          value: String(value || ""),
        });
        return;
      }
      const expectedType = COLUMN_TYPES[column];
      if (expectedType === "number") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          rowErrors.push({
            row: rowIndex + 2,
            column,
            message: `Expected number, got "${value}"`,
            value: String(value),
          });
        } else if (numValue < 0) {
          rowErrors.push({
            row: rowIndex + 2,
            column,
            message: `Value must be positive`,
            value: String(value),
          });
        }
      }
    });
    return rowErrors;
  };

  const processFile = async () => {
    if (!file || !selectedRegion) {
      setErrors([
        {
          row: 0,
          column: "System",
          message: "Please select a region and upload a file",
        },
      ]);
      return;
    }

    setErrors([]);
    setSuccessCount(0);

    try {
      setProgress({
        stage: "reading",
        percentage: 10,
        message: "Reading file...",
      });

      const data = await file.arrayBuffer();
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress({
        stage: "parsing",
        percentage: 30,
        message: "Parsing spreadsheet data...",
      });

      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (jsonData.length === 0) {
        throw new Error("The file contains no data rows.");
      }

      setProgress({
        stage: "validating",
        percentage: 50,
        message: "Validating data...",
      });

      const allErrors: UploadError[] = [];
      const validRows: ComplianceEntry[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowErrors = validateRow(row, index);
        if (rowErrors.length > 0) {
          allErrors.push(...rowErrors);
        } else {
          const contributionCollected = Number(row["Contribution Collected"]);
          const target = Number(row["Target"]);
          const achievement = calculateAchievement(
            contributionCollected,
            target
          );

          validRows.push({
            id: generateId(),
            region: selectedRegion,
            branch: row["Branch"],
            contributionCollected,
            target,
            achievement: Number(achievement.toFixed(2)),
            employersRegistered: Number(row["Employers Registered"]),
            employees: Number(row["Employees"]),
            registrationFees: Number(row["Registration Fees"]),
            certificateFees: Number(row["Certificate Fees"]),
            period: row["Period"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        const validationProgress = 50 + ((index + 1) / jsonData.length) * 40;
        setProgress({
          stage: "validating",
          percentage: validationProgress,
          message: `Validating row ${index + 1} of ${jsonData.length}...`,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (allErrors.length > 0) {
        setErrors(allErrors);
        setProgress({
          stage: "error",
          percentage: 100,
          message: `Validation failed with ${allErrors.length} error(s)`,
        });
        return;
      }

      setProgress({
        stage: "complete",
        percentage: 100,
        message: `Successfully validated ${validRows.length} row(s)`,
      });
      setSuccessCount(validRows.length);

      onUploadSuccess(validRows);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setErrors([
        {
          row: 0,
          column: "System",
          message: error.message || "Failed to process file.",
        },
      ]);
      setProgress({
        stage: "error",
        percentage: 100,
        message: "Processing failed",
      });
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Branch: "",
        "Contribution Collected": "",
        Target: "",
        "Employers Registered": "",
        Employees: "",
        "Registration Fees": "",
        "Certificate Fees": "",
        Period: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const regionName = selectedRegion || "All_Regions";
    XLSX.writeFile(wb, `${regionName}_Compliance_Template.xlsx`);
  };

  const handleClose = () => {
    setSelectedRegion("");
    setFile(null);
    setErrors([]);
    setProgress({ stage: "idle", percentage: 0, message: "" });
    setSuccessCount(0);
    onClose();
  };

  if (!isOpen) return null;

  const isProcessing =
    progress.stage === "reading" ||
    progress.stage === "parsing" ||
    progress.stage === "validating";

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
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Region <span className="text-red-500">*</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isProcessing}
                >
                  <option value="">Choose a region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedRegion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm text-blue-800">
                    Download the template for {selectedRegion}
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
                  if (selectedRegion && !isProcessing) {
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
                    !selectedRegion || isProcessing
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) =>
                    e.target.files?.[0] && setFile(e.target.files[0])
                  }
                  className="hidden"
                  disabled={!selectedRegion || isProcessing}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">Excel or CSV files only</p>
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
                      Processing complete! Uploaded {successCount} records.
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
                          {error.row > 0
                            ? `Row ${error.row}, Column "${error.column}": ${error.message}`
                            : `${error.column}: ${error.message}`}
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
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={processFile}
              disabled={!file || !selectedRegion || isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Upload & Validate"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
