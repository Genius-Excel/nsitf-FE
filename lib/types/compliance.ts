export interface RegionalSummary {
  region: string | null;
  region_id: string;
  branch: string | null;
  collected: number;
  target: number;
  performance_rate: number;
  employers: number;
  employees: number;
  registration_fees: number;
  certificate_fees: number;
  period: string;
}

export interface ComplianceApiResponse {
  regional_summary: RegionalSummary[];
}

// lib/types.ts

export interface DashboardMetrics {
  totalActualContributions: number;
  contributionsTarget: number;
  performanceRate: number;
  totalEmployers: number;
  totalEmployees: number;
}

export interface ComplianceDashboardData {
  metrics: DashboardMetrics;
  regionalSummary: RegionSummary[];
}

export interface RegionSummary {
  region: string;
  totalEmployers: number;
  totalEmployees: number;
  contributions: number;
}

export interface ComplianceEntry {
  id: string;
  region: string;
  branch: string;
  contributionCollected: number;
  target: number;
  achievement: number;
  employersRegistered: number;
  employees: number;
  registrationFees: number;
  certificateFees: number;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalActualContributions: number;
  contributionsTarget: number;
  performanceRate: number;
  totalEmployers: number;
  totalEmployees: number;
}

export interface FilterConfig {
  regions: string[];
  achievementMin: number;
  achievementMax: number;
  periodSearch: string;
  branchSearch: string;
}

export type SortField =
  | "region"
  | "branch"
  | "contributionCollected"
  | "target"
  | "achievement"
  | "employersRegistered"
  | "employees"
  | "registrationFees"
  | "certificateFees"
  | "period";

export interface SortConfig {
  field: SortField;
  direction: "asc" | "desc";
}

export type NotificationType = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export interface ComplianceDashboardApiResponse {
  metric_cards: {
    total_contributions: number;
    total_target: number;
    performance_rate: number;
    total_employers: number;
    total_employees: number;
  };
  regional_summary: {
    region_id: string;
    region: string;
    branch: string;
    collected: number;
    target: number;
    performance_rate?: number;
    employers: number;
    employees: number;
    registration_fees: number;
    certificate_fees: number;
    period?: string;
  }[];
  filters?: {
    as_of?: string;
  };
}

