import React, { useState } from "react";
import { Filter, X, ChevronUp, ChevronDown } from "lucide-react";

export interface FilterPanelProps {
  totalEntries: number;
  filteredCount: number;
  onReset: () => void;
  hasActiveFilters: boolean;
  children: React.ReactNode;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  totalEntries,
  filteredCount,
  onReset,
  hasActiveFilters,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4" role="search" aria-label="Filter entries">
      <button
        arial-label="filter"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset rounded-t-lg"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters && <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{filteredCount} of {totalEntries} entries</span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div id="filter-content" className="px-4 py-4 border-t border-gray-200 space-y-4">
          {children}

          {hasActiveFilters && (
            <div className="pt-2 flex justify-end">
              <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors" aria-label="Clear all filters">
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
