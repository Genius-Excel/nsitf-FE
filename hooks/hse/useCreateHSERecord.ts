// ============================================================================
// useCreateHSERecord Hook
// ============================================================================
// Creates a new HSE record
//
// API Endpoint: POST /api/hse-ops/hse-records
// Payload: record_type, employer, safety_compliance_rate, date_logged, status,
//          details (optional), recommendations (optional)
// ============================================================================

import { useState } from "react";
import HttpService from "@/services/httpServices";
import {
  HSEFormData,
  HSERecord,
  transformHSEFormToAPI,
  transformHSERecordFromAPI,
} from "@/lib/types/hse";

interface UseCreateHSERecordReturn {
  createRecord: (formData: HSEFormData) => Promise<HSERecord | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCreateHSERecord(): UseCreateHSERecordReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createRecord = async (
    formData: HSEFormData
  ): Promise<HSERecord | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (
        !formData.recordType ||
        !formData.employer ||
        !formData.dateLogged ||
        !formData.status
      ) {
        throw new Error("Please fill in all required fields");
      }

      const httpService = new HttpService();
      const apiPayload = transformHSEFormToAPI(formData);

      // Convert to FormData for urlencoded submission
      const formDataObj = new FormData();
      Object.entries(apiPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataObj.append(key, value.toString());
        }
      });

      const response = await httpService.postFormData(
        formDataObj,
        "/api/hse-ops/hse-records"
      );

      const createdRecord = transformHSERecordFromAPI(response.data.data);
      return createdRecord;
    } catch (err: any) {
      console.error("Error creating HSE record:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create HSE record";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createRecord,
    loading,
    error,
    clearError,
  };
}
