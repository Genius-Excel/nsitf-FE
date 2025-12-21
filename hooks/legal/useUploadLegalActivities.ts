// ============================================================================
// useUploadLegalActivities Hook
// ============================================================================
// Uploads legal activities Excel file with region, branch, and period selection
//
// API Endpoint: POST /api/legal-ops/reports
// Form Data: branch_id, region_id, period, sheet, file
// ============================================================================

import { useState } from "react";
import HttpService from "@/services/httpServices";
import { LegalUploadResponseAPI, LegalUploadResponse } from "@/lib/types/legal";

interface UploadLegalParams {
  regionId: string;
  branchId: string;
  period: string;
  file: File;
}

interface UseUploadLegalActivitiesReturn {
  uploadFile: (
    params: UploadLegalParams
  ) => Promise<LegalUploadResponse | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUploadLegalActivities(): UseUploadLegalActivitiesReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    params: UploadLegalParams
  ): Promise<LegalUploadResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const { regionId, branchId, period, file } = params;

      console.log("🔍 [useUploadLegalActivities] Received params:", {
        regionId,
        branchId,
        period,
        file: file?.name,
      });

      // Validate required fields with detailed logging
      if (!regionId || regionId.trim() === "") {
        const error = "Region ID is required";
        console.error("❌", error, "- received:", regionId);
        throw new Error(error);
      }

      if (!branchId || branchId.trim() === "") {
        const error = "Branch ID is required";
        console.error("❌", error, "- received:", branchId);
        throw new Error(error);
      }

      if (!period || period.trim() === "") {
        const error = "Period is required (format: YYYY-MM)";
        console.error("❌", error, "- received:", period);
        throw new Error(error);
      }

      if (!file) {
        const error = "File is required";
        console.error("❌", error);
        throw new Error(error);
      }

      // Create FormData with all required parameters
      const formData = new FormData();
      formData.append("branch_id", branchId.trim());
      formData.append("region_id", regionId.trim());
      formData.append("period", period.trim());
      formData.append("sheet", "LEGAL");
      formData.append("file", file);

      console.log("📤 [useUploadLegalActivities] FormData entries:");
      formData.forEach((value, key) => {
        console.log(`  ${key}:`, value instanceof File ? value.name : value);
      });

      console.log("🔍 [useUploadLegalActivities] Uploading with params:", {
        branch_id: branchId,
        region_id: regionId,
        period,
        sheet: "LEGAL",
        fileName: file.name,
      });

      const httpService = new HttpService();
      const response = await httpService.postFormData(
        formData,
        "/api/legal-ops/reports"
      );

      console.log(
        "✅ [useUploadLegalActivities] Upload successful:",
        response.data
      );

      const apiResponse: LegalUploadResponseAPI = response.data;

      return {
        message: apiResponse.message,
        summary: {
          created: apiResponse.summary.created,
          updated: apiResponse.summary.updated,
          errors: apiResponse.summary.errors,
        },
      };
    } catch (err: any) {
      console.error("❌ [useUploadLegalActivities] Upload error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to upload legal activities";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    uploadFile,
    loading,
    error,
    clearError,
  };
}
