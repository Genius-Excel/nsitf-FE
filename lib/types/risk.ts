// ============================================================================
// Risk Analysis Types
// ============================================================================

import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  RiskMetric,
  TrendlineData,
  RegionalRiskData,
  RiskEntity,
} from "./index";

// API Response Types
export interface RiskAnalysisAPIResponse {
  message: string;
  data: RiskAnalysisDataAPI;
}

export interface RiskAnalysisDataAPI {
  meta: {
    generated_at: string;
    months_used_for_trends: number;
    emp_months_window: number;
    evaluated_employers_count: number;
  };
  metric_cards: {
    critical_risks: number;
    high_risks: number;
    medium_risks: number;
    low_risks: number;
    evaluated_employers: number;
    risk_mitigation_rate_pct: number;
    risk_mitigation_change_pct_points: number | null;
    note?: string;
  };
  incidents_recovery_trends: {
    labels: string[];
    datasets: {
      incident_frequency: Array<{
        period: string;
        year: number;
        month: number;
        value: number;
      }>;
      compliance_avg_pct: Array<{
        period: string;
        year: number;
        month: number;
        value: number | null;
      }>;
      recovery_success_rate_pct: Array<{
        period: string;
        year: number;
        month: number;
        value: number | null;
      }>;
    };
    changes: {
      incident_pct_change: Array<{ period: string; value: number | null }>;
      compliance_mom_improvement: Array<{ period: string; value: number | null }>;
      recovery_pct_change: Array<{ period: string; value: number | null }>;
    };
    scales: {
      incident_scale: { max: number; ticks: number[] };
      compliance_scale: { max: number; ticks: number[] };
      recovery_scale: { max: number; ticks: number[] };
    };
    chart_meta: {
      chart_type: string;
      description: string;
    };
  };
  regional_risk_breakdown: {
    labels: string[];
    data: Array<{
      region: string;
      critical: number;
      high_risk: number;
      medium_risk: number;
      low_risk: number;
      total: number;
    }>;
    chart_meta: {
      chart_type: string;
      description: string;
    };
    scale: {
      max: number;
      ticks: number[];
    };
  };
  risk_drilldown: {
    top_employers: Array<{
      entity: string;
      region: string;
      risk_score: number;
      category: string;
      claims: number;
      compliance_pct: number | null;
      incidents: number;
      inspections: number;
    }>;
    chart_meta: {
      description: string;
    };
  };
}

// Frontend Types (used by components)
export interface RiskAnalysisDashboardData {
  riskMetrics: RiskMetric[];
  trendlineData: TrendlineData[];
  regionalData: RegionalRiskData[];
  topRiskEntities: RiskEntity[];
  meta: {
    generatedAt: string;
    monthsUsedForTrends: number;
    evaluatedEmployersCount: number;
  };
}

