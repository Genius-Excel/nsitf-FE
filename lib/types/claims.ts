export interface ClaimRecord {
  id: string;
  claim_id: string;
  employer: string;
  claimant: string;
  type: string;
  amount_requested: number;
  amount_paid: number;
  status: "paid" | "pending" | "rejected" | "under_review";
  date_processed: string;
  date_paid: string | null;
  sector: string | null;
  class: string | null;
  payment_period: string | null;
}

export interface MetricCards {
  total_claims_paid: number;
  beneficiaries_rehabilitated: number;
  nok_beneficiaries: number;
  disability_beneficiaries: number;
  retiree_benefit_beneficiaries: number;
}

export interface CategoryMetrics {
  medical_refunds: number;
  disability_claims: number;
  death_claims: number;
  retiree_benefits: number;
}

export interface MonthlyChartDataPoint {
  month: string;
  claims_processed: number;
  target: number;
}

export interface MonthlyChart {
  data: MonthlyChartDataPoint[];
  scale: {
    max: number;
    ticks: number[];
  };
}

export interface ClaimsTable {
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
  results: ClaimRecord[];
}

export interface ClaimsDashboardResponse {
  message: string;
  data: {
    metric_cards: MetricCards;
    category_metrics: CategoryMetrics;
    monthly_chart: MonthlyChart;
    claims_table: ClaimsTable;
  };
}

// Detail endpoint types
export interface ClaimDetailResponse {
  message: string;
  data: {
    claim_id: string;
    employer: string;
    claimant: string;
    type: string;
    status: string;
    financial: {
      amount_requested: number;
      amount_paid: number;
      difference: number;
      difference_pct: number;
    };
    timeline: {
      date_processed: string;
      date_paid: string | null;
      processing_time_days: number;
    };
    classification: {
      sector: string | null;
      class: string | null;
      payment_period: string | null;
    };
  };
}

// Upload endpoint types
export interface ClaimsUploadResponse {
  message: string;
  uploaded_records: number;
  region: string;
}

// ============================================
// Component Types (camelCase) - For UI
// ============================================

export interface Claim {
  id: string;
  claimId: string;
  employer: string;
  claimant: string;
  type:
    | "Medical Refund"
    | "Disability"
    | "Death Claim"
    | "Loss of Productivity";
  amountRequested: number;
  amountPaid: number;
  status: "Paid" | "Pending" | "Rejected" | "Under Review";
  dateProcessed: string;
  datePaid: string | null;
  sector: string | null;
  class: string | null;
  date: string | null; // payment_period
}

export interface ClaimDetail {
  claimId: string;
  employer: string;
  claimant: string;
  type: string;
  status: string;
  financial: {
    amountRequested: number;
    amountPaid: number;
    difference: number;
    differencePercent: number;
  };
  timeline: {
    dateProcessed: string;
    datePaid: string | null;
    processingTimeDays: number;
  };
  classification: {
    sector: string | null;
    class: string | null;
    paymentPeriod: string | null;
  };
}

export interface DashboardMetrics {
  totalClaimsPaid: number;
  beneficiariesRehabilitated: number;
  nokBeneficiaries: number;
  disabilityBeneficiaries: number;
  retireeBenefitBeneficiaries: number;
}

export interface ClaimCategories {
  medicalRefunds: number;
  disabilityClaims: number;
  deathClaims: number;
  retireeBenefits: number;
}

export interface ChartData {
  month: string;
  processed: number; // Renamed from claims_processed to match component expectations
  target: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Helper: Capitalize status for display
 */
function capitalizeStatus(
  status: string
): "Paid" | "Pending" | "Rejected" | "Under Review" {
  const statusMap: Record<
    string,
    "Paid" | "Pending" | "Rejected" | "Under Review"
  > = {
    paid: "Paid",
    pending: "Pending",
    rejected: "Rejected",
    under_review: "Under Review",
  };
  return statusMap[status.toLowerCase()] || "Pending";
}

/**
 * Helper: Normalize claim type for display
 */
function normalizeClaimType(
  type: string
): "Medical Refund" | "Disability" | "Death Claim" | "Loss of Productivity" {
  const typeMap: Record<
    string,
    "Medical Refund" | "Disability" | "Death Claim" | "Loss of Productivity"
  > = {
    "medical refund": "Medical Refund",
    "medical_refund": "Medical Refund",
    disability: "Disability",
    "death claim": "Death Claim",
    "death_claim": "Death Claim",
    "loss of productivity": "Loss of Productivity",
    "loss_of_productivity": "Loss of Productivity",
  };
  return typeMap[type.toLowerCase()] || "Medical Refund";
}

// ============================================
// Transform Functions
// ============================================

/**
 * Transforms API ClaimRecord to component Claim
 */
export const transformClaimRecord = (record: ClaimRecord): Claim => ({
  id: record.id,
  claimId: record.claim_id,
  employer: record.employer,
  claimant: record.claimant,
  type: normalizeClaimType(record.type),
  amountRequested: record.amount_requested,
  amountPaid: record.amount_paid,
  status: capitalizeStatus(record.status),
  dateProcessed: record.date_processed,
  datePaid: record.date_paid,
  sector: record.sector,
  class: record.class,
  date: record.payment_period,
});

/**
 * Transforms API ClaimDetailResponse to component ClaimDetail
 */
export const transformClaimDetail = (
  response: ClaimDetailResponse
): ClaimDetail => ({
  claimId: response.data.claim_id,
  employer: response.data.employer,
  claimant: response.data.claimant,
  type: response.data.type,
  status: response.data.status,
  financial: {
    amountRequested: response.data.financial.amount_requested,
    amountPaid: response.data.financial.amount_paid,
    difference: response.data.financial.difference,
    differencePercent: response.data.financial.difference_pct,
  },
  timeline: {
    dateProcessed: response.data.timeline.date_processed,
    datePaid: response.data.timeline.date_paid,
    processingTimeDays: response.data.timeline.processing_time_days,
  },
  classification: {
    sector: response.data.classification.sector,
    class: response.data.classification.class,
    paymentPeriod: response.data.classification.payment_period,
  },
});

/**
 * Transforms metric cards from API to component format
 */
export const transformMetrics = (metrics: MetricCards): DashboardMetrics => ({
  totalClaimsPaid: metrics.total_claims_paid,
  beneficiariesRehabilitated: metrics.beneficiaries_rehabilitated,
  nokBeneficiaries: metrics.nok_beneficiaries,
  disabilityBeneficiaries: metrics.disability_beneficiaries,
  retireeBenefitBeneficiaries: metrics.retiree_benefit_beneficiaries,
});

/**
 * Transforms category metrics from API to component format
 */
export const transformCategories = (
  categories: CategoryMetrics
): ClaimCategories => ({
  medicalRefunds: categories.medical_refunds,
  disabilityClaims: categories.disability_claims,
  deathClaims: categories.death_claims,
  retireeBenefits: categories.retiree_benefits,
});

/**
 * Transforms chart data - converts claims_processed to processed for component consumption
 */
export const transformChartData = (chart: MonthlyChart): ChartData[] => {
  return chart.data.map((point) => ({
    month: point.month,
    processed: point.claims_processed,
    target: point.target,
  }));
};

// ============================================
// Pagination Types
// ============================================

export interface PaginationState {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
}

export interface PaginationControls {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}
