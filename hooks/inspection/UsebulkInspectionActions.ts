import { useState } from "react";
import HttpService from "@/services/httpServices";
import { toast } from "sonner";

const http = new HttpService();

interface UseBulkInspectionActionsReturn {
  updateSingleInspection: (
    inspectionId: string,
    recordStatus: "reviewed" | "approved"
  ) => Promise<boolean>;
  updateInspectionDetails: (
    inspectionId: string,
    payload: any
  ) => Promise<boolean>;
  bulkReview: (inspectionIds: string[]) => Promise<void>;
  bulkApprove: (inspectionIds: string[]) => Promise<void>;
  loading: boolean;
}

/**
 * Hook for bulk inspection actions (review, approve)
 */
export const useBulkInspectionActions = (): UseBulkInspectionActionsReturn => {
  const [loading, setLoading] = useState(false);

  const updateSingleInspection = async (
    inspectionId: string,
    recordStatus: "reviewed" | "approved"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const url = `/api/inspection-ops/manage-inspections/${inspectionId}`;
      const payload = { record_status: recordStatus };

      console.log("🔍 [useBulkInspectionActions] PATCH request:", {
        url,
        payload,
      });

      const response = await http.patchDataJson(payload, url);

      console.log("🔍 [useBulkInspectionActions] PATCH response:", response);

      console.log(
        "✅ [useBulkInspectionActions] Updated inspection:",
        inspectionId,
        recordStatus
      );
      return true;
    } catch (err: any) {
      console.error("❌ [useBulkInspectionActions] Update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update inspection";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateInspectionDetails = async (
    inspectionId: string,
    payload: any
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const url = `/api/inspection-ops/manage-inspections/${inspectionId}`;

      await http.patchDataJson(payload, url);

      console.log(
        "✅ [useBulkInspectionActions] Updated inspection details:",
        inspectionId
      );
      return true;
    } catch (err: any) {
      console.error("❌ [useBulkInspectionActions] Update details error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update inspection details";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkReview = async (inspectionIds: string[]) => {
    try {
      setLoading(true);
      const url = `/api/inspection-ops/manage-inspections`;

      await http.postData(
        {
          ids: inspectionIds,
          action: "review",
        },
        url
      );

      console.log(
        "✅ [useBulkInspectionActions] Bulk reviewed:",
        inspectionIds.length
      );
      toast.success(
        `${inspectionIds.length} inspection(s) reviewed successfully`
      );
    } catch (err: any) {
      console.error("❌ [useBulkInspectionActions] Bulk review error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to review inspections";
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkApprove = async (inspectionIds: string[]) => {
    try {
      setLoading(true);
      const url = `/api/inspection-ops/manage-inspections`;

      await http.postData(
        {
          ids: inspectionIds,
          action: "approve",
        },
        url
      );

      console.log(
        "✅ [useBulkInspectionActions] Bulk approved:",
        inspectionIds.length
      );
      toast.success(
        `${inspectionIds.length} inspection(s) approved successfully`
      );
    } catch (err: any) {
      console.error("❌ [useBulkInspectionActions] Bulk approve error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to approve inspections";
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateSingleInspection,
    updateInspectionDetails,
    bulkReview,
    bulkApprove,
    loading,
  };
};
