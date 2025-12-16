/**
 * Advanced Filters Hook
 *
 * Manages filter state and API integration for:
 * - Region/Branch filtering
 * - Month/Year selection
 * - Date range filtering
 * - Backend API parameter building
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUserFromStorage } from "@/lib/auth";
import type {
  FilterConfig,
  Region,
  Branch,
} from "@/components/design-system/AdvancedFilterPanel";

interface UseAdvancedFiltersProps {
  module: "compliance" | "claims" | "hse" | "legal" | "inspection";
  onFiltersChange?: (params: Record<string, string>) => void;
}

export function useAdvancedFilters({
  module,
  onFiltersChange,
}: UseAdvancedFiltersProps) {
  // Get current user
  const user = getUserFromStorage();
  const userRole = user?.role;
  const userRegionId = user?.region_id; // Assuming backend provides this

  // Current month/year as default
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  // Filter state
  const [filters, setFilters] = useState<FilterConfig>({
    selectedRegionId:
      userRole !== "admin" && userRole !== "manager" ? userRegionId || "" : "",
    selectedBranchId: "",
    selectedMonth: currentMonth,
    selectedYear: currentYear,
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Regions data
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // Branches data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // Fetch regions
  const fetchRegions = useCallback(async () => {
    try {
      setRegionsLoading(true);
      const token = localStorage.getItem("access_token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

      if (!token) {
        console.warn("No access token found. User may need to log in.");
        setRegions([]);
        setRegionsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/regions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Regions API error:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "Failed to fetch regions"
        );
      }

      const result = await response.json();

      // Map API response to Region format
      const mappedRegions: Region[] = (result.data || result || []).map(
        (r: any) => ({
          id: r.id || r.region_id,
          name: r.name || r.region_name,
          code: r.code || r.region_code,
        })
      );

      setRegions(mappedRegions);
    } catch (error) {
      console.error("Failed to fetch regions:", error);
      setRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  }, []);

  // Fetch branches for selected region
  const fetchBranches = useCallback(async (regionId: string) => {
    if (!regionId) {
      setBranches([]);
      return;
    }

    try {
      setBranchesLoading(true);
      const token = localStorage.getItem("access_token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(
        `${API_BASE_URL}/api/admin/branches?region_id=${regionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch branches");

      const result = await response.json();

      // Map API response to Branch format
      const mappedBranches: Branch[] = (result.data || result || []).map(
        (b: any) => ({
          id: b.id || b.branch_id,
          name: b.name || b.branch_name,
          code: b.code || b.branch_code,
          region_id: b.region_id || regionId,
        })
      );

      setBranches(mappedBranches);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Fetch branches when region changes
  useEffect(() => {
    if (filters.selectedRegionId) {
      fetchBranches(filters.selectedRegionId);
    } else {
      setBranches([]);
    }
  }, [filters.selectedRegionId, fetchBranches]);

  // Build API query parameters
  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};

    // Month and year (always included)
    if (filters.selectedMonth) {
      params.month = filters.selectedMonth;
    }
    if (filters.selectedYear) {
      params.year = filters.selectedYear;
    }

    // Region (optional)
    if (filters.selectedRegionId) {
      params.region_id = filters.selectedRegionId;
    }

    // Branch (optional)
    if (filters.selectedBranchId) {
      params.branch_id = filters.selectedBranchId;
    }

    // Date range (if provided)
    if (filters.dateFrom) {
      params.date_from = filters.dateFrom;
    }
    if (filters.dateTo) {
      params.date_to = filters.dateTo;
    }

    return params;
  }, [filters]);

  // Notify parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(apiParams);
    }
  }, [apiParams, onFiltersChange]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      selectedRegionId:
        userRole !== "admin" && userRole !== "manager"
          ? userRegionId || ""
          : "",
      selectedBranchId: "",
      selectedMonth: currentMonth,
      selectedYear: currentYear,
      dateFrom: undefined,
      dateTo: undefined,
    });
  }, [userRole, userRegionId, currentMonth, currentYear]);

  return {
    filters,
    regions,
    branches,
    regionsLoading,
    branchesLoading,
    apiParams,
    userRole,
    userRegionId,
    handleFilterChange,
    resetFilters,
    refetchRegions: fetchRegions,
    refetchBranches: () => fetchBranches(filters.selectedRegionId),
  };
}
