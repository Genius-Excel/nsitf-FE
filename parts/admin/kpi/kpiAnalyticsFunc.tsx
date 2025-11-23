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
  DollarSign,
  Clock,
} from "lucide-react";

export function KPIAnalyticsFunc() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("6m");

  const { kpiAnalysisData, kpiAnalysisIsLoading, kpiAnalysisError, refetchKPIAnalysis } = useGetKPIAnalysis({ enabled: true });

  const transformedData = useMemo(() => {
    if (!kpiAnalysisData) {
      return {
        kpiMetrics: [],
        regionalData: [],
        sectorData: [],
        monthlyKPIs: [],
      };
    }

    const { kpi_cards, regional_performance, sector_distribution, monthly_kpi_comparison } = kpiAnalysisData;

    // Transform KPI Cards
    const kpiMetrics: KPIMetric[] = [
      {
        title: "Total Claims",
        value: kpi_cards.total_claims.value.toLocaleString(),
        change: kpi_cards.total_claims.trend ? `${kpi_cards.total_claims.trend > 0 ? '+' : ''}${kpi_cards.total_claims.trend.toFixed(1)}%` : "0%",
        trend: (kpi_cards.total_claims.trend ?? 0) >= 0 ? "up" : "down",
        status: kpi_cards.total_claims.status === "Unknown" ? "normal" : kpi_cards.total_claims.status.toLowerCase() as "success" | "warning" | "critical" | "normal",
        icon: FileText,
        target: kpi_cards.total_claims.target ?? kpi_cards.total_claims.value,
        actual: kpi_cards.total_claims.value,
      },
      {
        title: "Paid Claims",
        value: kpi_cards.paid_claims.value.toLocaleString(),
        change: kpi_cards.paid_claims.trend ? `${kpi_cards.paid_claims.trend > 0 ? '+' : ''}${kpi_cards.paid_claims.trend.toFixed(1)}%` : "0%",
        trend: (kpi_cards.paid_claims.trend ?? 0) >= 0 ? "up" : "down",
        status: kpi_cards.paid_claims.status === "Unknown" ? "normal" : kpi_cards.paid_claims.status.toLowerCase() as "success" | "warning" | "critical" | "normal",
        icon: CheckCircle2,
        target: kpi_cards.paid_claims.target ?? kpi_cards.paid_claims.value,
        actual: kpi_cards.paid_claims.value,
      },
      {
        title: "Pending Inspections",
        value: kpi_cards.pending_inspections.value.toLocaleString(),
        change: kpi_cards.pending_inspections.trend ? `${kpi_cards.pending_inspections.trend > 0 ? '+' : ''}${kpi_cards.pending_inspections.trend.toFixed(1)}%` : "0%",
        trend: (kpi_cards.pending_inspections.trend ?? 0) >= 0 ? "up" : "down",
        status: kpi_cards.pending_inspections.status === "Unknown" ? "normal" : kpi_cards.pending_inspections.status.toLowerCase() as "success" | "warning" | "critical" | "normal",
        icon: AlertCircle,
        target: kpi_cards.pending_inspections.target ?? kpi_cards.pending_inspections.value,
        actual: kpi_cards.pending_inspections.value,
      },
      {
        title: "Compliance Rate",
        value: `${kpi_cards.compliance_rate.value.toFixed(2)}%`,
        change: kpi_cards.compliance_rate.trend ? `${kpi_cards.compliance_rate.trend > 0 ? '+' : ''}${kpi_cards.compliance_rate.trend.toFixed(2)}%` : "0%",
        trend: (kpi_cards.compliance_rate.trend ?? 0) >= 0 ? "up" : "down",
        status: kpi_cards.compliance_rate.status === "Unknown" ? "normal" : kpi_cards.compliance_rate.status.toLowerCase() as "success" | "warning" | "critical" | "normal",
        icon: CheckCircle2,
        target: kpi_cards.compliance_rate.target ?? 100,
        actual: kpi_cards.compliance_rate.value,
      },
      {
        title: "Risk Exposure (₦)",
        value: `₦${(kpi_cards.risk_exposure.value / 1000000000).toFixed(2)}B`,
        change: "0%",
        trend: "up",
        status: kpi_cards.risk_exposure.status === "Unknown" ? "normal" : kpi_cards.risk_exposure.status.toLowerCase() as "success" | "warning" | "critical" | "normal",
        icon: DollarSign,
        target: kpi_cards.risk_exposure.target ?? kpi_cards.risk_exposure.value,
        actual: kpi_cards.risk_exposure.value / 1000000000,
      },
      {
        title: "Avg Case Duration (days)",
        value: kpi_cards.avg_case_duration.value.toString(),
        change: "0%",
        trend: "down",
        status: kpi_cards.avg_case_duration.status === "Unknown" ? "normal" : kpi_cards.avg_case_duration.status.toLowerCase() as "success" | "warning" | "critical" | "normal",
        icon: Clock,
        target: kpi_cards.avg_case_duration.target ?? kpi_cards.avg_case_duration.value,
        actual: kpi_cards.avg_case_duration.value,
      },
    ];

    // Transform Regional Data
    const regionalData: RegionalData[] = regional_performance.data.map((region: any) => ({
      region: region.region,
      claims: region.claims,
      paid: region.paid,
      pending: region.pending,
      compliance: 0,
      inspections: 0,
    }));

    // Transform Sector Data
    const sectorData: SectorData[] = sector_distribution.map((sector: any) => ({
      name: sector.sector,
      value: sector.count,
      claims: sector.count,
    }));

    // Transform Monthly KPI Data
    const monthlyKPIs: MonthlyKPI[] = monthly_kpi_comparison.data;

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
