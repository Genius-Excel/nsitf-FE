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

  // Determine if user is admin (can see all regions)
  const isAdmin = userRole === "admin" || userRole === "manager";

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
    if (!filters.selectedRegionId) return [];
    return branches.filter((b) => b.region_id === filters.selectedRegionId);
  }, [branches, filters.selectedRegionId]);

  // Generate months (1-12)
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate years (current year and previous year)
  const currentYear = new Date().getFullYear();
  const years = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
  ];

  // Set default month and year on mount
  useEffect(() => {
    const now = new Date();
    const defaultMonth = String(now.getMonth() + 1);
    const defaultYear = String(now.getFullYear());

    if (!filters.selectedMonth || !filters.selectedYear) {
      onFilterChange({
        ...filters,
        selectedMonth: filters.selectedMonth || defaultMonth,
        selectedYear: filters.selectedYear || defaultYear,
      });
    }
  }, []); // Only run on mount

  // Check if filters are active
  const hasActiveFilters =
    filters.selectedRegionId ||
    filters.selectedBranchId ||
    filters.dateFrom ||
    filters.dateTo;

  const handleRegionChange = (regionId: string) => {
    onFilterChange({
      ...filters,
      selectedRegionId: regionId === "all" ? "" : regionId,
      selectedBranchId: "", // Reset branch when region changes
    });
  };

  const handleBranchChange = (branchId: string) => {
    onFilterChange({
      ...filters,
      selectedBranchId: branchId === "all" ? "" : branchId,
    });
  };

  const handleMonthChange = (month: string) => {
    onFilterChange({
      ...filters,
      selectedMonth: month,
    });
  };

  const handleYearChange = (year: string) => {
    onFilterChange({
      ...filters,
      selectedYear: year,
    });
  };

  const handleDateFromChange = (date: string) => {
    onFilterChange({
      ...filters,
      dateFrom: date,
    });
  };

  const handleDateToChange = (date: string) => {
    onFilterChange({
      ...filters,
      dateTo: date,
    });
  };

  const handleRecordStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      recordStatus:
        status === "all" ? "" : (status as "pending" | "reviewed" | "approved"),
    });
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
          {/* Region Filter (Admin only or single region for Regional Officer) */}
          {showRegionFilter && visibleRegions.length > 0 && (
            <div>
              <label
                htmlFor="region-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Region{" "}
                {!isAdmin && (
                  <span className="text-xs text-gray-500">(Your Region)</span>
                )}
              </label>

              {isAdmin ? (
                <Select
                  value={filters.selectedRegionId || "all"}
                  onValueChange={handleRegionChange}
                >
                  <SelectTrigger id="region-filter">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {visibleRegions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name} {region.code && `(${region.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium text-gray-900">
                  {visibleRegions[0]?.name}{" "}
                  {visibleRegions[0]?.code && `(${visibleRegions[0].code})`}
                </div>
              )}
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

          {/* Month and Year Selection */}
          {showMonthYearFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="month-filter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Month
                </label>
                <Select
                  value={filters.selectedMonth}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger id="month-filter">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="year-filter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Year
                </label>
                <Select
                  value={filters.selectedYear}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger id="year-filter">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Date Range Filter (Optional) */}
          {showDateRangeFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date-from"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Period From (YYYY-MM)
                </label>
                <input
                  id="date-from"
                  type="month"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2025-01"
                />
              </div>

              <div>
                <label
                  htmlFor="date-to"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Period To (YYYY-MM)
                </label>
                <input
                  id="date-to"
                  type="month"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2025-06"
                />
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
                value={filters.recordStatus || "all"}
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

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
