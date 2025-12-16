import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  Claim,
  ManageClaimRecord,
  transformManageClaimRecord,
  PaginationState,
} from "@/lib/types/claims";

const http = new HttpService();

interface UseManageClaimsParams {
  page?: number;
  perPage?: number;
  branch_id?: string;
  region_id?: string;
  record_status?: "pending" | "reviewed" | "approved";
  period?: string; // YYYY-MM format
  period_from?: string; // YYYY-MM format - start period
  period_to?: string; // YYYY-MM format - end period
}

interface UseManageClaimsReturn {
  // Transformed data for components (camelCase)
  claims: Claim[];
  pagination: PaginationState | null;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
  setPage: (page: number) => void;
}

interface ManageClaimsApiResponse {
  message: string;
  data: ManageClaimRecord[];
}

/**
 * Fetches claims from the manage-claims endpoint with filtering support
 *
 * API: GET /api/claims/manage-claims?record_status=pending&region_id=xxx&period=2025-05
 *
 * Response: { message, data: [...] } where data is array of ManageClaimRecord
 *
 * @param params.page - Current page (default: 1)
 * @param params.perPage - Records per page (default: 20)
 * @param params.record_status - Filter by status: pending | reviewed | approved
 * @param params.region_id - Filter by region
 * @param params.period - Filter by period (YYYY-MM)
 * @param params.period_from - Filter by start period (YYYY-MM)
 * @param params.period_to - Filter by end period (YYYY-MM)
 *
 * @returns Transformed claims list with pagination
 *
 * @example
 * ```tsx
 * const { claims, loading, refetch } = useManageClaims({
 *   record_status: "pending",
 *   region_id: "abc-123"
 * });
 * ```
 */
export const useManageClaims = (
  params: UseManageClaimsParams = {}
): UseManageClaimsReturn => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters - only add non-empty values
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(currentPage));
      if (params.perPage) {
        queryParams.append("per_page", String(params.perPage));
      }
      if (params.record_status && params.record_status !== "") {
        queryParams.append("record_status", params.record_status);
      }
      if (params.branch_id && params.branch_id !== "") {
        queryParams.append("branch_id", params.branch_id);
      }
      if (params.region_id && params.region_id !== "") {
        queryParams.append("region_id", params.region_id);
      }
      if (params.period && params.period !== "") {
        queryParams.append("period", params.period);
      }
      if (params.period_from && params.period_from !== "") {
        queryParams.append("period_from", params.period_from);
      }
      if (params.period_to && params.period_to !== "") {
        queryParams.append("period_to", params.period_to);
      }

      console.log("Fetching claims with params:", queryParams.toString());

      const response = await http.getData(
        `/api/claims/manage-claims?${queryParams.toString()}`
      );

      if (!response?.data) {
        throw new Error("Invalid response format from API");
      }

      // API returns flat array under data: { message, data: [...] }
      const resultsData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      if (!Array.isArray(resultsData)) {
        console.error("Invalid API response structure:", response.data);
        throw new Error(
          `Expected array but got ${typeof resultsData}. Response structure: ${JSON.stringify(
            response.data
          ).substring(0, 300)}`
        );
      }

      // Transform claims using manage-claims record transformer
      const transformedClaims = resultsData.map((record: ManageClaimRecord) =>
        transformManageClaimRecord(record)
      );

      console.log(
        "Fetched and transformed claims:",
        transformedClaims.length,
        "records"
      );
      setClaims(transformedClaims);

      // Set pagination (simple: assume all records fit on page 1 unless API returns metadata)
      setPagination({
        page: currentPage,
        perPage: params.perPage || 20,
        totalPages: 1,
        totalCount: resultsData.length,
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err.message || "Failed to fetch claims";
      setError(errorMessage);
      console.error("Error fetching manage-claims:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    params.perPage,
    params.record_status,
    params.region_id,
    params.period,
    params.period_from,
    params.period_to,
  ]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    claims,
    pagination,
    loading,
    error,
    refetch: fetchClaims,
    setPage,
  };
};
