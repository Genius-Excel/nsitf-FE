"use client";

import { useState, useMemo } from "react";
import { KPIAnalyticsDesign } from "./kpiAnalyticsDesign";
import { useGetKPIAnalysis } from "@/services/admin";
import { KPIMetric, RegionalData, SectorData, MonthlyKPI } from "@/lib/types";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
} from "lucide-react";

// Custom Naira Icon
const NairaIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="6" y1="3" x2="6" y2="21" />
    <line x1="18" y1="3" x2="18" y2="21" />
    <line x1="6" y1="8" x2="18" y2="16" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="2" y1="14" x2="22" y2="14" />
  </svg>
);

export function KPIAnalyticsFunc() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("6m");

  const {
    kpiAnalysisData,
    kpiAnalysisIsLoading,
    kpiAnalysisError,
    refetchKPIAnalysis,
  } = useGetKPIAnalysis({ enabled: true });

  const transformedData = useMemo(() => {
    if (!kpiAnalysisData) {
      return {
        kpiMetrics: [],
        regionalData: [],
        sectorData: [],
        monthlyKPIs: [],
      };
    }

    // Safe defaults for all data
    const kpi_cards = kpiAnalysisData?.kpi_cards || {
      total_claims: { value: 0, trend: 0, status: "Unknown", target: 0 },
      paid_claims: { value: 0, trend: 0, status: "Unknown", target: 0 },
      pending_inspections: { value: 0, trend: 0, status: "Unknown", target: 0 },
      compliance_rate: { value: 0, trend: 0, status: "Unknown", target: 100 },
      risk_exposure: { value: 0, trend: 0, status: "Unknown", target: 0 },
      avg_case_duration: { value: 0, trend: 0, status: "Unknown", target: 0 },
    };

    const regional_performance = kpiAnalysisData?.regional_performance || {
      data: [],
    };
    const sector_distribution = kpiAnalysisData?.sector_distribution || [];
    const monthly_kpi_comparison = kpiAnalysisData?.monthly_kpi_comparison || {
      data: [],
    };

    // Transform KPI Cards with safe defaults
    const kpiMetrics: KPIMetric[] = [
      {
        title: "Total Claims",
        value: (kpi_cards.total_claims?.value ?? 0).toLocaleString(),
        change: kpi_cards.total_claims?.trend
          ? `${
              kpi_cards.total_claims.trend > 0 ? "+" : ""
            }${kpi_cards.total_claims.trend.toFixed(1)}%`
          : "0%",
        trend: (kpi_cards.total_claims?.trend ?? 0) >= 0 ? "up" : "down",
        status:
          kpi_cards.total_claims?.status === "Unknown"
            ? "normal"
            : (kpi_cards.total_claims?.status?.toLowerCase() as
                | "success"
                | "warning"
                | "critical"
                | "normal") || "normal",
        icon: FileText,
        target:
          kpi_cards.total_claims?.target ?? kpi_cards.total_claims?.value ?? 0,
        actual: kpi_cards.total_claims?.value ?? 0,
      },
      {
        title: "Paid Claims",
        value: (kpi_cards.paid_claims?.value ?? 0).toLocaleString(),
        change: kpi_cards.paid_claims?.trend
          ? `${
              kpi_cards.paid_claims.trend > 0 ? "+" : ""
            }${kpi_cards.paid_claims.trend.toFixed(1)}%`
          : "0%",
        trend: (kpi_cards.paid_claims?.trend ?? 0) >= 0 ? "up" : "down",
        status:
          kpi_cards.paid_claims?.status === "Unknown"
            ? "normal"
            : (kpi_cards.paid_claims?.status?.toLowerCase() as
                | "success"
                | "warning"
                | "critical"
                | "normal") || "normal",
        icon: CheckCircle2,
        target:
          kpi_cards.paid_claims?.target ?? kpi_cards.paid_claims?.value ?? 0,
        actual: kpi_cards.paid_claims?.value ?? 0,
      },
      {
        title: "Pending Inspections",
        value: (kpi_cards.pending_inspections?.value ?? 0).toLocaleString(),
        change: kpi_cards.pending_inspections?.trend
          ? `${
              kpi_cards.pending_inspections.trend > 0 ? "+" : ""
            }${kpi_cards.pending_inspections.trend.toFixed(1)}%`
          : "0%",
        trend: (kpi_cards.pending_inspections?.trend ?? 0) >= 0 ? "up" : "down",
        status:
          kpi_cards.pending_inspections?.status === "Unknown"
            ? "normal"
            : (kpi_cards.pending_inspections?.status?.toLowerCase() as
                | "success"
                | "warning"
                | "critical"
                | "normal") || "normal",
        icon: AlertCircle,
        target:
          kpi_cards.pending_inspections?.target ??
          kpi_cards.pending_inspections?.value ??
          0,
        actual: kpi_cards.pending_inspections?.value ?? 0,
      },
      {
        title: "Compliance Rate",
        value: `${(kpi_cards.compliance_rate?.value ?? 0).toFixed(2)}%`,
        change: kpi_cards.compliance_rate?.trend
          ? `${
              kpi_cards.compliance_rate.trend > 0 ? "+" : ""
            }${kpi_cards.compliance_rate.trend.toFixed(2)}%`
          : "0%",
        trend: (kpi_cards.compliance_rate?.trend ?? 0) >= 0 ? "up" : "down",
        status:
          kpi_cards.compliance_rate?.status === "Unknown"
            ? "normal"
            : (kpi_cards.compliance_rate?.status?.toLowerCase() as
                | "success"
                | "warning"
                | "critical"
                | "normal") || "normal",
        icon: CheckCircle2,
        target: kpi_cards.compliance_rate?.target ?? 100,
        actual: kpi_cards.compliance_rate?.value ?? 0,
      },
      {
        title: "Risk Exposure (₦)",
        value: `₦${((kpi_cards.risk_exposure?.value ?? 0) / 1000000000).toFixed(
          2
        )}B`,
        change: "0",
        trend: "up",
        status:
          kpi_cards.risk_exposure?.status === "Unknown"
            ? "normal"
            : (kpi_cards.risk_exposure?.status?.toLowerCase() as
                | "success"
                | "warning"
                | "critical"
                | "normal") || "normal",
        icon: NairaIcon,
        target:
          (kpi_cards.risk_exposure?.target ??
            kpi_cards.risk_exposure?.value ??
            0) / 1000000000,
        actual: (kpi_cards.risk_exposure?.value ?? 0) / 1000000000,
      },
      {
        title: "Avg Case Duration (days)",
        value: (kpi_cards.avg_case_duration?.value ?? 0).toString(),
        change: "0%",
        trend: "down",
        status:
          kpi_cards.avg_case_duration?.status === "Unknown"
            ? "normal"
            : (kpi_cards.avg_case_duration?.status?.toLowerCase() as
                | "success"
                | "warning"
                | "critical"
                | "normal") || "normal",
        icon: Clock,
        target:
          kpi_cards.avg_case_duration?.target ??
          kpi_cards.avg_case_duration?.value ??
          0,
        actual: kpi_cards.avg_case_duration?.value ?? 0,
      },
    ];

    // Transform Regional Data with safe defaults
    const regionalData: RegionalData[] = (regional_performance?.data || []).map(
      (region: any) => ({
        region: region?.region || "",
        claims: region?.claims ?? 0,
        paid: region?.paid ?? 0,
        pending: region?.pending ?? 0,
        compliance: 0,
        inspections: 0,
      })
    );

    // Transform Sector Data with safe defaults
    const sectorData: SectorData[] = (sector_distribution || []).map(
      (sector: any) => ({
        name: sector?.sector || "",
        value: sector?.count ?? 0,
        claims: sector?.count ?? 0,
      })
    );

    // Transform Monthly KPI Data with safe defaults
    const monthlyKPIs: MonthlyKPI[] = monthly_kpi_comparison?.data || [];

    return {
      kpiMetrics,
      regionalData,
      sectorData,
      monthlyKPIs,
    };
  }, [kpiAnalysisData]);

  const handleApplyFilters = () => {
    // Refetch data when filters are applied
    refetchKPIAnalysis();
    console.log("Applying filters:", {
      selectedRegion,
      selectedSector,
      selectedPeriod,
    });
  };

  if (kpiAnalysisIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-lg text-gray-600">Loading KPI Analytics...</p>
        </div>
      </div>
    );
  }

  if (kpiAnalysisError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <p className="text-lg text-gray-600">Error loading KPI data</p>
          <p className="text-sm text-gray-500 mt-2">{kpiAnalysisError}</p>
          <button
            onClick={() => refetchKPIAnalysis()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <KPIAnalyticsDesign
      kpiMetrics={transformedData.kpiMetrics}
      regionalData={transformedData.regionalData}
      sectorData={transformedData.sectorData}
      monthlyKPIs={transformedData.monthlyKPIs}
      selectedRegion={selectedRegion}
      selectedSector={selectedSector}
      selectedPeriod={selectedPeriod}
      onRegionChange={setSelectedRegion}
      onSectorChange={setSelectedSector}
      onPeriodChange={setSelectedPeriod}
      onApplyFilters={handleApplyFilters}
    />
  );
}
