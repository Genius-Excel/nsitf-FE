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
  // Get current user - use state to make it reactive
  const [user, setUser] = useState(getUserFromStorage());
  const userRole = user?.role;
  const userRegionId = user?.region_id;

  // Update user when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUserFromStorage());
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check on mount in case user was just logged in
    const currentUser = getUserFromStorage();
    if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(user)) {
      setUser(currentUser);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Debug: Log user data
  useEffect(() => {
    // Also check what's in localStorage directly
    const storedUser = localStorage.getItem("user");
    console.log("🔍 [useAdvancedFilters] localStorage 'user':", storedUser);

    console.log("🔍 [useAdvancedFilters] User data:", {
      fullUser: user,
      userRole,
      userRegionId,
      hasRegionId: user?.region_id !== undefined,
      userKeys: user ? Object.keys(user) : [],
    });
  }, [user, userRole, userRegionId]);

  // Current month/year as default
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  // Filter state
  const [filters, setFilters] = useState<FilterConfig>({
    selectedRegionId:
      userRole !== "admin" && userRole !== "manager" ? userRegionId || "" : "",
    selectedBranchId: "",
    selectedMonth: "", // Empty defaults to current year
    selectedYear: "", // Empty defaults to current year
    dateFrom: undefined,
    dateTo: undefined,
    useRangeMode: false, // Default to single period mode
    recordStatus: "",
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

      console.log(
        "Fetching regions from:",
        `${API_BASE_URL}/api/admin/regions`
      );
      console.log("Using token:", token ? "Token present" : "No token");

      const response = await fetch(`${API_BASE_URL}/api/admin/regions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        console.error("Fetch error for regions:", err);
        throw err;
      });

      console.log("✅ Regions response received. Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Regions API error:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "Failed to fetch regions"
        );
      }

      const result = await response.json();
      console.log("Regions API response:", result);

      // Handle different response structures
      let regionData: any[] = [];
      if (Array.isArray(result)) {
        regionData = result;
      } else if (result.data && Array.isArray(result.data)) {
        regionData = result.data;
      } else if (result.regions && Array.isArray(result.regions)) {
        regionData = result.regions;
      }

      console.log("Extracted region data:", regionData);

      // Map API response to Region format
      const mappedRegions: Region[] = regionData.map((r: any) => ({
        id: r.id || r.region_id,
        name: r.name || r.region_name,
        code: r.code || r.region_code || "",
      }));

      console.log(`Mapped ${mappedRegions.length} regions:`, mappedRegions);
      console.log("First region:", mappedRegions[0]);
      setRegions(mappedRegions);
      console.log("✅ Regions successfully set in state");
    } catch (error) {
      console.error("❌ Failed to fetch regions:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      setRegions([]);
    } finally {
      setRegionsLoading(false);
      console.log("Regions loading complete");
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

      if (!token) {
        console.warn("No access token found for fetching branches");
        setBranches([]);
        setBranchesLoading(false);
        return;
      }

      console.log("Fetching branches for region:", regionId);
      const url = `${API_BASE_URL}/api/admin/branches?region_id=${regionId}`;
      console.log("Branches API URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Branches response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Branches API error:", errorData);
        throw new Error(errorData.message || "Failed to fetch branches");
      }

      const result = await response.json();
      console.log("Branches API response:", result);

      // Handle different response structures
      let branchData: any[] = [];
      if (Array.isArray(result)) {
        branchData = result;
      } else if (result.data && Array.isArray(result.data)) {
        branchData = result.data;
      } else if (result.branches && Array.isArray(result.branches)) {
        branchData = result.branches;
      }

      console.log("Extracted branch data:", branchData);

      // Map API response to Branch format
      const mappedBranches: Branch[] = branchData.map((b: any) => ({
        id: b.id || b.branch_id,
        name: b.name || b.branch_name,
        code: b.code || b.branch_code || "",
        region_id: b.region_id || regionId,
      }));

      console.log(
        `Mapped ${mappedBranches.length} branches for region ${regionId}:`,
        mappedBranches
      );
      if (mappedBranches.length === 0) {
        console.warn(`No branches found for region ${regionId}`);
      } else {
        console.log("First branch:", mappedBranches[0]);
      }
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

  // Auto-select region for non-admin users when userRegionId becomes available
  useEffect(() => {
    const normalizedRole = userRole?.toLowerCase();
    const isNonAdmin =
      normalizedRole !== "admin" && normalizedRole !== "manager";

    console.log("🔍 [useAdvancedFilters] Auto-select check:", {
      userRole,
      normalizedRole,
      isNonAdmin,
      userRegionId,
      currentSelectedRegionId: filters.selectedRegionId,
      shouldAutoSelect: isNonAdmin && userRegionId && !filters.selectedRegionId,
    });

    if (isNonAdmin && userRegionId && !filters.selectedRegionId) {
      console.log(
        "✅ [useAdvancedFilters] Auto-selecting region for regional officer:",
        userRegionId
      );
      setFilters((prev) => ({
        ...prev,
        selectedRegionId: userRegionId,
      }));
    }
  }, [userRole, userRegionId, filters.selectedRegionId]);

  // Fetch branches when region changes
  useEffect(() => {
    if (filters.selectedRegionId) {
      console.log(
        "🔍 [useAdvancedFilters] Region changed, fetching branches for:",
        filters.selectedRegionId
      );
      fetchBranches(filters.selectedRegionId);
    } else {
      console.log(
        "⚠️ [useAdvancedFilters] No region selected, clearing branches"
      );
      setBranches([]);
    }
  }, [filters.selectedRegionId, fetchBranches]);

  // Build API query parameters
  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};

    // Region (optional)
    if (filters.selectedRegionId) {
      params.region_id = filters.selectedRegionId;
    }

    // Branch (optional)
    if (filters.selectedBranchId) {
      params.branch_id = filters.selectedBranchId;
    }

    // Period handling: mutually exclusive based on mode
    if (filters.useRangeMode) {
      // Range mode: use period_from/period_to (both required)
      if (filters.dateFrom && filters.dateTo) {
        params.period_from = filters.dateFrom;
        params.period_to = filters.dateTo;
      }
    } else {
      // Single period mode: use period only if explicitly selected
      if (filters.selectedMonth && filters.selectedYear) {
        const monthPadded = String(filters.selectedMonth).padStart(2, "0");
        params.period = `${filters.selectedYear}-${monthPadded}`;
      }
      // If no period selected, don't send any period params
      // Backend will default to appropriate behavior (current year)
    }

    // Record status (if provided)
    if (filters.recordStatus) {
      params.record_status = filters.recordStatus;
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
      selectedMonth: "", // Empty defaults to current year
      selectedYear: "", // Empty defaults to current year
      dateFrom: undefined,
      dateTo: undefined,
      useRangeMode: false, // Reset to single period mode
      recordStatus: "",
    });
  }, [userRole, userRegionId]);

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
