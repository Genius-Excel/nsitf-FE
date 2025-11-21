// ============================================================================
// useLegalFilters Hook
// ============================================================================
// Client-side filtering and search for Legal activity records
// Provides memoized filtering for performance
// ============================================================================

import { useMemo } from "react";
import { LegalActivityRecord } from "@/lib/types/legal";

interface LegalFiltersConfig {
  searchTerm?: string;
  regionFilter?: string;
  minRecalcitrant?: number;
}

interface UseLegalFiltersReturn {
  filteredRecords: LegalActivityRecord[];
  totalCount: number;
  filteredCount: number;
  totalRecalcitrant: number;
  totalDefaulting: number;
  totalCasesInstituted: number;
}

export function useLegalFilters(
  records: LegalActivityRecord[],
  filters: LegalFiltersConfig
): UseLegalFiltersReturn {
  const result = useMemo(() => {
    let filtered = [...records];

    // Search term filter (searches branch, region, period)
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (record) =>
          record.branch.toLowerCase().includes(searchLower) ||
          record.region.toLowerCase().includes(searchLower) ||
          record.activitiesPeriod.toLowerCase().includes(searchLower) ||
          record.ecsNumber.toLowerCase().includes(searchLower)
      );
    }

    // Region filter
    if (filters.regionFilter && filters.regionFilter !== "all") {
      filtered = filtered.filter(
        (record) =>
          record.region.toLowerCase() === filters.regionFilter?.toLowerCase()
      );
    }

    // Minimum recalcitrant employers filter
    if (filters.minRecalcitrant !== undefined) {
      filtered = filtered.filter(
        (record) => record.recalcitrantEmployers >= filters.minRecalcitrant!
      );
    }

    // Calculate aggregates for filtered data
    const totalRecalcitrant = filtered.reduce(
      (sum, record) => sum + record.recalcitrantEmployers,
      0
    );
    const totalDefaulting = filtered.reduce(
      (sum, record) => sum + record.defaultingEmployers,
      0
    );
    const totalCasesInstituted = filtered.reduce(
      (sum, record) => sum + record.casesInstituted,
      0
    );

    // Sort by recalcitrant employers (descending) by default
    filtered.sort((a, b) => b.recalcitrantEmployers - a.recalcitrantEmployers);

    return {
      filteredRecords: filtered,
      totalCount: records.length,
      filteredCount: filtered.length,
      totalRecalcitrant,
      totalDefaulting,
      totalCasesInstituted,
    };
  }, [records, filters]);

  return result;
}
