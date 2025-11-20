import { useEffect, useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  DashboardQueryParams,
  DashboardSummaryResponse,
} from "@/lib/types/dashboard";

const http = new HttpService();

export const useDashboardSummary = (params?: DashboardQueryParams) => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string if params provided
      const queryParams = new URLSearchParams();
      if (params?.month) queryParams.append("month", params.month.toString());
      if (params?.year) queryParams.append("year", params.year.toString());
      if (params?.region_id)
        queryParams.append("region_id", params.region_id.toString());

      const queryString = queryParams.toString();
      const url = `/api/dashboard/summary${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await http.getData(url);

      // Validate response structure
      if (!response?.data?.data) {
        throw new Error("Invalid API response structure");
      }

      setData(response.data as DashboardSummaryResponse);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch dashboard data";
      console.error("Dashboard fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params?.month, params?.year, params?.region_id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
    // Expose nested data with null safety
    filters: data?.data.filters ?? null,
    metricCards: data?.data.metric_cards ?? null,
    claimsDistribution: data?.data.claims_distribution ?? null,
    monthlyPerformance: data?.data.monthly_performance_trend.data ?? [],
    regionalPerformance: data?.data.regional_compliance_performance.data ?? [],
  };
};
