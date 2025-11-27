import { useState, useMemo } from "react";
import { RegionalSummary } from "./Usecompliancedashboard";

/**
 * Client-side filtering and search for regional summary data
 * Uses memoization to avoid unnecessary recalculations
 * Follows Users pattern: no duplicate state, filtered data is computed
 */
export const useComplianceFilters = (
  regionalSummary: RegionalSummary[] | null
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [periodSearch, setPeriodSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

  // Memoized filtering - only recalculates when dependencies change
  const filteredSummary = useMemo(() => {
    if (!regionalSummary) return [];

    let filtered = regionalSummary;

    // Global search (region, branch, period)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.region.toLowerCase().includes(search) ||
          entry.branch?.toLowerCase().includes(search) ||
          entry.period.toLowerCase().includes(search)
      );
    }

    // Region filter
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedRegions.includes(entry.region)
      );
    }

    // Period filter
    if (periodSearch.trim()) {
      const period = periodSearch.toLowerCase();
      filtered = filtered.filter((entry) =>
        entry.period.toLowerCase().includes(period)
      );
    }

    // Branch filter
    if (branchSearch.trim()) {
      const branch = branchSearch.toLowerCase();
      filtered = filtered.filter((entry) =>
        entry.branch?.toLowerCase().includes(branch)
      );
    }

    return filtered;
  }, [
    regionalSummary,
    searchTerm,
    selectedRegions,
    periodSearch,
    branchSearch,
  ]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRegions([]);
    setPeriodSearch("");
    setBranchSearch("");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedRegions.length > 0 ||
    periodSearch !== "" ||
    branchSearch !== "";

  return {
    // Computed data
    filteredSummary,

    // Filter state
    searchTerm,
    selectedRegions,
    periodSearch,
    branchSearch,

    // Filter controls
    setSearchTerm,
    toggleRegion,
    setPeriodSearch,
    setBranchSearch,
    resetFilters,

    // Metadata
    totalCount: regionalSummary?.length ?? 0,
    filteredCount: filteredSummary.length,
    hasActiveFilters,
  };
};
