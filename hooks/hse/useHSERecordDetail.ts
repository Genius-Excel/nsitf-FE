// ============================================================================
// useHSERecordDetail Hook
// ============================================================================
// Fetches a single HSE record by ID (used for detail modals)
//
// API Endpoint: GET /api/hse-ops/hse-records/{recordId}
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { HSERecord, transformHSERecordFromAPI } from "@/lib/types/hse";

interface UseHSERecordDetailReturn {
  data: HSERecord | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHSERecordDetail(
  recordId?: string
): UseHSERecordDetailReturn {
  const [data, setData] = useState<HSERecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!recordId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();
      const response = await httpService.getData(
        `/api/hse-ops/hse-records/${recordId}`
      );

      const apiRecord = response.data.data;
      const transformedRecord = transformHSERecordFromAPI(apiRecord);

      setData(transformedRecord);
    } catch (err: any) {
      console.error("Error fetching HSE record detail:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load record details"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecord,
  };
}
