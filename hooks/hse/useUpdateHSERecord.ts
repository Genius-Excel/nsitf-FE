// ============================================================================
// useUpdateHSERecord Hook
// ============================================================================
// Updates an existing HSE record
//
// API Endpoint: PATCH /api/hse-ops/hse-records/{recordId}
// Payload: details, reports, status, recommendations (all optional)
// ============================================================================

import { useState } from "react";
import HttpService from "@/services/httpServices";
import { HSERecord, transformHSERecordFromAPI } from "@/lib/types/hse";

interface UpdateHSERecordPayload {
  details?: string;
  reports?: string;
  status?: string;
  recommendations?: string;
}

interface UseUpdateHSERecordReturn {
  updateRecord: (
    recordId: string,
    payload: UpdateHSERecordPayload
  ) => Promise<HSERecord | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUpdateHSERecord(): UseUpdateHSERecordReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecord = async (
    recordId: string,
    payload: UpdateHSERecordPayload
  ): Promise<HSERecord | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!recordId) {
        throw new Error("Record ID is required");
      }

      const httpService = new HttpService();

      // Convert to FormData for urlencoded submission
      const formDataObj = new FormData();
      if (payload.details) formDataObj.append("details", payload.details);
      if (payload.reports) formDataObj.append("reports", payload.reports);
      if (payload.status) formDataObj.append("status", payload.status);
      if (payload.recommendations)
        formDataObj.append("recommendations", payload.recommendations);

      const response = await httpService.patchData(
        formDataObj,
        `/api/hse-ops/hse-records/${recordId}`
      );

      const updatedRecord = transformHSERecordFromAPI(response.data.data);
      return updatedRecord;
    } catch (err: any) {
      console.error("Error updating HSE record:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update HSE record";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updateRecord,
    loading,
    error,
    clearError,
  };
}
