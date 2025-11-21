// ============================================================================
// INSPECTION MODULE TYPES
// ============================================================================
// This file contains all type definitions for the Inspection module, including:
// - API response types (snake_case)
// - UI/Component types (camelCase)
// - Transform functions to convert between them
// ============================================================================

// ============================================================================
// API RESPONSE TYPES (snake_case - matches backend exactly)
// ============================================================================

export interface InspectionDashboardAPI {
  metric_cards: {
    total_inspections: number;
    total_demand_notice: number;
    total_debt_established: number;
    total_debt_recovered: number;
    performance_rate: number;
  };
  inspection_summary: {
    id: string;
    branch: string;
    inspections_conducted: number;
    debt_established: number;
    debt_recovered: number;
    performance_rate: number;
    demand_notice: number;
    period: string;
  }[] | { data: any[] };
  monthly_debts_comparison: {
    month: string;
    debts_established: number;
    debts_recovered: number;
  }[] | { data: any[]; scale?: any };
  upcoming_inspections: {
    id: string;
    employer: string;
    location: string;
    date: string;
    inspector: string;
    status: string;
  }[] | { data: any[] };
}

export interface InspectionDetailAPI {
  branch_information: {
    region: string;
    branch_name: string;
    period: string;
  };
  performance_metrics: {
    performance_rate: number;
    recovery_rate: number;
  };
  inspection_activity: {
    inspections_conducted: number;
    demand_notices_issued: number;
    demand_notices_percent: number;
  };
  financial_summary: {
    debt_established: number;
    debt_recovered: number;
    outstanding_debt: number;
    average_debt_per_inspection: number;
  };
}

// ============================================================================
// UI/COMPONENT TYPES (camelCase - used in React components)
// ============================================================================

export interface InspectionMetricCards {
  totalInspections: number;
  totalDemandNotice: number;
  totalDebtEstablished: number;
  totalDebtRecovered: number;
  performanceRate: number;
}

export interface InspectionRecord {
  id: string;
  branch: string;
  inspectionsConducted: number;
  debtEstablished: number;
  debtRecovered: number;
  performanceRate: number;
  demandNotice: number;
  period: string;
}

export interface MonthlyChartData {
  month: string;
  debtsEstablished: number;
  debtsRecovered: number;
}

export interface UpcomingInspection {
  id: string;
  employer: string;
  location: string;
  date: string;
  inspector: string;
  status: "Scheduled" | "Pending";
}

export interface InspectionDetail {
  branchInformation: {
    region: string;
    branchName: string;
    period: string;
  };
  performanceMetrics: {
    performanceRate: number;
    recoveryRate: number;
  };
  inspectionActivity: {
    inspectionsConducted: number;
    demandNoticesIssued: number;
    demandNoticesPercent: number;
  };
  financialSummary: {
    debtEstablished: number;
    debtRecovered: number;
    outstandingDebt: number;
    averageDebtPerInspection: number;
  };
}

export interface InspectionDashboard {
  metricCards: InspectionMetricCards;
  inspectionSummary: InspectionRecord[];
  monthlyDebtsComparison: MonthlyChartData[];
  upcomingInspections: UpcomingInspection[];
}

export interface InspectionStatCard {
  title: string;
  value: string | number;
  bgColor: string;
  description?: string;
  change?: string;
  icon?: string;
}

// ============================================================================
// TRANSFORM FUNCTIONS (snake_case ↔ camelCase)
// ============================================================================

/**
 * Transform API dashboard response to UI dashboard data
 */
export function transformInspectionDashboardFromAPI(
  apiData: InspectionDashboardAPI
): InspectionDashboard {
  // Helper to extract array from either direct array or {data: array} structure
  const getArrayData = (input: any): any[] => {
    if (Array.isArray(input)) return input;
    if (input && typeof input === 'object' && Array.isArray(input.data)) return input.data;
    return [];
  };

  const inspectionSummaryData = getArrayData(apiData.inspection_summary);
  const monthlyDebtsData = getArrayData(apiData.monthly_debts_comparison);
  const upcomingInspectionsData = getArrayData(apiData.upcoming_inspections);

  return {
    metricCards: {
      totalInspections: apiData.metric_cards?.total_inspections || 0,
      totalDemandNotice: apiData.metric_cards?.total_demand_notice || 0,
      totalDebtEstablished: apiData.metric_cards?.total_debt_established || 0,
      totalDebtRecovered: apiData.metric_cards?.total_debt_recovered || 0,
      performanceRate: apiData.metric_cards?.performance_rate || 0,
    },
    inspectionSummary: inspectionSummaryData.map((record) => ({
      id: record.id,
      branch: record.branch,
      inspectionsConducted: record.inspections_conducted,
      debtEstablished: record.debt_established,
      debtRecovered: record.debt_recovered,
      performanceRate: record.performance_rate,
      demandNotice: record.demand_notice,
      period: record.period,
    })),
    monthlyDebtsComparison: monthlyDebtsData.map((month) => ({
      month: month.month,
      debtsEstablished: month.debt_established,
      debtsRecovered: month.debt_recovered,
    })),
    upcomingInspections: upcomingInspectionsData.map((insp) => ({
      id: insp.id,
      employer: insp.employer,
      location: insp.location,
      date: insp.date,
      inspector: insp.inspector,
      status: insp.status === "Scheduled" ? "Scheduled" : "Pending",
    })),
  };
}

/**
 * Transform API detail response to UI detail data
 */
export function transformInspectionDetailFromAPI(
  apiData: InspectionDetailAPI
): InspectionDetail {
  return {
    branchInformation: {
      region: apiData.branch_information.region,
      branchName: apiData.branch_information.branch_name,
      period: apiData.branch_information.period,
    },
    performanceMetrics: {
      performanceRate: apiData.performance_metrics.performance_rate,
      recoveryRate: apiData.performance_metrics.recovery_rate,
    },
    inspectionActivity: {
      inspectionsConducted: apiData.inspection_activity.inspections_conducted,
      demandNoticesIssued: apiData.inspection_activity.demand_notices_issued,
      demandNoticesPercent: apiData.inspection_activity.demand_notices_percent,
    },
    financialSummary: {
      debtEstablished: apiData.financial_summary.debt_established,
      debtRecovered: apiData.financial_summary.debt_recovered,
      outstandingDebt: apiData.financial_summary.outstanding_debt,
      averageDebtPerInspection:
        apiData.financial_summary.average_debt_per_inspection,
    },
  };
}

/**
 * Format currency for Nigerian Naira
 */
export function formatInspectionCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get performance badge color
 */
export function getInspectionPerformanceBadge(rate: number): string {
  if (rate >= 80) return "bg-green-100 text-green-700 border-green-300";
  if (rate >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
}

/**
 * Calculate recovery rate percentage
 */
export function calculateRecoveryRate(
  established: number,
  recovered: number
): string {
  if (established === 0) return "0.0";
  return ((recovered / established) * 100).toFixed(1);
}
