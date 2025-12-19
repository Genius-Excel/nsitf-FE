// ============================================================================
// Investment Filters Component
// ============================================================================
// Filter panel for Investment & Treasury Management module
// ============================================================================

import React, { useState, useEffect } from "react";
import { Filter, X, ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvestmentFilterParams } from "@/lib/types/investment";

interface InvestmentFiltersProps {
  filters: InvestmentFilterParams;
  onFilterChange: (filters: InvestmentFilterParams) => void;
  onReset: () => void;
  totalEntries: number;
  filteredCount: number;
  hideRecordStatus?: boolean;
}

export const InvestmentFilters: React.FC<InvestmentFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalEntries,
  filteredCount,
  hideRecordStatus = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Generate years (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const years = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear - 2), label: String(currentYear - 2) },
  ];

  // Generate period options for range (Month-Year format)
  const generatePeriodOptions = () => {
    const options = [];
    for (let year = currentYear; year >= currentYear - 2; year--) {
      for (let month = 12; month >= 1; month--) {
        const monthStr = month.toString().padStart(2, "0");
        const label = `${months[month - 1].label} ${year}`;
        options.push({
          value: `${year}-${monthStr}`,
          label,
        });
      }
    }
    return options;
  };

  const periodOptions = generatePeriodOptions();

  // Check if filters are active
  const hasActiveFilters =
    filters.selectedMonth ||
    filters.selectedYear ||
    filters.periodFrom ||
    filters.periodTo;

  // Active filter chips
  const activeFilterChips = [];
  if (filters.selectedMonth && filters.selectedYear) {
    const monthLabel = months.find(
      (m) => m.value === filters.selectedMonth
    )?.label;
    activeFilterChips.push({
      label: `${monthLabel} ${filters.selectedYear}`,
      onRemove: () =>
        onFilterChange({
          ...filters,
          selectedMonth: undefined,
          selectedYear: undefined,
        }),
    });
  }
  if (filters.periodFrom || filters.periodTo) {
    const fromLabel = filters.periodFrom
      ? periodOptions.find((p) => p.value === filters.periodFrom)?.label
      : "Start";
    const toLabel = filters.periodTo
      ? periodOptions.find((p) => p.value === filters.periodTo)?.label
      : "End";
    activeFilterChips.push({
      label: `${fromLabel} - ${toLabel}`,
      onRemove: () =>
        onFilterChange({
          ...filters,
          periodFrom: undefined,
          periodTo: undefined,
        }),
    });
  }
  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mb-4"
      role="search"
      aria-label="Filter investment records"
    >
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset rounded-t-lg"
        aria-expanded={isExpanded}
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
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Single Period Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 block">
                Single Period
              </label>
              <div className="flex gap-2">
                <Select
                  value={filters.selectedMonth}
                  onValueChange={(value) =>
                    onFilterChange({
                      ...filters,
                      selectedMonth: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.selectedYear}
                  onValueChange={(value) =>
                    onFilterChange({
                      ...filters,
                      selectedYear: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
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

            {/* Period Range Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 block">
                Period Range
              </label>
              <div className="flex gap-2 items-center">
                <Select
                  value={filters.periodFrom}
                  onValueChange={(value) =>
                    onFilterChange({
                      ...filters,
                      periodFrom: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-gray-500 text-sm">to</span>

                <Select
                  value={filters.periodTo}
                  onValueChange={(value) =>
                    onFilterChange({
                      ...filters,
                      periodTo: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-medium text-gray-600">
                Active Filters:
              </span>
              {activeFilterChips.map((chip, index) => (
                <button
                  key={index}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full hover:bg-green-100 transition-colors"
                >
                  {chip.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="pt-2 flex justify-end">
              <button
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
};
