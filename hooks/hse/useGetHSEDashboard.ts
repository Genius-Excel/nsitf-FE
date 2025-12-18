// ============================================================================
// useHSEDashboard Hook
// ============================================================================
// Fetches HSE dashboard metrics and regional summary
//
// API Endpoints:
// - GET /api/hse-ops/metrics (for metric cards)
// - GET /api/hse-ops/manage-hse (for regional summary table)
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  HSEMetricsAPI,
  ManageHSERecordAPI,
  HSEDashboardMetrics,
  transformManageHSERecord,
} from "@/lib/types/hse";

interface UseHSEDashboardReturn {
  data: HSEDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHSEDashboard(
  filters: Record<string, string> = {}
): UseHSEDashboardReturn {
  const [data, setData] = useState<HSEDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();

      // Build query string from filters
      const queryParams = new URLSearchParams(filters).toString();

      // Fetch metrics and regional summary in parallel
      const [metricsResponse, summaryResponse] = await Promise.all([
        httpService.getData(
          `/api/hse-ops/metrics${queryParams ? `?${queryParams}` : ""}`
        ),
        httpService.getData(
          `/api/hse-ops/manage-hse${queryParams ? `?${queryParams}` : ""}`
        ),
      ]);

      const metricsData: HSEMetricsAPI =
        metricsResponse.data.data || metricsResponse.data;
      const summaryData: ManageHSERecordAPI[] = Array.isArray(
        summaryResponse.data
      )
        ? summaryResponse.data
        : summaryResponse.data.data || [];

      // Transform data to UI format
      const transformedData: HSEDashboardMetrics = {
        filters: {
          regionId: filters.region_id || null,
          period: filters.period || new Date().toISOString().slice(0, 7),
          asOf: new Date().toISOString().split("T")[0],
        },
        metricCards: {
          totalActualOSHActivities:
            metricsData.metric_cards.total_osh_activities,
          targetOSHActivities: metricsData.metric_cards.total_target_activities,
          performanceRate: metricsData.metric_cards.performance_rate,
          oshEnlightenment: metricsData.metric_cards.total_osh_enlightenment,
          oshAudit: metricsData.metric_cards.total_osh_inspection_audit,
          accidentInvestigation:
            metricsData.metric_cards.total_accident_investigation,
        },
        regionalSummary: summaryData.map((record) =>
          transformManageHSERecord(record)
        ),
      };

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
