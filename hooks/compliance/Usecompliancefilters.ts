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
  const [achievementMin, setAchievementMin] = useState(0);
  const [achievementMax, setAchievementMax] = useState(100);
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

    // Achievement range filter
    filtered = filtered.filter(
      (entry) =>
        entry.performance_rate >= achievementMin &&
        entry.performance_rate <= achievementMax
    );

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
    achievementMin,
    achievementMax,
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
    setAchievementMin(0);
    setAchievementMax(100);
    setPeriodSearch("");
    setBranchSearch("");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedRegions.length > 0 ||
    achievementMin > 0 ||
    achievementMax < 100 ||
    periodSearch !== "" ||
    branchSearch !== "";

  return {
    // Computed data
    filteredSummary,

    // Filter state
    searchTerm,
    selectedRegions,
    achievementMin,
    achievementMax,
    periodSearch,
    branchSearch,

    // Filter controls
    setSearchTerm,
    toggleRegion,
    setAchievementMin,
    setAchievementMax,
    setPeriodSearch,
    setBranchSearch,
    resetFilters,

    // Metadata
    totalCount: regionalSummary?.length ?? 0,
    filteredCount: filteredSummary.length,
    hasActiveFilters,
  };
};
