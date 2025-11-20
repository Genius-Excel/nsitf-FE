// ============= CORRECT TYPE DEFINITIONS =============
// These match the ACTUAL API response structure

export interface Metric {
  value: number;
  change_percent: number;
  trend: "up" | "down" | "neutral";
}

export interface MonthlyPerformanceData {
  month: string;
  claims: number;
  inspections: number;
  hse: number;
}

export interface RegionalPerformanceData {
  region: string;
  target: number;
  actual: number;
  performance_percent: number;
}

export interface ClaimsDistribution {
  medical_refunds: number;
  disability: number;
  death: number;
  loss_of_productivity: number;
}

// The API wraps arrays in objects with "data" and "scale" properties
export interface MonthlyPerformanceTrend {
  data: MonthlyPerformanceData[];
  scale: {
    max: number;
    ticks: number[];
  };
}

export interface RegionalCompliancePerformance {
  data: RegionalPerformanceData[];
  scale: {
    max: number;
    ticks: number[];
  };
}

export interface DashboardSummaryResponse {
  message: string;
  data: {
    filters: {
      region_id: number | null;
      region_name: string;
      period: string;
      previous_period: string;
    };
    metric_cards: {
      total_actual_contributions: Metric;
      total_employers_registered: Metric;
      total_claims_paid: Metric;
      total_claims_beneficiaries: Metric;
      total_osh_activities: Metric;
    };
    claims_distribution: ClaimsDistribution;
    monthly_performance_trend: MonthlyPerformanceTrend;
    regional_compliance_performance: RegionalCompliancePerformance;
  };
}

// ============= QUERY PARAMETERS =============

export interface DashboardQueryParams {
  month?: number; // 1-12
  year?: number; // 4-digit year
  region_id?: number;
}
