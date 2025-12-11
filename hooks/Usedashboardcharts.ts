import { useMemo } from "react";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";

// ============= CHART DATA HOOKS =============
// These hooks transform the raw API data into chart-ready formats

// --------- Monthly Performance Chart ---------

export interface MonthlyPerformanceChartData {
  month: string;
  claims: number;
  inspections: number;
  hse: number;
}

export const useMonthlyPerformanceChart = (
  dashboardData: DashboardSummaryResponse | null
) => {
  const chartData = useMemo<MonthlyPerformanceChartData[]>(() => {
    if (!dashboardData?.data?.monthly_performance_trend?.data) {
      return [];
    }
    return dashboardData.data.monthly_performance_trend.data;
  }, [dashboardData]);

  const scale = useMemo(() => {
    return dashboardData?.data?.monthly_performance_trend?.scale ?? null;
  }, [dashboardData]);

  return { data: chartData, scale };
};

// --------- Claims Distribution Pie Chart ---------

export interface ClaimsPieChartData {
  name: string;
  value: number;
  color: string;
}

const CLAIMS_COLORS = {
  medicalRefunds: "#2563eb",
  disability: "#16a34a",
  death: "#eab308",
  lossOfProductivity: "#dc2626",
} as const;

export const useClaimsDistributionChart = (
  dashboardData: DashboardSummaryResponse | null
) => {
  const chartData = useMemo<ClaimsPieChartData[]>(() => {
    if (!dashboardData?.data?.claims_distribution) {
      return [];
    }

    const distribution = dashboardData.data.claims_distribution;

    return [
      {
        name: "Medical Refunds",
        value: distribution.medical_refunds,
        color: CLAIMS_COLORS.medicalRefunds,
      },
      {
        name: "Disability",
        value: distribution.disability,
        color: CLAIMS_COLORS.disability,
      },
      {
        name: "Death Claims",
        value: distribution.death,
        color: CLAIMS_COLORS.death,
      },
      {
        name: "Loss of Productivity",
        value: distribution.loss_of_productivity,
        color: CLAIMS_COLORS.lossOfProductivity,
      },
    ].filter((item) => item.value > 0); // Remove zero values
  }, [dashboardData]);

  return { data: chartData, colors: CLAIMS_COLORS };
};

// --------- Regional Compliance Bar Chart ---------

/**
 * CRITICAL BUSINESS LOGIC QUESTION:
 * This chart needs clarification on what should be displayed.
 *
 * The API provides:
 * - target: Target contribution amount (₦)
 * - actual: Actual contribution amount (₦)
 * - performance_percent: Percentage of target achieved
 *
 * Current implementation incorrectly maps:
 * - "claims" to actual contributions (wrong naming)
 * - "compliance" to performance_percent (mixing units)
 *
 * RECOMMENDED APPROACH: Show Target vs Actual in same currency (₦)
 * This makes semantic sense and allows proper comparison.
 *
 * If you want to show percentages, create a separate single-bar chart.
 */

export interface RegionalChartData {
  region: string;
  target: number;
  actual: number;
  performance_percent: number;
}

export const useRegionalComplianceChart = (
  dashboardData: DashboardSummaryResponse | null
) => {
  const chartData = useMemo<RegionalChartData[]>(() => {
    if (!dashboardData?.data?.regional_compliance_performance?.data) {
      return [];
    }

    const rawData = dashboardData.data.regional_compliance_performance.data;

    // Handle duplicate regions by summing their values
    const regionMap = new Map<string, RegionalChartData>();

    rawData.forEach((item) => {
      const existing = regionMap.get(item.region);

      if (existing) {
        // Sum values for duplicate regions
        existing.target += item.target;
        existing.actual += item.actual;
        // Recalculate performance percentage based on summed values
        existing.performance_percent =
          existing.target > 0 ? (existing.actual / existing.target) * 100 : 0;
      } else {
        regionMap.set(item.region, {
          region: item.region,
          target: item.target,
          actual: item.actual,
          performance_percent: item.performance_percent,
        });
      }
    });

    // Return all regions, including those with 0 values
    return Array.from(regionMap.values());
  }, [dashboardData]);

  const scale = useMemo(() => {
    return dashboardData?.data?.regional_compliance_performance?.scale ?? null;
  }, [dashboardData]);

  return { data: chartData, scale };
};

// --------- Metric Cards ---------

export interface MetricCardData {
  title: string;
  value: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  formatter: (value: number) => string;
}

export const useMetricCards = (
  dashboardData: DashboardSummaryResponse | null
) => {
  const cards = useMemo<MetricCardData[]>(() => {
    if (!dashboardData?.data?.metric_cards) {
      return [];
    }

    const metrics = dashboardData.data.metric_cards;

    return [
      {
        title: "Total Actual Contributions",
        value: metrics.total_actual_contributions.value,
        changePercent: metrics.total_actual_contributions.change_percent,
        trend: metrics.total_actual_contributions.trend,
        formatter: (val: number) => `₦${val.toLocaleString()}`,
      },
      {
        title: "Total Registered Employers",
        value: metrics.total_employers_registered.value,
        changePercent: metrics.total_employers_registered.change_percent,
        trend: metrics.total_employers_registered.trend,
        formatter: (val: number) => val.toLocaleString(),
      },
      {
        title: "Total Claims Paid",
        value: metrics.total_claims_paid.value,
        changePercent: metrics.total_claims_paid.change_percent,
        trend: metrics.total_claims_paid.trend,
        formatter: (val: number) => `₦${val.toLocaleString()}`,
      },
      {
        title: "Total Claims Beneficiaries",
        value: metrics.total_claims_beneficiaries.value,
        changePercent: metrics.total_claims_beneficiaries.change_percent,
        trend: metrics.total_claims_beneficiaries.trend,
        formatter: (val: number) => val.toLocaleString(),
      },
      {
        title: "Total OSH Activities",
        value: metrics.total_osh_activities.value,
        changePercent: metrics.total_osh_activities.change_percent,
        trend: metrics.total_osh_activities.trend,
        formatter: (val: number) => val.toLocaleString(),
      },
    ];
  }, [dashboardData]);

  return { cards };
};
