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
  // Provide safe defaults
  const safeMetrics = {
    total_liabilities: metrics.total_liabilities ?? 0,
    total_liabilities_trend: metrics.total_liabilities_trend ?? 0,
    reserve_adequacy_pct: metrics.reserve_adequacy_pct ?? 0,
    reserve_adequacy_trend: metrics.reserve_adequacy_trend ?? 0,
    outstanding_claims: metrics.outstanding_claims ?? 0,
    outstanding_claims_trend: metrics.outstanding_claims_trend ?? 0,
    expected_inflows: metrics.expected_inflows ?? 0,
    expected_inflows_trend: metrics.expected_inflows_trend ?? 0,
  };

  return [
    {
      title: "Total Liabilities",
      value: formatCurrency(safeMetrics.total_liabilities),
      change: formatTrend(safeMetrics.total_liabilities_trend),
      status: "warning" as const,
      icon: DollarSign,
    },
    {
      title: "Reserve Adequacy",
      value: formatPercentage(safeMetrics.reserve_adequacy_pct),
      change: formatTrend(safeMetrics.reserve_adequacy_trend),
      status: "success" as const,
      icon: CheckCircle2,
    },
    {
      title: "Outstanding Claims",
      value: formatCurrency(safeMetrics.outstanding_claims),
      change: formatTrend(safeMetrics.outstanding_claims_trend),
      status: safeMetrics.outstanding_claims === 0 ? ("success" as const) : ("warning" as const),
      icon: AlertTriangle,
    },
    {
      title: "Expected Inflows",
      value: formatCurrency(safeMetrics.expected_inflows),
      change: formatTrend(safeMetrics.expected_inflows_trend),
      status: "success" as const,
      icon: TrendingUp,
    },
  ];
}

// Transformer function with safe defaults for empty data
export function transformValuationFromAPI(
  apiData: ValuationDataAPI
): ValuationDashboardData {
  // Safe defaults for metric cards
  const metricCards = apiData?.metric_cards || {
    total_liabilities: 0,
    total_liabilities_trend: 0,
    reserve_adequacy_pct: 0,
    reserve_adequacy_trend: 0,
    outstanding_claims: 0,
    outstanding_claims_trend: 0,
    expected_inflows: 0,
    expected_inflows_trend: 0,
  };

  // Safe defaults for forecasting models
  const claimsData = apiData?.forecasting_models?.claims?.chart_data || [];
  const contributionsData = apiData?.forecasting_models?.contributions?.chart_data || [];
  const inspectionsData = apiData?.forecasting_models?.inspections?.chart_data || [];
  const hseData = apiData?.forecasting_models?.hse?.chart_data || [];

  // Safe defaults for short-term forecast
  const shortTermData = apiData?.short_term_forecast?.chart_data || [];

  // Safe defaults for long-term forecast
  const longTermClaims = apiData?.long_term_forecast?.claims_yearly || [];
  const longTermContributions = apiData?.long_term_forecast?.contributions_yearly || [];
  const annualGrowth = apiData?.long_term_forecast?.average_annual_growth_pct || {
    claims: 0,
    contributions: 0,
  };

  return {
    valuationMetrics: {
      totalLiabilities: metricCards.total_liabilities ?? 0,
      totalLiabilitiesTrend: metricCards.total_liabilities_trend ?? 0,
      reserveAdequacy: metricCards.reserve_adequacy_pct ?? 0,
      reserveAdequacyTrend: metricCards.reserve_adequacy_trend ?? 0,
      outstandingClaims: metricCards.outstanding_claims ?? 0,
      outstandingClaimsTrend: metricCards.outstanding_claims_trend ?? 0,
      expectedInflows: metricCards.expected_inflows ?? 0,
      expectedInflowsTrend: metricCards.expected_inflows_trend ?? 0,
    },
    claimTrendProjections: claimsData.map(
      (item: any) => ({
        period: item?.quarter || '',
        actual: item?.actual ?? 0,
        forecast: item?.forecast ?? 0,
        lower: item?.forecast ? item.forecast * 0.85 : 0, // 15% lower bound
        upper: item?.forecast ? item.forecast * 1.15 : 0, // 15% upper bound
      })
    ),
    contributionGrowth: contributionsData.map(
      (item: any) => ({
        period: item?.quarter || '',
        actual: item?.actual ?? 0,
        forecast: item?.forecast ?? 0,
        target: item?.target ?? 0,
      })
    ),
    inspectionTrends: inspectionsData.map(
      (item: any) => ({
        period: item?.quarter || '',
        completed: item?.completed ?? 0,
        forecast: item?.forecast ?? 0,
        planned: item?.planned ?? 0,
      })
    ),
    hseTrends: hseData.map(
      (item: any) => ({
        period: item?.quarter || '',
        total: item?.total ?? 0,
        forecast: item?.forecast ?? 0,
      })
    ),
    shortTermForecasts: shortTermData.map(
      (item: any) => ({
        quarter: item?.quarter || '',
        claims: item?.claims ?? 0,
        contributions: item?.contributions ?? 0,
        liabilities: (metricCards.total_liabilities ?? 0) / 4, // Estimate quarterly from total
        reserves: (metricCards.expected_inflows ?? 0) / 4, // Estimate quarterly from expected inflows
      })
    ),
    longTermForecasts: longTermClaims.map(
      (claimsItem, index) => {
        const forecast = {
          year: claimsItem?.year?.toString() || '',
          claims: claimsItem?.value ?? 0,
          contributions: longTermContributions[index]?.value ?? 0,
          liabilities: (metricCards.total_liabilities ?? 0) * (1 + index * 0.05), // 5% growth estimate
          reserves: (metricCards.expected_inflows ?? 0) * (1 + index * 0.05), // 5% growth estimate
          growth: annualGrowth.claims ?? 0,
        };
        console.log(`Long-term forecast year ${forecast.year}:`, {
          claims: forecast.claims,
          contributions: forecast.contributions,
        });
        return forecast;
      }
    ),
    averageAnnualGrowth: annualGrowth,
    meta: {
      modelUsed: apiData?.meta?.model_used || 'unknown',
      generatedAt: apiData?.meta?.generated_at || new Date().toISOString(),
    },
  };
}
