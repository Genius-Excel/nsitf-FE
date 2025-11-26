// ============================================================================
// Valuation & Forecasting Types
// ============================================================================

import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  ClaimTrendProjection,
  ContributionGrowth,
  InspectionTrend,
  HSETrend,
  ShortTermForecast,
  LongTermForecast,
} from "./index";

// API Response Types
export interface ValuationAPIResponse {
  message: string;
  data: ValuationDataAPI;
}

export interface ValuationDataAPI {
  metric_cards: {
    total_liabilities: number;
    total_liabilities_trend?: number;
    reserve_adequacy_pct: number;
    reserve_adequacy_trend?: number;
    outstanding_claims: number;
    outstanding_claims_trend?: number;
    expected_inflows: number;
    expected_inflows_trend?: number;
  };
  forecasting_models: {
    claims: ForecastingChartData;
    contributions: ForecastingChartData;
    inspections: ForecastingChartData;
    hse: ForecastingChartData;
  };
  short_term_forecast: ShortTermForecastAPI;
  long_term_forecast: LongTermForecastAPI;
  history: HistoryDataAPI;
  meta: {
    model_used: string;
    generated_at: string;
  };
}

export interface ForecastingChartData {
  chart_type: string;
  description: string;
  chart_data: any[];
  scale: ChartScale;
  growth_scale?: ChartScale;
  achievement_scale?: ChartScale;
}

export interface ChartScale {
  max: number;
  ticks: number[];
}

export interface ShortTermForecastAPI {
  horizon_quarters: number;
  chart_data: Array<{
    quarter: string;
    claims: number;
    contributions: number;
    inspections: number;
    hse: number;
  }>;
  table_summary: Array<{
    quarter: string;
    contributions: number;
    claims: number;
  }>;
  quarters: string[];
}

export interface LongTermForecastAPI {
  horizon_years: number;
  claims_yearly: Array<{
    year: number;
    value: number;
  }>;
  contributions_yearly: Array<{
    year: number;
    value: number;
  }>;
  average_annual_growth_pct: {
    claims: number;
    contributions: number;
  };
  scale: ChartScale;
}

export interface HistoryDataAPI {
  claims_monthly: Array<{ ds: string; y: number }>;
  contributions_monthly: Array<{ ds: string; y: number }>;
  inspections_monthly: Array<{ ds: string; y: number }>;
  hse_monthly: Array<{ ds: string; y: number }>;
}

// Frontend Types (used by components)
export interface ValuationMetrics {
  totalLiabilities: number;
  totalLiabilitiesTrend?: number;
  reserveAdequacy: number;
  reserveAdequacyTrend?: number;
  outstandingClaims: number;
  outstandingClaimsTrend?: number;
  expectedInflows: number;
  expectedInflowsTrend?: number;
}

export interface ValuationDashboardData {
  valuationMetrics: ValuationMetrics;
  claimTrendProjections: ClaimTrendProjection[];
  contributionGrowth: ContributionGrowth[];
  inspectionTrends: InspectionTrend[];
  hseTrends: HSETrend[];
  shortTermForecasts: ShortTermForecast[];
  longTermForecasts: LongTermForecast[];
  averageAnnualGrowth: {
    claims: number;
    contributions: number;
  };
  meta: {
    modelUsed: string;
    generatedAt: string;
  };
}

