// ============================================================================
// useInspectionFilters Hook
// ============================================================================
// Client-side filtering and search for Inspection records
// Provides memoized filtering for performance
// ============================================================================

import { useMemo } from "react";
import { InspectionRecord } from "@/lib/types/inspection";

interface InspectionFiltersConfig {
  searchTerm?: string;
  performanceThreshold?: number; // Filter by minimum performance rate
  periodFilter?: string;
}

interface UseInspectionFiltersReturn {
  filteredRecords: InspectionRecord[];
  totalCount: number;
  filteredCount: number;
  totalDebtEstablished: number;
  totalDebtRecovered: number;
  avgPerformanceRate: number;
}

export function useInspectionFilters(
  records: InspectionRecord[],
  filters: InspectionFiltersConfig
): UseInspectionFiltersReturn {
  const result = useMemo(() => {
    let filtered = [...records];

    // Search term filter (searches branch, period)
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (record) =>
          record.branch.toLowerCase().includes(searchLower) ||
          record.period.toLowerCase().includes(searchLower)
      );
    }

    // Performance threshold filter
    if (filters.performanceThreshold !== undefined) {
      filtered = filtered.filter(
        (record) => record.performanceRate >= filters.performanceThreshold!
      );
    }

    // Period filter
    if (filters.periodFilter && filters.periodFilter !== "all") {
      filtered = filtered.filter((record) =>
        record.period
          .toLowerCase()
          .includes(filters.periodFilter!.toLowerCase())
      );
    }

    // Calculate aggregates for filtered data
    const totalDebtEstablished = filtered.reduce(
      (sum, record) => sum + record.debtEstablished,
      0
    );
    const totalDebtRecovered = filtered.reduce(
      (sum, record) => sum + record.debtRecovered,
      0
    );
    const avgPerformanceRate =
      filtered.length > 0
        ? filtered.reduce((sum, record) => sum + record.performanceRate, 0) /
          filtered.length
        : 0;

    // Sort by performance rate (descending)
    filtered.sort((a, b) => b.performanceRate - a.performanceRate);

    return {
      filteredRecords: filtered,
      totalCount: records.length,
      filteredCount: filtered.length,
      totalDebtEstablished,
      totalDebtRecovered,
      avgPerformanceRate,
    };
  }, [records, filters]);

  return result;
}
