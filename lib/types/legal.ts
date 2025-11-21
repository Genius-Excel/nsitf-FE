// ============================================================================
// LEGAL MODULE TYPES
// ============================================================================
// This file contains all type definitions for the Legal module, including:
// - API response types (snake_case)
// - UI/Component types (camelCase)
// - Transform functions to convert between them
// ============================================================================

// ============================================================================
// API RESPONSE TYPES (snake_case - matches backend exactly)
// ============================================================================

export interface LegalDashboardAPI {
  message: string;
  data: {
    filters: {
      region_id: string | null;
      search: string;
      as_of: string;
    };
    metric_cards: {
      recalcitrant_employers: number;
      defaulting_employers: number;
      plan_issued: number;
      adr_cases: number;
      cases_instituted: number;
      sectors_covered: number;
    };
    summary_table: {
      id: string;
      region: string;
      branch: string;
      recalcitrant_employers: number;
      defaulting_employers: number;
      ecs_number: string;
      plan_issued: number;
      adr: number;
      cases_instituted: number;
      sectors: string[];
      activities_period: string;
    }[];
  };
}

export interface LegalDetailAPI {
  message: string;
  data: {
    region: string;
    branch: string;
    period: string;
    metrics: {
      recalcitrant_employers: number;
      defaulting_employers: number;
      ecs_number: string;
    };
    legal_actions: {
      plan_issued: number;
      adr: number;
      cases_instituted: number;
    };
    sectors: string[];
  };
}

export interface LegalUploadResponseAPI {
  message: string;
  summary: {
    created: number;
    updated: number;
    errors: string[];
  };
}

// ============================================================================
// UI/COMPONENT TYPES (camelCase - used in React components)
// ============================================================================

export interface LegalMetricCards {
  recalcitrantEmployers: number;
  defaultingEmployers: number;
  planIssued: number;
  adrCases: number;
  casesInstituted: number;
  sectorsCovered: number;
}

export interface LegalActivityRecord {
  id: string;
  region: string;
  branch: string;
  recalcitrantEmployers: number;
  defaultingEmployers: number;
  ecsNumber: string;
  planIssued: number;
  adr: number;
  casesInstituted: number;
  sectors: string[];
  activitiesPeriod: string;
}

export interface LegalDetail {
  region: string;
  branch: string;
  period: string;
  metrics: {
    recalcitrantEmployers: number;
    defaultingEmployers: number;
    ecsNumber: string;
  };
  legalActions: {
    planIssued: number;
    adr: number;
    casesInstituted: number;
  };
  sectors: string[];
}

export interface LegalDashboard {
  filters: {
    regionId: string | null;
    search: string;
    asOf: string;
  };
  metricCards: LegalMetricCards;
  summaryTable: LegalActivityRecord[];
}

export interface LegalUploadResponse {
  message: string;
  summary: {
    created: number;
    updated: number;
    errors: string[];
  };
}

export interface LegalStatCard {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  colorScheme?: "green" | "blue" | "orange" | "purple" | "gray";
}

// ============================================================================
// TRANSFORM FUNCTIONS (snake_case ↔ camelCase)
// ============================================================================

/**
 * Transform API dashboard response to UI dashboard data
 */
export function transformLegalDashboardFromAPI(
  apiData: LegalDashboardAPI["data"]
): LegalDashboard {
  return {
    filters: {
      regionId: apiData.filters.region_id,
      search: apiData.filters.search,
      asOf: apiData.filters.as_of,
    },
    metricCards: {
      recalcitrantEmployers: apiData.metric_cards.recalcitrant_employers,
      defaultingEmployers: apiData.metric_cards.defaulting_employers,
      planIssued: apiData.metric_cards.plan_issued,
      adrCases: apiData.metric_cards.adr_cases,
      casesInstituted: apiData.metric_cards.cases_instituted,
      sectorsCovered: apiData.metric_cards.sectors_covered,
    },
    summaryTable: apiData.summary_table.map((record) => ({
      id: record.id,
      region: record.region,
      branch: record.branch,
      recalcitrantEmployers: record.recalcitrant_employers,
      defaultingEmployers: record.defaulting_employers,
      ecsNumber: record.ecs_number,
      planIssued: record.plan_issued,
      adr: record.adr,
      casesInstituted: record.cases_instituted,
      sectors: record.sectors,
      activitiesPeriod: record.activities_period,
    })),
  };
}

/**
 * Transform API detail response to UI detail data
 */
export function transformLegalDetailFromAPI(
  apiData: LegalDetailAPI["data"]
): LegalDetail {
  return {
    region: apiData.region,
    branch: apiData.branch,
    period: apiData.period,
    metrics: {
      recalcitrantEmployers: apiData.metrics.recalcitrant_employers,
      defaultingEmployers: apiData.metrics.defaulting_employers,
      ecsNumber: apiData.metrics.ecs_number,
    },
    legalActions: {
      planIssued: apiData.legal_actions.plan_issued,
      adr: apiData.legal_actions.adr,
      casesInstituted: apiData.legal_actions.cases_instituted,
    },
    sectors: apiData.sectors,
  };
}

/**
 * Format date for display
 */
export function formatLegalDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format sectors array to comma-separated string for display
 */
export function formatSectors(sectors: string[]): string {
  if (!sectors || sectors.length === 0) return "None";
  return sectors.join(", ");
}

/**
 * Get color scheme for metric based on value
 */
export function getLegalMetricColor(
  value: number,
  threshold: number = 50
): "green" | "orange" | "gray" {
  if (value === 0) return "gray";
  if (value >= threshold) return "orange";
  return "green";
}
