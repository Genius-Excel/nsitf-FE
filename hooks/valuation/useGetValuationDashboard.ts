// ============================================================================
// useValuationDashboard Hook
// ============================================================================
// Fetches Valuation & Forecasting dashboard data including:
// - Metric cards (liabilities, reserves, claims, inflows)
// - Forecasting models (claims, contributions, inspections, HSE)
// - Short-term and long-term forecasts
// - Historical data
//
// API Endpoint: GET /api/forecasting/valuation
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  ValuationAPIResponse,
  ValuationDashboardData,
  transformValuationFromAPI,
} from "@/lib/types/valuation";

interface UseValuationDashboardParams {
  model?: "prophet" | "linear";
  regionId?: string;
  horizonQuarters?: number;
}

interface UseValuationDashboardReturn {
  data: ValuationDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useValuationDashboard(
  params: UseValuationDashboardParams = {}
): UseValuationDashboardReturn {
  const { model = "prophet", regionId, horizonQuarters = 2 } = params;

  const [data, setData] = useState<ValuationDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("model", model);
      if (regionId) {
        queryParams.append("region_id", regionId);
      }
      queryParams.append("horizon_quarters", horizonQuarters.toString());

      const response = await httpService.getData(
        `/api/forecasting/valuation?${queryParams.toString()}`
      );

      const apiData: ValuationAPIResponse = response.data;
      const transformedData = transformValuationFromAPI(apiData.data);

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching Valuation dashboard:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load Valuation & Forecasting data"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [model, regionId, horizonQuarters]);

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