// Helper function to format currency
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `₦${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(0)}M`;
  } else if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(0)}K`;
  }
  return `₦${value.toFixed(0)}`;
}

// Helper function to format percentage
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Helper function to format trend with + or - sign
function formatTrend(value: number | undefined): string {
  if (value === undefined || value === null) {
    return "N/A";
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// Helper function to create formatted metric cards
export function formatValuationMetrics(metrics: {
  total_liabilities: number;
  total_liabilities_trend?: number;
  reserve_adequacy_pct: number;
  reserve_adequacy_trend?: number;
  outstanding_claims: number;
  outstanding_claims_trend?: number;
  expected_inflows: number;
  expected_inflows_trend?: number;
}): Array<{
  title: string;
  value: string;
  change: string;
  status: "success" | "warning" | "critical";
  icon: LucideIcon;
}> {
  return [
    {
      title: "Total Liabilities",
      value: formatCurrency(metrics.total_liabilities),
      change: formatTrend(metrics.total_liabilities_trend),
      status: "warning" as const,
      icon: DollarSign,
    },
    {
      title: "Reserve Adequacy",
      value: formatPercentage(metrics.reserve_adequacy_pct),
      change: formatTrend(metrics.reserve_adequacy_trend),
      status: "success" as const,
      icon: CheckCircle2,
    },
    {
      title: "Outstanding Claims",
      value: formatCurrency(metrics.outstanding_claims),
      change: formatTrend(metrics.outstanding_claims_trend),
      status: metrics.outstanding_claims === 0 ? ("success" as const) : ("warning" as const),
      icon: AlertTriangle,
    },
    {
      title: "Expected Inflows",
      value: formatCurrency(metrics.expected_inflows),
      change: formatTrend(metrics.expected_inflows_trend),
      status: "success" as const,
      icon: TrendingUp,
    },
  ];
}

// Transformer function
export function transformValuationFromAPI(
  apiData: ValuationDataAPI
): ValuationDashboardData {
  return {
    valuationMetrics: {
      totalLiabilities: apiData.metric_cards.total_liabilities,
      totalLiabilitiesTrend: apiData.metric_cards.total_liabilities_trend,
      reserveAdequacy: apiData.metric_cards.reserve_adequacy_pct,
      reserveAdequacyTrend: apiData.metric_cards.reserve_adequacy_trend,
      outstandingClaims: apiData.metric_cards.outstanding_claims,
      outstandingClaimsTrend: apiData.metric_cards.outstanding_claims_trend,
      expectedInflows: apiData.metric_cards.expected_inflows,
      expectedInflowsTrend: apiData.metric_cards.expected_inflows_trend,
    },
    claimTrendProjections: apiData.forecasting_models.claims.chart_data.map(
      (item: any) => ({
        period: item.quarter,
        actual: item.actual,
        forecast: item.forecast ?? 0,
        lower: item.forecast ? item.forecast * 0.85 : 0, // 15% lower bound
        upper: item.forecast ? item.forecast * 1.15 : 0, // 15% upper bound
      })
    ),
    contributionGrowth: apiData.forecasting_models.contributions.chart_data.map(
      (item: any) => ({
        period: item.quarter,
        actual: item.actual,
        forecast: item.forecast ?? 0,
        target: item.target ?? 0,
      })
    ),
    inspectionTrends: apiData.forecasting_models.inspections.chart_data.map(
      (item: any) => ({
        period: item.quarter,
        completed: item.completed,
        forecast: item.forecast ?? 0,
        planned: item.planned ?? 0,
      })
    ),
    hseTrends: apiData.forecasting_models.hse.chart_data.map(
      (item: any) => ({
        period: item.quarter,
        total: item.total,
        forecast: item.forecast ?? 0,
      })
    ),
    shortTermForecasts: apiData.short_term_forecast.chart_data.map(
      (item: any) => ({
        quarter: item.quarter,
        claims: item.claims,
        contributions: item.contributions,
        liabilities: apiData.metric_cards.total_liabilities / 4, // Estimate quarterly from total
        reserves: apiData.metric_cards.expected_inflows / 4, // Estimate quarterly from expected inflows
      })
    ),
    longTermForecasts: apiData.long_term_forecast.claims_yearly.map(
      (claimsItem, index) => ({
        year: claimsItem.year.toString(),
        claims: claimsItem.value,
        contributions:
          apiData.long_term_forecast.contributions_yearly[index]?.value || 0,
        liabilities: apiData.metric_cards.total_liabilities * (1 + index * 0.05), // 5% growth estimate
        reserves: apiData.metric_cards.expected_inflows * (1 + index * 0.05), // 5% growth estimate
        growth: apiData.long_term_forecast.average_annual_growth_pct.claims,
      })
    ),
    averageAnnualGrowth:
      apiData.long_term_forecast.average_annual_growth_pct,
    meta: {
      modelUsed: apiData.meta.model_used,
      generatedAt: apiData.meta.generated_at,
    },
  };
}
