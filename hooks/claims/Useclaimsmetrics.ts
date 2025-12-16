import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { DashboardMetrics, transformMetrics } from "@/lib/types/claims";

const http = new HttpService();

interface UseClaimsMetricsParams {
  region_id?: string;
  period?: string; // Format: 2025-05
}

interface UseClaimsMetricsReturn {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches aggregated claims metrics for dashboard KPI cards
 *
 * API: GET /api/claims/metrics?region_id=xxx&period=2025-05
 *
 * @param params.region_id - Optional region filter
 * @param params.period - Optional period filter (YYYY-MM format)
 *
 * @returns Transformed metrics for dashboard cards
 *
 * @example
 * ```tsx
 * const { metrics, loading } = useClaimsMetrics({
 *   region_id: "abc-123",
 *   period: "2025-05"
 * });
 * ```
 */
export const useClaimsMetrics = (
  params?: UseClaimsMetricsParams
): UseClaimsMetricsReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const queryParams = new URLSearchParams();
      if (params?.region_id) {
        queryParams.append("region_id", params.region_id);
      }
      if (params?.period) {
        queryParams.append("period", params.period);
      }

      const response = await http.getData(
        `/api/claims/metrics${
          queryParams.toString() ? "?" + queryParams.toString() : ""
        }`
      );

      if (!response?.data) {
        throw new Error("Invalid response format from API");
      }

      // API returns metric_cards directly or wrapped in data
      const metricsData = response.data.metric_cards || response.data;
      const transformedMetrics = transformMetrics(metricsData);
      setMetrics(transformedMetrics);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch claims metrics";
      setError(errorMessage);
      console.error("Error fetching claims metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [params?.region_id, params?.period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
};
