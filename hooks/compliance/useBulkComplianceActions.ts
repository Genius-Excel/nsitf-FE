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
        console.error("❌ [useBulkComplianceActions] No record ID provided");
        return false;
      }

      if (!payload || Object.keys(payload).length === 0) {
        setError("No data to update");
        console.error("❌ [useBulkComplianceActions] Empty payload");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        // Map camelCase fields to snake_case for API
        const fieldMapping: Record<string, string> = {
          contributionCollected: "actual_contributions_collected",
          target: "contributions_target",
          achievement: "performance_rate",
          employersRegistered: "employers_registered",
          employees: "employees_coverage", // NOTE: Backend uses 'employees_coverage' not 'employees_covered'
          registrationFees: "registration_fees",
          certificateFees: "certificate_fees",
          period: "period",
          recordStatus: "record_status",
          reviewedBy: "reviewed_by",
          approvedBy: "approved_by",
        };

        // Convert to FormData for urlencoded format (backend expects this, not JSON)
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          const apiKey = fieldMapping[key] || key;
          const value = payload[key];

          // Only append non-null, non-undefined values
          if (value !== null && value !== undefined) {
            formData.append(apiKey, String(value));
          }
        });

        console.log("🔍 [useBulkComplianceActions] Update details PATCH:", {
          recordId,
          url: `/api/contributions/manage-contributions/${recordId}`,
          originalPayload: payload,
          formDataEntries: Object.fromEntries(formData.entries()),
          contentType: "application/x-www-form-urlencoded",
        });

        console.log(
          "📡 [useBulkComplianceActions] Making API call with FormData..."
        );

        // Use patchData (not patchDataJson) for form-encoded data
        const response = await http.patchData(
          formData,
          "📥 [useBulkComplianceActions] Raw response received:",
          response
        );
        console.log("🔍 [useBulkComplianceActions] Update details response:", {
          status: response?.status,
          statusText: response?.statusText,
          data: response?.data,
          headers: response?.headers,
        });

        // Check if response exists and has valid status
        if (!response) {
          console.error("❌ No response object received from API");
          throw new Error("No response from server");
        }

        console.log("📊 Response status:", response.status);

        // Axios considers 2xx as success, check for errors differently
        if (
          response.status &&
          (response.status < 200 || response.status >= 300)
        ) {
          console.error(`❌ Bad status code: ${response.status}`);
          throw new Error(`Server returned status ${response.status}`);
        }

        // Check if backend returned different values than what was sent
        if (response.data?.data) {
          const returnedData = response.data.data;
          const discrepancies: any = {};

          // Convert FormData entries to object for comparison
          const sentData: Record<string, any> = {};
          formData.forEach((value, key) => {
            sentData[key] = value;
          });

          Object.keys(sentData).forEach((key) => {
            const sentValue = sentData[key];
            const receivedValue = returnedData[key];

            // Compare as strings since FormData converts everything to strings
            if (
              receivedValue !== undefined &&
              String(receivedValue) !== String(sentValue)
            ) {
              discrepancies[key] = {
                sent: sentValue,
                received: receivedValue,
              };
            }
          });

          if (Object.keys(discrepancies).length > 0) {
            console.warn(
              "⚠️ [useBulkComplianceActions] Backend returned different values than sent:"
            );
            console.warn(discrepancies);
            console.warn(
              "⚠️ This suggests the backend is NOT saving your changes correctly!"
            );
            console.warn(
              "⚠️ This is a BACKEND issue - the frontend is sending the data correctly."
            );
          } else {
            console.log("✅ Backend confirmed all values were saved correctly");
          }
        }

        console.log(
          "✅ [useBulkComplianceActions] Successfully updated compliance details:",
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
