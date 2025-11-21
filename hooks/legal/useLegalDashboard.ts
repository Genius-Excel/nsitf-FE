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

export function useLegalDashboard(): UseLegalDashboardReturn {
  const [data, setData] = useState<LegalDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();
      const response = await httpService.getData("/api/legal-ops/dashboard");

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
