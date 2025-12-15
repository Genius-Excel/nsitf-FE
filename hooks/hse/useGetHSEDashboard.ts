// ============================================================================
// useHSEDashboard Hook
// ============================================================================
// Fetches HSE dashboard metrics including:
// - Totals by record type
// - Recent activities
// - Monthly summary
// - Safety compliance rates
//
// API Endpoint: GET /api/hse-ops/hse-dashboard-metrics
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  HSEDashboardResponseAPI,
  HSEDashboardMetrics,
  transformHSEDashboardFromAPI,
} from "@/lib/types/hse";

interface UseHSEDashboardReturn {
  data: HSEDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHSEDashboard(filters: Record<string, string> = {}): UseHSEDashboardReturn {
  const [data, setData] = useState<HSEDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();

      // Build query string from filters
      const queryParams = new URLSearchParams({ view: 'table', ...filters }).toString();
      const url = `/api/hse-ops/dashboard?${queryParams}`;

      const response = await httpService.getData(url);

      const apiData: HSEDashboardResponseAPI = response.data;
      const transformedData = transformHSEDashboardFromAPI(apiData.data);

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching HSE dashboard:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load HSE dashboard"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
