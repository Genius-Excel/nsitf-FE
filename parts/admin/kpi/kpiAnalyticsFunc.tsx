"use client";

import { useState } from "react";
import { KPIAnalyticsDesign } from "./kpiAnalyticsDesign";
import {
  kpiMetrics,
  regionalData,
  sectorData,
  monthlyKPIs,
} from "@/lib/Constants";

export function KPIAnalyticsFunc() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("6m");

  const handleApplyFilters = () => {
    // TODO: Implement filter logic
    // This would typically:
    // 1. Fetch filtered data from API based on selected filters
    // 2. Update the displayed data
    console.log("Applying filters:", {
      selectedRegion,
      selectedSector,
      selectedPeriod,
    });
  };

  return (
    <KPIAnalyticsDesign
      kpiMetrics={kpiMetrics}
      regionalData={regionalData}
      sectorData={sectorData}
      monthlyKPIs={monthlyKPIs}
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
