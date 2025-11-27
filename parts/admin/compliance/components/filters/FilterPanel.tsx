import React, { useState } from "react";
import { Filter, X, ChevronUp, ChevronDown } from "lucide-react";

export const FilterPanel: React.FC<{
  selectedRegions: string[];
  periodSearch: string;
  branchSearch: string;
  availableRegions: string[];
  totalEntries: number;
  filteredCount: number;
  onRegionToggle: (region: string) => void;
  onPeriodChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onReset: () => void;
}> = ({
  selectedRegions,
  periodSearch,
  branchSearch,
  availableRegions,
  totalEntries,
  filteredCount,
  onRegionToggle,
  onPeriodChange,
  onBranchChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    selectedRegions.length > 0 ||
    periodSearch ||
    branchSearch;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4" role="search" aria-label="Filter compliance entries">
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
          <div>
            <label id="region-filter-label" className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
            <div role="group" aria-labelledby="region-filter-label" className="flex flex-wrap gap-2">
              {availableRegions.map((region) => {
                const isSelected = selectedRegions.includes(region);
                return (
                  <button
                    arial-label="region"
                    key={region}
                    onClick={() => onRegionToggle(region)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      isSelected ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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

          <div>
            <label htmlFor="period-search" className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <input id="period-search" type="text" placeholder="e.g., June 2025" value={periodSearch}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <div>
            <label htmlFor="branch-search" className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <input id="branch-search" type="text" placeholder="e.g., Ikeja" value={branchSearch}
              onChange={(e) => onBranchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

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
