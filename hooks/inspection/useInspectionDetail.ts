// ============================================================================
// useInspectionDetail Hook
// ============================================================================
// Fetches detailed inspection data for a specific dashboard record
// Used when user clicks "View Details" on a branch record
//
// API Endpoint: GET /api/inspection-ops/inspections/dashboard/{dashboardId}/details
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  InspectionDetailAPI,
  InspectionDetail,
  transformInspectionDetailFromAPI,
} from "@/lib/types/inspection";

interface UseInspectionDetailReturn {
  data: InspectionDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInspectionDetail(
  dashboardId?: string
): UseInspectionDetailReturn {
  const [data, setData] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!dashboardId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();
      const response = await httpService.getData(
        `/api/inspection-ops/inspections/dashboard/${dashboardId}/details`
      );

      const apiData: { data: InspectionDetailAPI } = response.data;
      const transformedData = transformInspectionDetailFromAPI(apiData.data);

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching inspection detail:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load inspection details"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

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
