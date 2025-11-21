export interface HSERecordAPI {
  id: string;
  record_type: string;
  employer: string;
  details: string;
  recommendations: string;
  safety_compliance_rate: string; // API returns as string
  date_logged: string; // ISO date string
  created_by: string;
  created_by_name: string;
  reports: string;
  document: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HSEDashboardMetricsAPI {
  filters: {
    region_id: string | null;
    period: string;
    as_of: string;
  };
  metric_cards: {
    total_actual_osh_activities: number;
    target_osh_activities: number;
    performance_rate: number;
    osh_enlightenment: number;
    osh_audit: number;
    accident_investigation: number;
  };
  regional_summary: {
    id: string;
    region: string;
    branch: string;
    total_actual_osh_activities: number;
    target_osh_activities: number;
    performance_rate: number;
    osh_enlightenment: number;
    osh_inspection_audit: number;
    accident_investigation: number;
    period: string;
  }[];
}

export interface HSERecordsListAPI {
  message: string;
  data: HSERecordAPI[];
}

export interface HSEDashboardResponseAPI {
  message: string;
  data: HSEDashboardMetricsAPI;
}

// ============================================================================
// UI/COMPONENT TYPES (camelCase - used in React components)
// ============================================================================

export interface HSERecord {
  id: string;
  recordType: string;
  employer: string;
  details: string;
  recommendations: string;
  safetyComplianceRate: number; // Converted to number
  dateLogged: string; // Formatted date
  createdBy: string;
  createdByName: string;
  reports: string;
  document: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegionalSummary {
  id: string;
  region: string;
  branch: string;
  totalActualOSHActivities: number;
  targetOSHActivities: number;
  performanceRate: number;
  oshEnlightenment: number;
  oshInspectionAudit: number;
  accidentInvestigation: number;
  period: string;
}

export interface HSEDashboardMetrics {
  filters: {
    regionId: string | null;
    period: string;
    asOf: string;
  };
  metricCards: {
    totalActualOSHActivities: number;
    targetOSHActivities: number;
    performanceRate: number;
    oshEnlightenment: number;
    oshAudit: number;
    accidentInvestigation: number;
  };
  regionalSummary: RegionalSummary[];
}

// Form data type (for create/update operations)
export interface HSEFormData {
  recordType: string;
  employer: string;
  safetyComplianceRate: string; // Keep as string in forms for input handling
  dateLogged: string;
  status: string;
  details: string;
  recommendations: string;
}

// Stat card type for metrics display
export interface HSEStatCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  colorScheme?: "green" | "blue" | "orange" | "purple" | "gray";
}

// Activity type for UI display
export interface HSEActivity {
  id: string;
  type: string;
  organization: string;
  date: string;
  status: string;
  details?: string;
  recommendations?: string;
  icon: string;
}

// ============================================================================
// TRANSFORM FUNCTIONS (snake_case ↔ camelCase)
// ============================================================================

/**
 * Transform API record to UI record
 * Converts snake_case to camelCase and parses numeric strings
 */
export function transformHSERecordFromAPI(apiRecord: HSERecordAPI): HSERecord {
  return {
    id: apiRecord.id,
    recordType: apiRecord.record_type,
    employer: apiRecord.employer,
    details: apiRecord.details,
    recommendations: apiRecord.recommendations,
    safetyComplianceRate: parseFloat(apiRecord.safety_compliance_rate) || 0,
    dateLogged: apiRecord.date_logged,
    createdBy: apiRecord.created_by,
    createdByName: apiRecord.created_by_name,
    reports: apiRecord.reports,
    document: apiRecord.document,
    status: apiRecord.status,
    createdAt: apiRecord.created_at,
    updatedAt: apiRecord.updated_at,
  };
}

/**
 * Transform UI form data to API payload
 * Converts camelCase to snake_case for API submission
 */
export function transformHSEFormToAPI(formData: HSEFormData): {
  record_type: string;
  employer: string;
  safety_compliance_rate: number;
  date_logged: string;
  status: string;
  details?: string;
  recommendations?: string;
} {
  return {
    record_type: formData.recordType,
    employer: formData.employer,
    safety_compliance_rate: parseFloat(formData.safetyComplianceRate) || 0,
    date_logged: formData.dateLogged,
    status: formData.status,
    ...(formData.details && { details: formData.details }),
    ...(formData.recommendations && {
      recommendations: formData.recommendations,
    }),
  };
}

/**
 * Transform API dashboard response to UI dashboard data
 */
export function transformHSEDashboardFromAPI(
  apiData: HSEDashboardMetricsAPI
): HSEDashboardMetrics {
  return {
    filters: {
      regionId: apiData.filters.region_id,
      period: apiData.filters.period,
      asOf: apiData.filters.as_of,
    },
    metricCards: {
      totalActualOSHActivities: apiData.metric_cards.total_actual_osh_activities,
      targetOSHActivities: apiData.metric_cards.target_osh_activities,
      performanceRate: apiData.metric_cards.performance_rate,
      oshEnlightenment: apiData.metric_cards.osh_enlightenment,
      oshAudit: apiData.metric_cards.osh_audit,
      accidentInvestigation: apiData.metric_cards.accident_investigation,
    },
    regionalSummary: apiData.regional_summary.map((region) => ({
      id: region.id,
      region: region.region,
      branch: region.branch,
      totalActualOSHActivities: region.total_actual_osh_activities,
      targetOSHActivities: region.target_osh_activities,
      performanceRate: region.performance_rate,
      oshEnlightenment: region.osh_enlightenment,
      oshInspectionAudit: region.osh_inspection_audit,
      accidentInvestigation: region.accident_investigation,
      period: region.period,
    })),
  };
}

/**
 * Format date for display (YYYY-MM-DD -> "Oct 21, 2025")
 */
export function formatHSEDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get status badge color
 */
export function getHSEStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("completed")) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }
  if (statusLower.includes("investigation")) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }
  if (statusLower.includes("follow")) {
    return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  }
  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}
