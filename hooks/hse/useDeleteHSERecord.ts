// ============================================================================
// useDeleteHSERecord Hook
// ============================================================================
// Deletes an HSE record
//
// API Endpoint: DELETE /api/hse-ops/hse-records/{recordId}
// ============================================================================

import { useState } from "react";
import HttpService from "@/services/httpServices";

interface UseDeleteHSERecordReturn {
  deleteRecord: (recordId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useDeleteHSERecord(): UseDeleteHSERecordReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = async (recordId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!recordId) {
        throw new Error("Record ID is required");
      }

      const httpService = new HttpService();
      await httpService.deleteData(`/api/hse-ops/hse-records/${recordId}`);

      return true;
    } catch (err: any) {
      console.error("Error deleting HSE record:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete HSE record";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    deleteRecord,
    loading,
    error,
    clearError,
  };
}
