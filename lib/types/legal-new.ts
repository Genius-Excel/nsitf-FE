// ============================================================================
// LEGAL MODULE TYPES - Updated to match Claims/Inspection pattern
// ============================================================================

// ============================================================================
// API RESPONSE TYPES (snake_case - matches backend)
// ============================================================================

export interface ManageLegalRecordAPI {
  id: string;
  region: string;
  branch: string;
  recalcitrant_employers: number;
  defaulting_employers: number;
  ecs_number: string;
  sector: string[];
  plan_issued: number;
  alternate_dispute_resolution: number;
  cases_instituted_in_court: number;
  cases_won: number;
  period: string; // YYYY-MM format
  record_status: "pending" | "reviewed" | "approved";
  reviewed_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegalMetricsAPI {
  message: string;
  data: {
    filters: {
      region_id: string | null;
      branch_id: string | null;
      period: string | null;
      period_from: string | null;
      period_to: string | null;
    };
    metric_cards: {
      recalcitrant_employers: number;
      defaulting_employers: number;
      plan_issued: number;
      alternate_dispute_resolution: number;
      cases_instituted_in_court: number;
      cases_won: number;
    };
  };
}

// ============================================================================
// UI/COMPONENT TYPES (camelCase)
// ============================================================================

export interface LegalRecord {
  id: string;
  region: string;
  branch: string;
  recalcitrantEmployers: number;
  defaultingEmployers: number;
  ecsNumber: string;
  sector: string[];
  planIssued: number;
  alternateDisputeResolution: number;
  casesInstitutedInCourt: number;
  casesWon: number;
  period: string;
  recordStatus?: string;
  reviewedBy?: string | null;
  approvedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalMetrics {
  filters: {
    regionId: string | null;
    branchId: string | null;
    period: string | null;
    periodFrom: string | null;
    periodTo: string | null;
  };
  metricCards: {
    recalcitrantEmployers: number;
    defaultingEmployers: number;
    planIssued: number;
    alternateDisputeResolution: number;
    casesInstitutedInCourt: number;
    casesWon: number;
  };
}

export interface LegalDashboardData {
  metrics: LegalMetrics;
  records: LegalRecord[];
}

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

export function transformManageLegalRecord(
  apiRecord: ManageLegalRecordAPI
): LegalRecord {
  return {
    id: apiRecord.id,
    region: apiRecord.region,
    branch: apiRecord.branch,
    recalcitrantEmployers: apiRecord.recalcitrant_employers,
    defaultingEmployers: apiRecord.defaulting_employers,
    ecsNumber: apiRecord.ecs_number,
    sector: apiRecord.sector,
    planIssued: apiRecord.plan_issued,
    alternateDisputeResolution: apiRecord.alternate_dispute_resolution,
    casesInstitutedInCourt: apiRecord.cases_instituted_in_court,
    casesWon: apiRecord.cases_won,
    period: apiRecord.period,
    recordStatus: apiRecord.record_status,
    reviewedBy: apiRecord.reviewed_by,
    approvedBy: apiRecord.approved_by,
    createdAt: apiRecord.created_at,
    updatedAt: apiRecord.updated_at,
  };
}

export function transformLegalRecordToAPI(record: Partial<LegalRecord>): any {
  return {
    recalcitrant_employers: record.recalcitrantEmployers,
    defaulting_employers: record.defaultingEmployers,
    ecs_number: record.ecsNumber,
    sector: record.sector,
    plan_issued: record.planIssued,
    alternate_dispute_resolution: record.alternateDisputeResolution,
    cases_instituted_in_court: record.casesInstitutedInCourt,
    cases_won: record.casesWon,
    period: record.period,
  };
}

export function getLegalStatusColor(
  status: string
): "yellow" | "blue" | "green" {
  switch (status?.toLowerCase()) {
    case "pending":
      return "yellow";
    case "reviewed":
      return "blue";
    case "approved":
      return "green";
    default:
      return "yellow";
  }
}
