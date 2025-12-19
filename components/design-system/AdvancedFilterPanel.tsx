/**
 * Advanced Filter Panel Component
 *
 * Comprehensive filter component with:
 * - Region filtering (role-based: Admin sees all, Regional Officer sees only their region)
 * - Branch filtering (cascades from region selection)
 * - Month/Year selection with current month default
 * - Date range filtering
 * - Backend API integration ready
 */

import React, { useState, useMemo, useEffect } from "react";
import { Filter, X, ChevronUp, ChevronDown, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterConfig {
  // Region & Branch
  selectedRegionId: string;
  selectedBranchId: string;

  // Time filters
  selectedMonth: string; // 1-12
  selectedYear: string; // YYYY
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD

  // Period mode toggle
  useRangeMode?: boolean; // Toggle between single period (month/year) and date range

  // Record status filter
  recordStatus?: "pending" | "reviewed" | "approved" | "";
}

export interface Region {
  id: string;
  name: string;
  code?: string;
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
  region_id: string;
}

interface AdvancedFilterPanelProps {
  // Data
  regions: Region[];
  branches: Branch[];

  // Current filter state
  filters: FilterConfig;

  // Callbacks
  onFilterChange: (filters: FilterConfig) => void;
  onReset: () => void;

  // Counts
  totalEntries: number;
  filteredCount: number;

  // Role-based display
  userRole?: "admin" | "regional_manager" | "manager" | string;
  userRegionId?: string; // For regional officers

  // Feature flags
  showRegionFilter?: boolean;
  showBranchFilter?: boolean;
  showMonthYearFilter?: boolean;
  showDateRangeFilter?: boolean;
  showRecordStatusFilter?: boolean;
}

export function AdvancedFilterPanel({
  regions,
  branches,
  filters,
  onFilterChange,
  onReset,
  totalEntries,
  filteredCount,
  userRole,
  userRegionId,
  showRegionFilter = true,
  showBranchFilter = true,
  showMonthYearFilter = true,
  showDateRangeFilter = false,
  showRecordStatusFilter = false,
}: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);

  // Local state for pending filter changes (not yet applied)
  const [pendingFilters, setPendingFilters] = useState<FilterConfig>(filters);

  // Sync pending filters with applied filters when filters prop changes
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  // Determine if using range mode
  const isRangeMode = pendingFilters.useRangeMode ?? false;

  // Determine if user is admin (can see all regions) - case-insensitive
  const normalizedRole = userRole?.toLowerCase();
  const isAdmin = normalizedRole === "admin" || normalizedRole === "manager";

  // Filter regions based on user role
  const visibleRegions = useMemo(() => {
    if (isAdmin) {
      return regions;
    }
    // Regional officer: only show their region
    return regions.filter((r) => r.id === userRegionId);
  }, [regions, isAdmin, userRegionId]);

  // Filter branches based on selected region
  const visibleBranches = useMemo(() => {
    if (!pendingFilters.selectedRegionId) return [];
    return branches.filter(
      (b) => b.region_id === pendingFilters.selectedRegionId
    );
  }, [branches, pendingFilters.selectedRegionId]);

  // Generate months
  const months = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" },
  ];

  // Generate years (current year and previous year)
  const currentYear = new Date().getFullYear();
  const years = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
  ];

  // Check if filters are active
  const hasActiveFilters =
    filters.selectedRegionId ||
    filters.selectedBranchId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.recordStatus ||
    (filters.selectedMonth && filters.selectedYear);

  // Check if there are pending changes
  const hasPendingChanges =
    JSON.stringify(pendingFilters) !== JSON.stringify(filters);

  // Apply filters handler
  const handleApplyFilters = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onFilterChange(pendingFilters);
  };

  // Clear filters handler
  const handleClearFilters = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setPendingFilters({
      selectedRegionId: "",
      selectedBranchId: "",
      selectedMonth: "",
      selectedYear: "",
      dateFrom: undefined,
      dateTo: undefined,
      useRangeMode: false,
      recordStatus: "",
    });
    onReset();
  };

  const handleRegionChange = (regionId: string) => {
    const newRegionId = regionId === "all" ? "" : regionId;
    const updatedFilters = {
      ...pendingFilters,
      selectedRegionId: newRegionId,
      selectedBranchId: "", // Reset branch when region changes
    };
    setPendingFilters(updatedFilters);

    // Immediately apply region change to trigger branch fetching
    onFilterChange(updatedFilters);
  };

  const handleBranchChange = (branchId: string) => {
    setPendingFilters({
      ...pendingFilters,
      selectedBranchId: branchId === "all" ? "" : branchId,
    });
  };

  const handleMonthChange = (month: string) => {
    setPendingFilters({
      ...pendingFilters,
      selectedMonth: month,
    });
  };

  const handleYearChange = (year: string) => {
    setPendingFilters({
      ...pendingFilters,
      selectedYear: year,
    });
  };

  const handleDateFromChange = (date: string) => {
    setPendingFilters({
      ...pendingFilters,
      dateFrom: date,
    });
  };

  const handleDateToChange = (date: string) => {
    setPendingFilters({
      ...pendingFilters,
      dateTo: date,
    });
  };

  const handleRecordStatusChange = (status: string) => {
    setPendingFilters({
      ...pendingFilters,
      recordStatus:
        status === "all" ? "" : (status as "pending" | "reviewed" | "approved"),
    });
  };

  const handleSelectPeriodOption = (value: string) => {
    if (value === "select-range") {
      // Open range picker modal
      setShowRangePicker(true);
    } else if (value === "current-year" || value === "clear") {
      // Clear all period filters - defaults to current year
      onFilterChange({
        ...filters,
        useRangeMode: false,
        selectedMonth: "",
        selectedYear: "",
        dateFrom: undefined,
        dateTo: undefined,
      });
    } else {
      // Regular period selection (YYYY-MM format)
      const [year, month] = value.split("-");
      onFilterChange({
        ...filters,
        useRangeMode: false,
        selectedMonth: month,
        selectedYear: year,
        dateFrom: undefined,
        dateTo: undefined,
      });
    }
  };

  const handleApplyRange = () => {
    // Validate both dates are set
    if (!pendingFilters.dateFrom || !pendingFilters.dateTo) {
      alert("Please select both start and end dates for the range.");
      return;
    }

    // Apply range mode
    setPendingFilters({
      ...pendingFilters,
      useRangeMode: true,
      selectedMonth: "",
      selectedYear: "",
    });
    setShowRangePicker(false);
  };

  const handleCancelRange = () => {
    // Reset range values if canceling
    setPendingFilters({
      ...pendingFilters,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setShowRangePicker(false);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4"
      role="search"
      aria-label="Advanced filters"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset rounded-t-lg"
        aria-expanded={isExpanded ? "true" : "false"}
        aria-controls="filter-content"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
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
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div
          id="filter-content"
          className="px-4 py-4 border-t border-gray-200 space-y-4"
        >
          {/* Region Filter - Only show for Admin */}
          {showRegionFilter && isAdmin && (
            <div>
              <label
                htmlFor="region-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Region
              </label>

              <Select
                value={pendingFilters.selectedRegionId || "all"}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger id="region-filter">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {visibleRegions.length === 0 && (
                    <SelectItem value="" disabled>
                      No regions available
                    </SelectItem>
                  )}
                  {visibleRegions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name} {region.code && `(${region.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Branch Filter */}
          {showBranchFilter && (
            <div>
              <label
                htmlFor="branch-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Branch
              </label>
              <Select
                value={filters.selectedBranchId || "all"}
                onValueChange={handleBranchChange}
                disabled={!filters.selectedRegionId && isAdmin}
              >
                <SelectTrigger id="branch-filter">
                  <SelectValue
                    placeholder={
                      !filters.selectedRegionId && isAdmin
                        ? "Select region first"
                        : "All Branches"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {visibleBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} {branch.code && `(${branch.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {visibleBranches.length === 0 && filters.selectedRegionId && (
                <p className="text-xs text-gray-500 mt-1">
                  No branches found for selected region
                </p>
              )}
            </div>
          )}

          {/* Period Filtering Section */}
          {(showMonthYearFilter || showDateRangeFilter) && (
            <div>
              <label
                htmlFor="period-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Period
              </label>
              <Select
                value={
                  isRangeMode &&
                  pendingFilters.dateFrom &&
                  pendingFilters.dateTo
                    ? `range:${pendingFilters.dateFrom}-${pendingFilters.dateTo}`
                    : pendingFilters.selectedMonth &&
                      pendingFilters.selectedYear
                    ? `${pendingFilters.selectedYear}-${String(
                        pendingFilters.selectedMonth
                      ).padStart(2, "0")}`
                    : "current-year"
                }
                onValueChange={handleSelectPeriodOption}
              >
                <SelectTrigger id="period-filter" className="w-full">
                  <SelectValue placeholder="All Data (Current Year)" />
                </SelectTrigger>
                <SelectContent>
                  {/* First Option: Select Range */}
                  <SelectItem
                    value="select-range"
                    className="font-medium text-green-600"
                  >
                    📅 Select Date Range...
                  </SelectItem>

                  {/* Current Range Display (if active) */}
                  {isRangeMode &&
                    pendingFilters.dateFrom &&
                    pendingFilters.dateTo && (
                      <SelectItem
                        value={`range:${pendingFilters.dateFrom}-${pendingFilters.dateTo}`}
                        className="bg-green-50 font-medium"
                      >
                        🎯 {pendingFilters.dateFrom} to {pendingFilters.dateTo}
                      </SelectItem>
                    )}

                  {/* Separator */}
                  <SelectItem
                    value="separator-1"
                    disabled
                    className="text-xs text-gray-400"
                  >
                    ────── Single Periods ──────
                  </SelectItem>

                  {/* Current Year Months */}
                  {months.map((month) => {
                    const currentYear = new Date().getFullYear();
                    const value = `${currentYear}-${String(
                      month.value
                    ).padStart(2, "0")}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {month.label} {currentYear}
                      </SelectItem>
                    );
                  })}

                  {/* Previous Year Months */}
                  {months.map((month) => {
                    const previousYear = new Date().getFullYear() - 1;
                    const value = `${previousYear}-${String(
                      month.value
                    ).padStart(2, "0")}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {month.label} {previousYear}
                      </SelectItem>
                    );
                  })}

                  {/* Clear Option */}
                  <SelectItem value="clear" className="text-red-600">
                    ✕ Clear Filter (Default to Current Year)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Range Picker Modal */}
          {showRangePicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Select Date Range
                  </h3>
                  <button
                    onClick={handleCancelRange}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close"
                    aria-label="Close range picker"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Current Period Display */}
                {filters.selectedMonth && filters.selectedYear && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Current Period:</strong>{" "}
                      {
                        months.find((m) => m.value === filters.selectedMonth)
                          ?.label
                      }{" "}
                      {filters.selectedYear}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="range-from"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      From Period *
                    </label>
                    <input
                      id="range-from"
                      type="month"
                      value={pendingFilters.dateFrom || ""}
                      onChange={(e) => handleDateFromChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="range-to"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      To Period *
                    </label>
                    <input
                      id="range-to"
                      type="month"
                      value={pendingFilters.dateTo || ""}
                      onChange={(e) => handleDateToChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleCancelRange}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyRange}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Record Status Filter */}
          {showRecordStatusFilter && (
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Record Status
              </label>
              <Select
                value={pendingFilters.recordStatus || "all"}
                onValueChange={handleRecordStatusChange}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Apply and Clear Filter Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={!hasPendingChanges}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Apply filters"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
