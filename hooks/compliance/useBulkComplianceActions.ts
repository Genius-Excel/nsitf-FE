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

interface UseBulkComplianceActionsReturn {
  bulkReview: (recordIds: string[]) => Promise<boolean>;
  bulkApprove: (recordIds: string[]) => Promise<boolean>;
  updateSingleCompliance: (
    recordId: string,
    recordStatus: "reviewed" | "approved"
  ) => Promise<boolean>;
  updateComplianceDetails: (recordId: string, payload: any) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for bulk compliance record actions (review, approve)
 *
 * API Endpoints:
 * - POST /api/contributions/manage-contributions - Bulk actions
 * - PATCH /api/contributions/manage-contributions/:id - Single update
 *
 * @example
 * ```tsx
 * const { bulkReview, bulkApprove, loading } = useBulkComplianceActions();
 *
 * const handleBulkReview = async () => {
 *   const success = await bulkReview(selectedRecordIds);
 *   if (success) {
 *     refetchRecords();
 *   }
 * };
 * ```
 */
export const useBulkComplianceActions = (): UseBulkComplianceActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Bulk review compliance records
   * POST /api/contributions/manage-contributions
   * Body: { ids: string[], action: "review" }
   */
  const bulkReview = useCallback(
    async (recordIds: string[]): Promise<boolean> => {
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
          "/api/contributions/manage-contributions"
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
          "Failed to review compliance records";
        setError(errorMessage);
        console.error("Bulk review error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Bulk approve compliance records
   * POST /api/contributions/manage-contributions
   * Body: { ids: string[], action: "approve" }
   */
  const bulkApprove = useCallback(
    async (recordIds: string[]): Promise<boolean> => {
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
          "/api/contributions/manage-contributions"
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
          "Failed to approve compliance records";
        setError(errorMessage);
        console.error("Bulk approve error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update single compliance record (review or approve)
   * PATCH /api/contributions/manage-contributions/:id
   * Body: { record_status: "reviewed" | "approved" }
   */
  const updateSingleCompliance = useCallback(
    async (
      recordId: string,
      recordStatus: "reviewed" | "approved"
    ): Promise<boolean> => {
      if (!recordId) {
        setError("Record ID is required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const payload = {
          record_status: recordStatus,
        };

        console.log("🔍 [useBulkComplianceActions] PATCH request:", {
          url: `/api/contributions/manage-contributions/${recordId}`,
          payload,
        });

        const response = await http.patchDataJson(
          payload,
          `/api/contributions/manage-contributions/${recordId}`
        );

        console.log("🔍 [useBulkComplianceActions] PATCH response:", response);

        if (!response?.data) {
          throw new Error("Invalid response from server");
        }

        console.log(
          "✅ [useBulkComplianceActions] Updated compliance record:",
          recordId,
          recordStatus
        );

        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${
            recordStatus === "reviewed" ? "review" : "approve"
          } compliance record`;
        setError(errorMessage);
        console.error("Update compliance record error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update compliance record details
   * PATCH /api/contributions/manage-contributions/:id
   * Body: any (depends on what fields you want to update)
   */
  const updateComplianceDetails = useCallback(
    async (recordId: string, payload: any): Promise<boolean> => {
      if (!recordId) {
        setError("Record ID is required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔍 [useBulkComplianceActions] Update details PATCH:", {
          url: `/api/contributions/manage-contributions/${recordId}`,
          payload,
        });

        const response = await http.patchDataJson(
          payload,
          `/api/contributions/manage-contributions/${recordId}`
        );

        console.log(
          "🔍 [useBulkComplianceActions] Update details response:",
          response
        );

        if (!response?.data) {
          throw new Error("Invalid response from server");
        }

        console.log(
          "✅ [useBulkComplianceActions] Updated compliance details:",
          recordId
        );

        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err.message ||
          "Failed to update compliance record details";
        setError(errorMessage);
        console.error("Update compliance details error:", err);
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
    updateSingleCompliance,
    updateComplianceDetails,
    loading,
    error,
  };
};
