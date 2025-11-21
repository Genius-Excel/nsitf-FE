// ============================================================================
// useHSEFilters Hook
// ============================================================================
// Client-side filtering and search for HSE records
// Provides memoized filtering for performance
// ============================================================================

import { useMemo } from "react";
import { HSERecord } from "@/lib/types/hse";

interface HSEFiltersConfig {
  searchTerm?: string;
  statusFilter?: string;
  recordTypeFilter?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface UseHSEFiltersReturn {
  filteredRecords: HSERecord[];
  totalCount: number;
  filteredCount: number;
}

export function useHSEFilters(
  records: HSERecord[],
  filters: HSEFiltersConfig
): UseHSEFiltersReturn {
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Search term filter (searches employer, record type, status)
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (record) =>
          record.employer.toLowerCase().includes(searchLower) ||
          record.recordType.toLowerCase().includes(searchLower) ||
          record.status.toLowerCase().includes(searchLower) ||
          record.createdByName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter !== "all") {
      filtered = filtered.filter(
        (record) =>
          record.status.toLowerCase() === filters.statusFilter?.toLowerCase()
      );
    }

    // Record type filter
    if (filters.recordTypeFilter && filters.recordTypeFilter !== "all") {
      filtered = filtered.filter(
        (record) =>
          record.recordType.toLowerCase() ===
          filters.recordTypeFilter?.toLowerCase()
      );
    }

    // Date range filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (record) => new Date(record.dateLogged) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(
        (record) => new Date(record.dateLogged) <= toDate
      );
    }

    // Sort by date (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime()
    );

    return filtered;
  }, [records, filters]);

  return {
    filteredRecords,
    totalCount: records.length,
    filteredCount: filteredRecords.length,
  };
}
