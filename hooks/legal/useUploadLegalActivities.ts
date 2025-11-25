// ============================================================================
// useUploadLegalActivities Hook
// ============================================================================
// Uploads legal activities Excel file with region selection
//
// API Endpoint: POST /api/legal-ops/upload-legal-activities
// Form Data: region_id (UUID), file (Excel)
// ============================================================================

import { useState } from "react";
import HttpService from "@/services/httpServices";
import { LegalUploadResponseAPI, LegalUploadResponse } from "@/lib/types/legal";

interface UseUploadLegalActivitiesReturn {
  uploadFile: (
    regionId: string,
    file: File
  ) => Promise<LegalUploadResponse | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUploadLegalActivities(): UseUploadLegalActivitiesReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    regionId: string,
    file: File
  ): Promise<LegalUploadResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!regionId) {
        throw new Error("Region ID is required");
      }

      if (!file) {
        throw new Error("File is required");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("region_id", regionId);
      formData.append("file", file);

      const httpService = new HttpService();
      const response = await httpService.postFormData(
        formData,
        "/api/legal-ops/upload-legal-activities"
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
      console.error("Error uploading legal activities:", err);
      const errorMessage =
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
