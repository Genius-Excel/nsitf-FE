// ============================================================================
// useLegalDetail Hook
// ============================================================================
// Fetches detailed legal activity data for a specific record
// Used when user clicks "View Details" on a record
//
// API Endpoint: GET /api/legal-ops/dashboard?legal_id={legalId}
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  LegalDetailAPI,
  LegalDetail,
  transformLegalDetailFromAPI,
} from "@/lib/types/legal";

interface UseLegalDetailReturn {
  data: LegalDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLegalDetail(legalId?: string): UseLegalDetailReturn {
  const [data, setData] = useState<LegalDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!legalId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();
      const response = await httpService.getData(
        `/api/legal-ops/dashboard?legal_id=${legalId}`
      );

      const apiData: LegalDetailAPI = response.data;
      const transformedData = transformLegalDetailFromAPI(apiData.data);

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching legal detail:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load legal activity details"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [legalId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    loading,
    error,
    refetch: fetchDetail,
  };
}
