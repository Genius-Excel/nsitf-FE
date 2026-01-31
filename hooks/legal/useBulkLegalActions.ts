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

interface UseBulkLegalActionsReturn {
  bulkReview: (recordIds: string[]) => Promise<boolean>;
  bulkApprove: (recordIds: string[]) => Promise<boolean>;
  updateSingleLegal: (
    recordId: string,
    recordStatus: "reviewed" | "approved"
  ) => Promise<boolean>;
  updateLegalDetails: (recordId: string, payload: any) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for bulk legal record actions (review, approve)
 *
 * API Endpoints:
 * - POST /api/legal-ops/manage-legal - Bulk actions
 * - PATCH /api/legal-ops/manage-legal/:id - Single update
 */
export const useBulkLegalActions = (): UseBulkLegalActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSingleLegal = async (
    recordId: string,
    recordStatus: "reviewed" | "approved"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/legal-ops/manage-legal/${recordId}`;
      const payload = { record_status: recordStatus };

      const response = await http.patchData(payload, url);

      return true;
    } catch (err: any) {
      console.error("❌ [useBulkLegalActions] Update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update legal record";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLegalDetails = async (
    recordId: string,
    payload: any
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/legal-ops/manage-legal/${recordId}`;

      await http.patchData(payload, url);

      return true;
    } catch (err: any) {
      console.error("❌ [useBulkLegalActions] Update details error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update legal record details";
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
        "/api/legal-ops/manage-legal"
      )) as unknown as BulkActionResponse;

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      const body = (response.data as any).data ?? response.data;

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
        "Failed to review legal records";
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
        "/api/legal-ops/manage-legal"
      )) as unknown as BulkActionResponse;

      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      const body = (response.data as any).data ?? response.data;

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
        "Failed to approve legal records";
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
    updateSingleLegal,
    updateLegalDetails,
    loading,
    error,
  };
};
