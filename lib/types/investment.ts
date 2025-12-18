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

export interface InvestmentMetrics {
  contributionsPrivateSector: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  contributionsPublicTreasury: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  contributionsPublicNonTreasury: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  contributionsInformalEconomy: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  rentalFees: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  debtRecovered: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
}

export interface InvestmentChartData {
  month: string;
  privateSector: number;
  publicTreasury: number;
  publicNonTreasury: number;
  informalEconomy: number;
  rentalFees: number;
  debtRecovered: number;
  totalContributions: number;
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

export interface InvestmentDashboardData {
  metrics: InvestmentMetrics;
  records: InvestmentRecord[];
  chartData: InvestmentChartData[];
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
  success: boolean;
  updatedCount: number;
  message: string;
}
