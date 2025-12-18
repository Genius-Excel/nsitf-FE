export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  account_status: "active" | "inactive";
  department: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  claimId: string;
  employer: string;
  claimant: string;
  gender?: string | null;
  type:
    | "Medical Refund"
    | "Disability"
    | "Death Claim"
    | "Loss of Productivity"
    | string;
  amountRequested: number;
  amountPaid: number;
  status:
    | "Paid"
    | "Pending"
    | "Under Review"
    | "Rejected"
    | "paid"
    | "pending"
    | "rejected"
    | "under_review";
  dateProcessed: string;
  datePaid: string | null;
  sector: string | null;
  class: string | null;
  date: string | null;
  payment_month?: string | null;
}

export interface InspectionRecord {
  id: string;
  branch: string;
  inspectionsConducted: number;
  debtEstablished: number;
  debtRecovered: number;
  performanceRate: number; // percentage
  demandNotice: number;
  period: string; // e.g., "Q1 2024", "Jan 2024"
}

export interface MonthlyChartData {
  month: string;
  debtsEstablished: number;
  debtsRecovered: number;
}

export interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  department: string;
  organizational_level: string;
  region_id: string;
  branch_id: string;
}

export interface Role {
  id: string;
  label: string;
  description: string;
}
export interface ChartDataPoint {
  month: string;
  processed: number;
  target: number;
}

export interface RegionalHSERecord {
  id: string;
  region: string;
  branch: string;
  totalActualOSH: number;
  targetOSH: number;
  performanceRate: number; // percentage
  oshEnlightenment: number;
  oshInspectionAudit: number;
  accidentInvestigation: number;
  activitiesPeriod: string; // e.g., "Q3 2024", "Jan 2024"
}

export interface StatCard {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  change?: string;
}

export interface ResetEmailFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface LegalCase {
  id: string;
  title: string;
  description: string;
  created: string;
  filed: string;
  amountClaimed: string;
  nextHearing: string;
  status: "pending" | "closed" | "assigned-obtained";
  outcome?: string;
}

export interface DemandNotice {
  id: string;
  title: string;
  company: string;
  amount: string;
  date: string;
}

export interface DemandNoticeFormProps {
  onClose: () => void;
  onSubmit: (data: DemandNoticeData) => void;
}

export interface DemandNoticeData {
  noticeId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  amountDue: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  attachments: File[];
}

export interface LegalActivityRecord {
  id: string;
  region: string;
  branch: string;
  recalcitrantEmployers: number;
  defaultingEmployers: number;
  ecsNo: string;
  planIssued: number;
  adr: number; // Alternate Dispute Resolution
  casesInstituted: number;
  sectors: string;
  activitiesPeriod: string;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  alternative_number: string | null;
  email_verified: boolean;
  role: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  permissions: string[];
}

export interface EditProfileFormData {
  email: string;
}

// ============= CORE TYPES =============

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
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  totalActualContributions: number;
  contributionsTarget: number;
  performanceRate: number;
  totalEmployers: number;
  totalEmployees: number;
  // totalCertificateFees: number;
}

export interface UploadError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ParseProgress {
  stage: "idle" | "reading" | "parsing" | "validating" | "complete" | "error";
  percentage: number;
  message: string;
}

export interface Notification {
  type: "success" | "error" | "info" | "warning";
  message: string;
  id: string;
}

// ============= SORTING & FILTERING =============

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

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  regions: string[];
  achievementMin: number;
  achievementMax: number;
  periodSearch: string;
  branchSearch: string;
}

// ===== KPI Analytics Types ======

import { LucideIcon } from "lucide-react";

export interface KPIMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  status: "success" | "warning" | "critical" | "normal";
  icon: LucideIcon;
  target: number;
  actual: number;
}

export interface RegionalData {
  region: string;
  compliance: number;
  claims: number;
  inspections: number;
  paid: number;
  pending: number;
}

export interface SectorData {
  name: string;
  value: number;
  claims: number;
}

