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

export function useHSEDashboard(): UseHSEDashboardReturn {
  const [data, setData] = useState<HSEDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();
      const response = await httpService.getData("/api/hse-ops/dashboard?view=table");

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
  }, []);

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
