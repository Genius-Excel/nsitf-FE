import { useMemo } from "react";
import { Claim } from "@/lib/types/claims";

interface UseClaimsFiltersParams {
  claims: Claim[];
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
}

interface UseClaimsFiltersReturn {
  filteredClaims: Claim[];
  totalFiltered: number;
}

/**
 * Client-side filtering for claims list
 * Uses memoization to avoid unnecessary recalculations
 *
 * @param params.claims - Array of claims to filter
 * @param params.searchTerm - Search across claimId, employer, claimant
 * @param params.statusFilter - Filter by status (optional)
 * @param params.typeFilter - Filter by claim type (optional)
 *
 * @returns Filtered claims array
 *
 * @example
 * ```tsx
 * const { filteredClaims } = useClaimsFilters({
 *   claims,
 *   searchTerm,
 *   statusFilter: "Paid"
 * });
 * ```
 */
export const useClaimsFilters = (
  params: UseClaimsFiltersParams
): UseClaimsFiltersReturn => {
  const { claims, searchTerm = "", statusFilter, typeFilter } = params;

  const filteredClaims = useMemo(() => {
    if (!claims) return [];

    let filtered = [...claims];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (claim) =>
          claim.claimId.toLowerCase().includes(lowerSearch) ||
          claim.employer.toLowerCase().includes(lowerSearch) ||
          claim.claimant.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(
        (claim) => claim.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Type filter
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((claim) => claim.type === typeFilter);
    }

    return filtered;
  }, [claims, searchTerm, statusFilter, typeFilter]);

  return {
    filteredClaims,
    totalFiltered: filteredClaims.length,
  };
};