// Helper function to format risk metric cards
export function formatRiskMetrics(metrics: {
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  evaluated_employers: number;
  risk_mitigation_rate_pct: number;
  risk_mitigation_change_pct_points: number | null;
}): RiskMetric[] {
  const formatChange = (value: number | null): string => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}pp`;
  };

  // Provide safe defaults
  const safeMetrics = {
    critical_risks: metrics.critical_risks ?? 0,
    high_risks: metrics.high_risks ?? 0,
    medium_risks: metrics.medium_risks ?? 0,
    low_risks: metrics.low_risks ?? 0,
    evaluated_employers: metrics.evaluated_employers ?? 0,
    risk_mitigation_rate_pct: metrics.risk_mitigation_rate_pct ?? 0,
    risk_mitigation_change_pct_points: metrics.risk_mitigation_change_pct_points ?? null,
  };

  return [
    {
      title: "Critical Risks",
      value: safeMetrics.critical_risks.toString(),
      description: "Employers with critical risk levels",
      category: "critical" as const,
      icon: AlertTriangle,
    },
    {
      title: "High Risks",
      value: safeMetrics.high_risks.toString(),
      description: "Employers with high risk levels",
      category: "high" as const,
      icon: Shield,
    },
    {
      title: "Medium Risks",
      value: safeMetrics.medium_risks.toString(),
      description: "Employers with medium risk levels",
      category: "medium" as const,
      icon: AlertTriangle,
    },
    {
      title: "Low Risks",
      value: safeMetrics.low_risks.toString(),
      description: "Employers with low risk levels",
      category: "success" as const,
      icon: CheckCircle2,
    },
    {
      title: "Risk Mitigation Rate",
      value: `${safeMetrics.risk_mitigation_rate_pct.toFixed(1)}%`,
      description: `Change: ${formatChange(safeMetrics.risk_mitigation_change_pct_points)}`,
      category: safeMetrics.risk_mitigation_rate_pct >= 70 ? ("success" as const) : ("medium" as const),
      icon: TrendingUp,
    },
  ];
}

// Transformer function with safe defaults for empty data
export function transformRiskAnalysisFromAPI(
  apiData: RiskAnalysisDataAPI
): RiskAnalysisDashboardData {
  // Safe defaults for metric cards
  const metricCards = apiData?.metric_cards || {
    critical_risks: 0,
    high_risks: 0,
    medium_risks: 0,
    low_risks: 0,
    evaluated_employers: 0,
    risk_mitigation_rate_pct: 0,
    risk_mitigation_change_pct_points: null,
  };

  // Safe defaults for trendline data
  const trendLabels = apiData?.incidents_recovery_trends?.labels || [];
  const incidentFreqData = apiData?.incidents_recovery_trends?.datasets?.incident_frequency || [];
  const complianceData = apiData?.incidents_recovery_trends?.datasets?.compliance_avg_pct || [];
  const recoveryData = apiData?.incidents_recovery_trends?.datasets?.recovery_success_rate_pct || [];

  // Transform trendline data
  const trendlineData: TrendlineData[] = trendLabels.map(
    (month, index) => ({
      month: month || '',
      incidentFreq: incidentFreqData[index]?.value ?? 0,
      complianceImprovement: complianceData[index]?.value ?? 0,
      recoveryRate: recoveryData[index]?.value ?? 0,
    })
  );

  // Safe defaults for regional data
  const regionalBreakdownData = apiData?.regional_risk_breakdown?.data || [];

  // Transform regional data
  const regionalData: RegionalRiskData[] = regionalBreakdownData.map(
    (item) => ({
      region: item?.region || '',
      score: 0, // Not provided by API, could be calculated
      employers: item?.total ?? 0,
      highRisk: item?.high_risk ?? 0,
      mediumRisk: item?.medium_risk ?? 0,
      lowRisk: item?.low_risk ?? 0,
      critical: item?.critical ?? 0,
    })
  );

  // Safe defaults for top risk entities
  const topEmployers = apiData?.risk_drilldown?.top_employers || [];

  // Transform top risk entities
  const topRiskEntities: RiskEntity[] = topEmployers.map(
    (item) => ({
      entity: item?.entity || '',
      region: item?.region || '',
      riskScore: item?.risk_score ?? 0,
      category: (item?.category as "High" | "Medium" | "Low") || "Low",
      claims: item?.claims ?? 0,
      compliance: item?.compliance_pct ?? 0,
      incidents: item?.incidents ?? 0,
      inspections: item?.inspections ?? 0,
    })
  );

  // Safe defaults for meta
  const meta = apiData?.meta || {
    generated_at: new Date().toISOString(),
    months_used_for_trends: 0,
    emp_months_window: 0,
    evaluated_employers_count: 0,
  };

  return {
    riskMetrics: formatRiskMetrics(metricCards),
    trendlineData,
    regionalData,
    topRiskEntities,
    meta: {
      generatedAt: meta.generated_at || new Date().toISOString(),
      monthsUsedForTrends: meta.months_used_for_trends ?? 0,
      evaluatedEmployersCount: meta.evaluated_employers_count ?? 0,
    },
  };
}
