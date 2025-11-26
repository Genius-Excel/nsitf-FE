// ============================================================================
// useInspectionDashboard Hook
// ============================================================================
// Fetches Inspection dashboard metrics including:
// - Metric cards (totals, performance)
// - Inspection summary by branch
// - Monthly debts comparison chart data
// - Upcoming inspections
//
// API Endpoint: GET /api/inspection-ops/inspections/dashboard/metrics
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  InspectionDashboardAPI,
  InspectionDashboard,
  transformInspectionDashboardFromAPI,
} from "@/lib/types/inspection";

interface UseInspectionDashboardReturn {
  data: InspectionDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInspectionDashboard(): UseInspectionDashboardReturn {
  const [data, setData] = useState<InspectionDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 [Inspection Dashboard] Starting fetch...");

      const httpService = new HttpService();
      const response = await httpService.getData(
        "/api/inspection-ops/inspections/dashboard"
      );

      console.log("✅ [Inspection Dashboard] API Response received:", response);

      const apiData: { data: InspectionDashboardAPI } = response.data;

      // Debug logging
      console.log("📊 Inspection Dashboard API Response:", {
        monthly_debts_comparison: apiData.data.monthly_debts_comparison,
        isArray: Array.isArray(apiData.data.monthly_debts_comparison),
        type: typeof apiData.data.monthly_debts_comparison,
      });

      console.log("📊 Metric Cards from API:", apiData.data.metric_cards);

      const transformedData = transformInspectionDashboardFromAPI(apiData.data);

      console.log(
        "📊 Transformed monthly data:",
        transformedData.monthlyDebtsComparison
      );

      console.log("📊 Transformed metric cards:", transformedData.metricCards);

      setData(transformedData);
      console.log("✅ [Inspection Dashboard] Data loaded successfully");
    } catch (err: any) {
      console.error("❌ [Inspection Dashboard] Error fetching:", err);
      console.error("❌ [Inspection Dashboard] Error response:", err.response);
      console.error("❌ [Inspection Dashboard] Error message:", err.message);

      const errorMessage = err.response?.data?.message ||
          err.message ||
          "Failed to load inspection dashboard";

      console.error("❌ [Inspection Dashboard] Setting error state:", errorMessage);
      setError(errorMessage);
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
