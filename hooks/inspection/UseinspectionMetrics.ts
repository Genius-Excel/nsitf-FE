import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

const http = new HttpService();

interface InspectionMetrics {
  totalInspections: number;
  totalDemandNotice: number;
  totalDebtEstablished: number;
  totalDebtRecovered: number;
  performanceRate: number;
}

interface MonthlyDebtsData {
  month: string;
  debtsEstablished: number;
  debtsRecovered: number;
}

interface UseInspectionMetricsReturn {
  metrics: InspectionMetrics | null;
  monthlyChart: MonthlyDebtsData[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches inspection metrics (KPI cards and charts) without filters
 * Always shows overall data regardless of table filters
 */
export const useInspectionMetrics = (): UseInspectionMetricsReturn => {
  const [metrics, setMetrics] = useState<InspectionMetrics | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyDebtsData[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/inspection-ops/metrics`;
      const response = await http.getData(url);

      console.log("🔍 [useInspectionMetrics] API Response:", response);

      // API returns { message, data: { metric_cards, monthly_debts_comparison } }
      const apiData = response.data?.data || response.data;

      console.log("🔍 [useInspectionMetrics] Parsed apiData:", apiData);

      // Transform metric cards
      if (apiData.metric_cards) {
        setMetrics({
          totalInspections: apiData.metric_cards.total_inspections || 0,
          totalDemandNotice: apiData.metric_cards.total_demand_notice || 0,
          totalDebtEstablished:
            apiData.metric_cards.total_debt_established || 0,
          totalDebtRecovered: apiData.metric_cards.total_debt_recovered || 0,
          performanceRate: apiData.metric_cards.performance_rate || 0,
        });
        console.log(
          "✅ [useInspectionMetrics] Metrics set:",
          apiData.metric_cards
        );
      }

      // Transform monthly chart data
      if (apiData.monthly_debts_comparison) {
        const chartData = Array.isArray(apiData.monthly_debts_comparison)
          ? apiData.monthly_debts_comparison
          : apiData.monthly_debts_comparison.data || [];

        setMonthlyChart(
          chartData.map((item: any) => ({
            month: item.month,
            debtsEstablished: item.debt_established || 0,
            debtsRecovered: item.debt_recovered || 0,
          }))
        );
        console.log(
          "✅ [useInspectionMetrics] Chart data set:",
          chartData.length,
          "months"
        );
      }

      console.log("✅ [useInspectionMetrics] Loaded metrics successfully");
    } catch (err: any) {
      console.error("❌ [useInspectionMetrics] Error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load metrics";
      setError(errorMessage);
      setMetrics(null);
      setMonthlyChart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    monthlyChart,
    loading,
    error,
    refetch: fetchMetrics,
  };
};
