import React from "react";

// ================= HSE ACTIVITY =================
export interface HSEActivity {
  id: string;
  type: string;
  organization: string;
  date: string;
  icon: React.ReactNode;
  details: string;
  recommendations?: string;
  safetyComplianceRate?: string;
  status: string;
}

// Form data for add/edit HSE record
export interface HSEFormData {
  type: string;
  organization: string;
  date: string;
  status: string;
  details: string;
  recommendations?: string;
  safetyComplianceRate?: string;
}

// ================= STAT CARD =================
export interface StatCard {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

// ================= HSE RECORD (TABLE VIEW) =================
// ================= HSE RECORDS =================

export interface HSERecord {
  id: string;
  region: string;
  branch: string;
  totalActualOSH: number;
  targetOSH: number;
  performanceRate: number;
  oshEnlightenment: number;
  oshInspectionAudit: number;
  accidentInvestigation: number;
  activitiesPeriod: string;
}

export interface HSERecordDetail {
  id: string;
  location: {
    region: string;
    branch: string;
    period: string;
  };
  activityBreakdown: {
    totalActivities: number;
    oshEnlightenment: number;
    oshEnlightenmentPct: number;
    oshAudit: number;
    oshAuditPct: number;
    accidentInvestigation: number;
    accidentInvestigationPct: number;
  };
  performanceMetrics: {
    performanceRate: number;
    achievementRate: number;
  };
}

// ================= HSE TABLE DETAIL =================
export interface TableDetail {
  locationInformation: {
    region: string;
    branch: string;
    period: string;
  };
  performanceMetrics: {
    performanceRate: number;
    achievementRate: number;
  };
  targetVsActual: {
    targetActivities: number;
    actualActivities: number;
    achievementRate: number;
    variance: number;
    aboveTarget: boolean;
  };
  activityBreakdown: {
    oshEnlightenment: number;
    oshAudit: number;
    accidentInvestigation: number;
    oshEnlightenmentPct: number;
    oshAuditPct: number;
    accidentInvestigationPct: number;
    totalActivities: number;
  };
}