export interface MonthlyKPI {
  month: string;
  claims: number;
  compliance: number;
  inspections: number;
  hse: number;
}

export interface KPIAnalyticsFilters {
  selectedRegion: string;
  selectedSector: string;
  selectedPeriod: string;
}

// ===== KPI API Response Types ======

export interface KPICardData {
  value: number;
  target: number | null;
  trend?: number;
  status: string;
}

export interface KPICardsResponse {
  total_claims: KPICardData;
  paid_claims: KPICardData;
  pending_inspections: KPICardData;
  compliance_rate: KPICardData;
  risk_exposure: KPICardData;
  avg_case_duration: KPICardData;
}

export interface MonthlyKPIData {
  month: string;
  claims: number;
  compliance: number;
  inspections: number;
  hse: number;
}

export interface MonthlyKPIComparison {
  data: MonthlyKPIData[];
  scale: {
    max: number;
    ticks: number[];
  };
  percentage_scale: number[];
}

export interface SectorDistribution {
  sector: string;
  count: number;
}

export interface RegionalPerformanceData {
  region: string;
  claims: number;
  paid: number;
  pending: number;
}

export interface RegionalPerformance {
  data: RegionalPerformanceData[];
  scale: {
    max: number;
    ticks: number[];
  };
}

export interface KPIAnalysisResponse {
  message: string;
  data: {
    kpi_cards: KPICardsResponse;
    monthly_kpi_comparison: MonthlyKPIComparison;
    sector_distribution: SectorDistribution[];
    regional_performance: RegionalPerformance;
  };
}

// ===== Forecasting Types ======
export interface ClaimTrendProjection {
  period: string;
  actual: number | null;
  forecast: number;
  lower: number;
  upper: number;
}

export interface ContributionGrowth {
  period: string;
  actual: number | null;
  forecast: number;
  target: number;
}

export interface InspectionTrend {
  period: string;
  completed: number | null;
  forecast: number;
  planned: number;
}

export interface HSETrend {
  period: string;
  total: number | null;
  forecast: number;
}

export interface ValuationMetric {
  title: string;
  value: string;
  change: string;
  status: "success" | "warning" | "critical";
  icon: LucideIcon;
}

export interface ShortTermForecast {
  quarter: string;
  claims: number;
  contributions: number;
  liabilities: number;
  reserves: number;
}

export interface LongTermForecast {
  year: string;
  claims: number;
  contributions: number;
  liabilities: number;
  reserves: number;
  growth: number;
}

export interface ForecastingFilters {
  forecastModel: string;
  selectedMetric: string;
}

// ==== Risk Ananlysis =====

export interface RiskMetric {
  title: string;
  value: string;
  description: string;
  category: "critical" | "high" | "medium" | "success";
  icon: LucideIcon;
}

export interface TrendlineData {
  month: string;
  incidentFreq: number;
  complianceImprovement: number;
  recoveryRate: number;
}

export interface RegionalRiskData {
  region: string;
  score: number;
  employers: number;
  critical: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

export interface RiskEntity {
  entity: string;
  region: string;
  riskScore: number;
  category: "High" | "Medium" | "Low";
  claims: number;
  compliance: number;
  incidents: number;
  inspections: number;
}

export interface RiskAnalysisFilters {
  selectedRegion: string;
  selectedRiskType: string;
  timeHorizon: string;
}

// ============= STORAGE =============

export interface StorageAdapter {
  get: (key: string) => Promise<{ value: string } | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export interface FormData {
  region: string;
  branch: string;
  contributionCollected: number;
  target: number;
  employersRegistered: number;
  employees: number;
  period: string;
}

declare global {
  export interface Window {
    storage: {
      get: (
        key: string,
        shared?: boolean
      ) => Promise<{ key: string; value: string; shared: boolean } | null>;
      set: (
        key: string,
        value: string,
        shared?: boolean
      ) => Promise<{ key: string; value: string; shared: boolean } | null>;
      delete: (
        key: string,
        shared?: boolean
      ) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list: (
        prefix?: string,
        shared?: boolean
      ) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}
