import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";

const http = new HttpService();

interface BulkActionResponse {
  message: string;
  data: {
    updated: string[];
    missing: string[];
    errors: string[];
  };
}

interface UseBulkClaimActionsReturn {
  bulkReview: (claimIds: string[]) => Promise<boolean>;
  bulkApprove: (claimIds: string[]) => Promise<boolean>;
  updateSingleClaim: (claimId: string, recordStatus: "reviewed" | "approved") => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for bulk claim review and approve actions
 * Uses the Claims Management API endpoints
 *
 * API Endpoints:
 * - POST /api/claims/manage-claims - Bulk actions
 * - PATCH /api/claims/manage-claims/:id - Single update
 *
 * @example
 * ```tsx
 * const { bulkReview, bulkApprove, loading } = useBulkClaimActions();
 *
 * const handleBulkReview = async () => {
 *   const success = await bulkReview(selectedClaimIds);
 *   if (success) {
 *     refetchClaims();
 *   }
 * };
 * ```
 */
export const useBulkClaimActions = (): UseBulkClaimActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Bulk review claims
   * POST /api/claims/manage-claims
   * Body: { ids: string[], action: "review" }
   */
  const bulkReview = useCallback(async (claimIds: string[]): Promise<boolean> => {
    if (!claimIds || claimIds.length === 0) {
      setError("No claim IDs provided");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await http.postData<BulkActionResponse>(
        "/api/claims/manage-claims",
        {
          ids: claimIds,
          action: "review",
        }
      );

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      // Check if any claims failed
      const { updated, missing, errors } = response.data;

      if (errors.length > 0 || missing.length > 0) {
        const errorMsg = `Some claims failed: ${errors.length} errors, ${missing.length} not found`;
        setError(errorMsg);
        return false;
      }

      return updated.length > 0;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to review claims";
      setError(errorMessage);
      console.error("Bulk review error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Bulk approve claims
   * POST /api/claims/manage-claims
   * Body: { ids: string[], action: "approve" }
   */
  const bulkApprove = useCallback(async (claimIds: string[]): Promise<boolean> => {
    if (!claimIds || claimIds.length === 0) {
      setError("No claim IDs provided");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await http.postData<BulkActionResponse>(
        "/api/claims/manage-claims",
        {
          ids: claimIds,
          action: "approve",
        }
      );

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      // Check if any claims failed
      const { updated, missing, errors } = response.data;

      if (errors.length > 0 || missing.length > 0) {
        const errorMsg = `Some claims failed: ${errors.length} errors, ${missing.length} not found`;
        setError(errorMsg);
        return false;
      }

      return updated.length > 0;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to approve claims";
      setError(errorMessage);
      console.error("Bulk approve error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update single claim (review or approve)
   * PATCH /api/claims/manage-claims/:id
   * Body: { record_status: "reviewed" | "approved" }
   */
  const updateSingleClaim = useCallback(
    async (claimId: string, recordStatus: "reviewed" | "approved"): Promise<boolean> => {
      if (!claimId) {
        setError("Claim ID is required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await http.updateData(
          `/api/claims/manage-claims/${claimId}`,
          {
            record_status: recordStatus,
          }
        );

        if (!response?.data) {
          throw new Error("Invalid response from server");
        }

        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${recordStatus === "reviewed" ? "review" : "approve"} claim`;
        setError(errorMessage);
        console.error("Update claim error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    bulkReview,
    bulkApprove,
    updateSingleClaim,
    loading,
    error,
  };
};
