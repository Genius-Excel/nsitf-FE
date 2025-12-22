// ============================================================================
// useLegalDashboard Hook
// ============================================================================
// Fetches Legal dashboard metrics including:
// - Metric cards (recalcitrant employers, defaulting employers, etc.)
// - Summary table by region and branch
// - Filter information
//
// API Endpoint: GET /api/legal-ops/dashboard
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  LegalDashboardAPI,
  LegalDashboard,
  transformLegalDashboardFromAPI,
} from "@/lib/types/legal";

interface UseLegalDashboardReturn {
  data: LegalDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLegalDashboard(
  filters: Record<string, string> = {}
): UseLegalDashboardReturn {
  const [data, setData] = useState<LegalDashboard | null>(null);
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
      const url = queryString
        ? `/api/legal-ops/dashboard?${queryString}`
        : "/api/legal-ops/dashboard";

      const response = await httpService.getData(url);

      const apiData: LegalDashboardAPI = response.data;
      const transformedData = transformLegalDashboardFromAPI(apiData.data);

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching legal dashboard:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load legal dashboard"
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
