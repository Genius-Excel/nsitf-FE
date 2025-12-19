// ============================================================================
// Investment & Treasury Management (ITM) Type Definitions
// ============================================================================

export interface InvestmentRecord {
  id: string;
  month: string;
  contributionsPrivateSector: number;
  contributionsPublicTreasury: number;
  contributionsPublicNonTreasury: number;
  contributionsInformalEconomy: number;
  rentalFees: number;
  ecsRegistrationFees: number;
  ecsCertificateFees: number;
  debtRecovered: number;
  period: string; // YYYY-MM format
  recordStatus: "pending" | "reviewed" | "approved";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  regionId?: string;
  branchId?: string;
  region?: string;
  branch?: string;
}

export interface MetricCard {
  value: number;
  change_percent: number;
  trend: "up" | "down" | "stable";
}

export interface InvestmentMetrics {
  private_sector: MetricCard;
  public_treasury_funded: MetricCard;
  public_non_treasury_funded: MetricCard;
  informal_economy: MetricCard;
  rental_fees: MetricCard;
  debt_recovered: MetricCard;
  total_contributions: MetricCard;
}

export interface MonthlyContributionData {
  month: string;
  private_sector: number;
  public_treasury: number;
  public_non_treasury: number;
  informal_economy: number;
  rental_fees: number;
}

export interface DebtRecoveryData {
  month: string;
  total_contributions: number;
  total_debt_recovered: number;
  debt_percent_of_contrib: number;
}

export interface ChartScale {
  max: number;
  ticks: number[];
}

export interface MonthlyContributionTrend {
  data: MonthlyContributionData[];
  scale: ChartScale;
}

export interface DebtRecoveryPerformance {
  data: DebtRecoveryData[];
  scale: ChartScale;
}

export interface InvestmentFilterParams {
  selectedMonth?: string; // 1-12
  selectedYear?: string; // YYYY
  periodFrom?: string; // YYYY-MM
  periodTo?: string; // YYYY-MM
  recordStatus?: "pending" | "reviewed" | "approved" | "";
  regionId?: string;
  branchId?: string;
}

export interface InvestmentMetricsResponse {
  filters: {
    period: string | null;
    previous_period: string | null;
    month: string | null;
    period_from: string | null;
    period_to: string | null;
  };
  metric_cards: InvestmentMetrics;
  monthly_contribution_trend: MonthlyContributionTrend;
  debt_recovery_performance: DebtRecoveryPerformance;
}

export interface InvestmentDashboardData {
  metrics: InvestmentMetrics;
  records: InvestmentRecord[];
  monthlyContributionTrend: MonthlyContributionTrend;
  debtRecoveryPerformance: DebtRecoveryPerformance;
  totalRecords: number;
  filteredRecords: number;
}

export interface InvestmentUploadPayload {
  file: File;
  period: string;
  regionId?: string;
  branchId?: string;
}

export interface BulkActionPayload {
  recordIds: string[];
}

export interface BulkActionResponse {
  message: string;
  data: {
    updated: string[];
    missing: string[];
    errors: Array<{
      id: string;
      error: string;
    }>;
  };
}
