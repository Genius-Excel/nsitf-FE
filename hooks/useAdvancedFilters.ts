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

// Helper to check if user can see all regions
// Admin, Manager, and specialized officers (legal, hse, compliance, claims, inspection) get full region access
// Regional officers and regional managers are locked to their region
const isHQRole = (role: string | undefined) => {
  if (!role) return true; // Default to full access if role is undefined
  const normalized = role.toLowerCase().trim().replace(/\s+/g, "_");
  return (
    normalized === "admin" ||
    normalized === "manager" ||
    normalized === "legal_officer" ||
    normalized === "hse_officer" ||
    normalized === "compliance_officer" ||
    normalized === "claims_officer" ||
    normalized === "actuary" ||
    normalized === "inspection_officer" ||
    normalized === "inspector_officer"
  );
};

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
  }, [user, userRole, userRegionId]);

  // Current month/year as default
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  // Determine initial region based on user role
  const getInitialRegionId = () => {
    const isRegionalUser = !isHQRole(userRole);

    // For regional officers/managers, use their region_id
    if (isRegionalUser && userRegionId) {
      return userRegionId;
    }
    // For HQ users (admin, officers, etc.), start with empty (all regions)
    return "";
  };

  // Filter state
  const [filters, setFilters] = useState<FilterConfig>({
    selectedRegionId: getInitialRegionId(),
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
        setRegions([]);
        setRegionsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/regions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        console.error("Fetch error for regions:", err);
        throw err;
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Regions API error:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "Failed to fetch regions"
        );
      }

      const result = await response.json();

      // API returns: { message, count, data: Region[] }
      // Handle different response structures
      let regionData: any[] = [];
      if (result.data && Array.isArray(result.data)) {
        // Standard API format: { data: Region[] }
        regionData = result.data;
      } else if (Array.isArray(result)) {
        // Direct array
        regionData = result;
      } else if (result.regions && Array.isArray(result.regions)) {
        // Alternative format
        regionData = result.regions;
      } else {
        console.warn("Unexpected API response structure:", result);
      }

      // Map API response to Region format
      const mappedRegions: Region[] = regionData.map((r: any) => ({
        id: r.id || r.region_id,
        name: r.name || r.region_name,
        code: r.code || r.region_code || "",
      }));

      setRegions(mappedRegions);
    } catch (error) {
      console.error("❌ Failed to fetch regions:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
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

      if (!token) {
        setBranches([]);
        setBranchesLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/admin/branches?region_id=${regionId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Branches API error:", errorData);
        throw new Error(errorData.message || "Failed to fetch branches");
      }

      const result = await response.json();

      // Handle different response structures
      let branchData: any[] = [];
      if (Array.isArray(result)) {
        branchData = result;
      } else if (result.data && Array.isArray(result.data)) {
        branchData = result.data;
      } else if (result.branches && Array.isArray(result.branches)) {
        branchData = result.branches;
      }

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
    console.log(
      "🔍 [useAdvancedFilters] useEffect triggered - calling fetchRegions"
    );
    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - run once on mount

  // Auto-select and lock region for regional users
  useEffect(() => {
    const isRegionalUser = !isHQRole(userRole);

    console.log("🔍 [useAdvancedFilters] Region sync check:", {
      userRole,
      normalizedRole: userRole?.toLowerCase().trim(),
      isRegionalUser,
      userRegionId,
      currentSelectedRegionId: filters.selectedRegionId,
    });

    // For regional officers/managers: force their region to be selected
    if (isRegionalUser && userRegionId) {
      if (filters.selectedRegionId !== userRegionId) {
        console.log(
          "✅ [useAdvancedFilters] Locking region for regional user:",
          userRegionId
        );
        setFilters((prev) => ({
          ...prev,
          selectedRegionId: userRegionId,
        }));
      }
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
        // Keep "YYYY-MM" format as per API spec
        params.period_from = filters.dateFrom;
        params.period_to = filters.dateTo;
      }
    } else {
      // Single period mode: use period only if explicitly selected
      if (filters.selectedMonth && filters.selectedYear) {
        const monthPadded = String(filters.selectedMonth).padStart(2, "0");
        // Keep "YYYY-MM" format as per API spec
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
      selectedRegionId: isHQRole(userRole) ? "" : userRegionId || "",
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
    fetchBranchesForRegion: fetchBranches, // Allow fetching branches for any region
  };
}
