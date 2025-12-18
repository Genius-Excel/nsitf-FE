import { useState } from "react";
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

interface BulkHSEActionsReturn {
  bulkReview: (recordIds: string[]) => Promise<boolean>;
  bulkApprove: (recordIds: string[]) => Promise<boolean>;
  updateSingleHSE: (
    recordId: string,
    recordStatus: "reviewed" | "approved"
  ) => Promise<boolean>;
  updateHSEDetails: (recordId: string, payload: any) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for bulk HSE record actions (review, approve)
 *
 * API Endpoints:
 * - POST /api/hse-ops/manage-hse - Bulk actions
 * - PATCH /api/hse-ops/manage-hse/:id - Single update
 *
 * @example
 * ```tsx
 * const { bulkReview, bulkApprove, loading } = useBulkHSEActions();
 *
 * const handleReview = async () => {
 *   const success = await bulkReview(['id1', 'id2']);
 *   if (success) {
 *     toast.success("Records marked as reviewed");
 *   }
 * };
 * ```
 */
export const useBulkHSEActions = (): BulkHSEActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSingleHSE = async (
    recordId: string,
    recordStatus: "reviewed" | "approved"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/hse-ops/manage-hse/${recordId}`;
      const payload = { record_status: recordStatus };

      console.log("🔍 [useBulkHSEActions] PATCH request:", { url, payload });

      const response = await http.patchData(payload, url);

      console.log("🔍 [useBulkHSEActions] PATCH response:", response);
      console.log(
        "✅ [useBulkHSEActions] Updated HSE record:",
        recordId,
        recordStatus
      );

      return true;
    } catch (err: any) {
      console.error("❌ [useBulkHSEActions] Update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update HSE record";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateHSEDetails = async (
    recordId: string,
    payload: any
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/hse-ops/manage-hse/${recordId}`;

      await http.patchData(payload, url);

      console.log(
        "✅ [useBulkHSEActions] Updated HSE record details:",
        recordId
      );
      return true;
    } catch (err: any) {
      console.error("❌ [useBulkHSEActions] Update details error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update HSE record details";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkReview = async (recordIds: string[]): Promise<boolean> => {
    if (!recordIds || recordIds.length === 0) {
      setError("No record IDs provided");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = (await http.postData(
        {
          ids: recordIds,
          action: "review",
        },
        "/api/hse-ops/manage-hse"
      )) as unknown as BulkActionResponse;

      console.log("Bulk review response:", response);

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      // Support APIs that wrap payload in `data` key or return flat
      const body = (response.data as any).data ?? response.data;

      // Check if any records failed
      const updated: string[] = body?.updated ?? [];
      const missing: string[] = body?.missing ?? [];
      const errors: string[] = body?.errors ?? [];

      if ((errors?.length || 0) > 0 || (missing?.length || 0) > 0) {
        const errorMsg = `Some records failed: ${errors.length} errors, ${missing.length} not found`;
        setError(errorMsg);
        return false;
      }

      return (updated?.length || 0) > 0;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to review HSE records";
      setError(errorMessage);
      console.error("Bulk review error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkApprove = async (recordIds: string[]): Promise<boolean> => {
    if (!recordIds || recordIds.length === 0) {
      setError("No record IDs provided");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = (await http.postData(
        {
          ids: recordIds,
          action: "approve",
        },
        "/api/hse-ops/manage-hse"
      )) as unknown as BulkActionResponse;

      console.log("Bulk approve response:", response);

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      // Support APIs that wrap payload in `data` key or return flat
      const body = (response.data as any).data ?? response.data;

      // Check if any records failed
      const updated: string[] = body?.updated ?? [];
      const missing: string[] = body?.missing ?? [];
      const errors: string[] = body?.errors ?? [];

      if ((errors?.length || 0) > 0 || (missing?.length || 0) > 0) {
        const errorMsg = `Some records failed: ${errors.length} errors, ${missing.length} not found`;
        setError(errorMsg);
        return false;
      }

      return (updated?.length || 0) > 0;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to approve HSE records";
      setError(errorMessage);
      console.error("Bulk approve error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkReview,
    bulkApprove,
    updateSingleHSE,
    updateHSEDetails,
    loading,
    error,
  };
};
