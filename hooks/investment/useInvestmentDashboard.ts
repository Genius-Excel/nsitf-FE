// ============================================================================
// useInvestmentDashboard Hook
// ============================================================================
// Fetches and manages Investment & Treasury dashboard data
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { getInvestmentDashboard } from "@/services/investment";
import type {
  InvestmentDashboardData,
  InvestmentFilterParams,
  InvestmentMetrics,
  MonthlyContributionTrend,
  DebtRecoveryPerformance,
  InvestmentRecord,
} from "@/lib/types/investment";

interface UseInvestmentDashboardReturn {
  data: InvestmentDashboardData | null;
  metrics: InvestmentMetrics | null;
  monthlyContributionTrend: MonthlyContributionTrend | null;
  debtRecoveryPerformance: DebtRecoveryPerformance | null;
  records: InvestmentRecord[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useInvestmentDashboard(
  filters?: InvestmentFilterParams
): UseInvestmentDashboardReturn {
  const [data, setData] = useState<InvestmentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching investment dashboard with filters:", filters);
      const dashboardData = await getInvestmentDashboard(filters);
      console.log("Investment dashboard data received:", dashboardData);
      console.log("Records count:", dashboardData?.records?.length || 0);
      setData(dashboardData);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch investment dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [
    filters?.selectedMonth,
    filters?.selectedYear,
    filters?.periodFrom,
    filters?.periodTo,
    filters?.recordStatus,
    filters?.regionId,
    filters?.branchId,
  ]);

  const metrics = useMemo(() => data?.metrics || null, [data]);
  const monthlyContributionTrend = useMemo(
    () => data?.monthlyContributionTrend || null,
    [data]
  );
  const debtRecoveryPerformance = useMemo(
    () => data?.debtRecoveryPerformance || null,
    [data]
  );
  const records = useMemo(() => data?.records || [], [data]);

  return {
    data,
    metrics,
    monthlyContributionTrend,
    debtRecoveryPerformance,
    records,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
