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

  return [
    {
      title: "Critical Risks",
      value: metrics.critical_risks.toString(),
      description: "Employers with critical risk levels",
      category: "critical" as const,
      icon: AlertTriangle,
    },
    {
      title: "High Risks",
      value: metrics.high_risks.toString(),
      description: "Employers with high risk levels",
      category: "high" as const,
      icon: Shield,
    },
    {
      title: "Medium Risks",
      value: metrics.medium_risks.toString(),
      description: "Employers with medium risk levels",
      category: "medium" as const,
      icon: AlertTriangle,
    },
    {
      title: "Low Risks",
      value: metrics.low_risks.toString(),
      description: "Employers with low risk levels",
      category: "success" as const,
      icon: CheckCircle2,
    },
    {
      title: "Risk Mitigation Rate",
      value: `${metrics.risk_mitigation_rate_pct.toFixed(1)}%`,
      description: `Change: ${formatChange(metrics.risk_mitigation_change_pct_points)}`,
      category: metrics.risk_mitigation_rate_pct >= 70 ? ("success" as const) : ("medium" as const),
      icon: TrendingUp,
    },
  ];
}

// Transformer function
export function transformRiskAnalysisFromAPI(
  apiData: RiskAnalysisDataAPI
): RiskAnalysisDashboardData {
  // Transform trendline data
  const trendlineData: TrendlineData[] = apiData.incidents_recovery_trends.labels.map(
    (month, index) => ({
      month,
      incidentFreq: apiData.incidents_recovery_trends.datasets.incident_frequency[index]?.value || 0,
      complianceImprovement: apiData.incidents_recovery_trends.datasets.compliance_avg_pct[index]?.value || 0,
      recoveryRate: apiData.incidents_recovery_trends.datasets.recovery_success_rate_pct[index]?.value || 0,
    })
  );

  // Transform regional data
  const regionalData: RegionalRiskData[] = apiData.regional_risk_breakdown.data.map(
    (item) => ({
      region: item.region,
      score: 0, // Not provided by API, could be calculated
      employers: item.total,
      highRisk: item.high_risk,
      mediumRisk: item.medium_risk,
      lowRisk: item.low_risk,
      critical: item.critical,
    })
  );

  // Transform top risk entities
  const topRiskEntities: RiskEntity[] = apiData.risk_drilldown.top_employers.map(
    (item) => ({
      entity: item.entity,
      region: item.region,
      riskScore: item.risk_score,
      category: item.category as "High" | "Medium" | "Low",
      claims: item.claims,
      compliance: item.compliance_pct || 0,
      incidents: item.incidents,
      inspections: item.inspections,
    })
  );

  return {
    riskMetrics: formatRiskMetrics(apiData.metric_cards),
    trendlineData,
    regionalData,
    topRiskEntities,
    meta: {
      generatedAt: apiData.meta.generated_at,
      monthsUsedForTrends: apiData.meta.months_used_for_trends,
      evaluatedEmployersCount: apiData.meta.evaluated_employers_count,
    },
  };
}
