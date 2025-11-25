import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  ClaimDetailResponse,
  ClaimDetail,
  transformClaimDetail,
} from "@/lib/types/claims";

const http = new HttpService();

interface UseClaimDetailReturn {
  data: ClaimDetail | null;
  loading: boolean;
  error: string | null;
  fetchDetail: (claimId: string) => Promise<void>;
  clearDetail: () => void;
}

/**
 * Fetches detailed information for a single claim
 * Handles the overloaded dashboard endpoint (GET /api/claims/dashboard?claim_id={id})
 *
 * @returns Claim detail data and fetch function
 *
 * @example
 * ```tsx
 * const { data, loading, fetchDetail } = useClaimDetail();
 *
 * const handleViewClaim = (claimId: string) => {
 *   fetchDetail(claimId);
 * };
 * ```
 */
export const useClaimDetail = (): UseClaimDetailReturn => {
  const [data, setData] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (claimId: string) => {
    if (!claimId) {
      setError("Claim ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the overloaded dashboard endpoint with claim_id param
      const response = await http.getData(
        `/api/claims/dashboard?claim_id=${claimId}`
      );

      if (!response?.data) {
        throw new Error("Invalid response format from API");
      }

      // Transform from snake_case to camelCase
      const transformedDetail = transformClaimDetail(response.data as ClaimDetailResponse);
      setData(transformedDetail);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch claim details";
      setError(errorMessage);
      console.error("Error fetching claim detail:", err);

      // Don't set data to null on error - keep previous data visible
      // Only clear on explicit clearDetail() call
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetail = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchDetail,
    clearDetail,
  };
};
