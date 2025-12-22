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

      // Build query string from filters - only include defined values
      const queryParams = new URLSearchParams();
      if (filters.period) queryParams.append("period", filters.period);
      if (filters.period_from)
        queryParams.append("period_from", filters.period_from);
      if (filters.period_to) queryParams.append("period_to", filters.period_to);
      if (filters.region_id) queryParams.append("region_id", filters.region_id);
      if (filters.branch_id) queryParams.append("branch_id", filters.branch_id);
      if (filters.record_status)
        queryParams.append("record_status", filters.record_status);

      const queryString = queryParams.toString();

      // Fetch metrics and regional summary in parallel
      const [metricsResponse, summaryResponse] = await Promise.all([
        httpService.getData(
          `/api/hse-ops/metrics${queryString ? `?${queryString}` : ""}`
        ),
        httpService.getData(
          `/api/hse-ops/manage-hse${queryString ? `?${queryString}` : ""}`
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
