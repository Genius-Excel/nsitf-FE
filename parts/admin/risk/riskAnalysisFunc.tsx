"use client";

import { useState } from "react";
import { RiskAnalysisDesign } from "./riskAnalysisDesign";
import {
  riskMetrics,
  trendlineData,
  regionalRiskData,
  riskEntities,
} from "@/lib/Constants";
import { RiskEntity } from "@/lib/types";

export function RiskAnalysisFunc() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedRiskType, setSelectedRiskType] = useState("all");
  const [timeHorizon, setTimeHorizon] = useState("1y");

  const handleApplyFilters = () => {
    // TODO: Implement filter logic
    // This would typically:
    // 1. Fetch filtered risk data from API based on filters
    // 2. Update the displayed data
    console.log("Applying filters:", {
      selectedRegion,
      selectedRiskType,
      timeHorizon,
    });
  };

  return (
    <RiskAnalysisDesign
      riskMetrics={riskMetrics}
      trendlineData={trendlineData}
      regionalRiskData={regionalRiskData}
      riskEntities={riskEntities}
      selectedRegion={selectedRegion}
      selectedRiskType={selectedRiskType}
      timeHorizon={timeHorizon}
      onRegionChange={setSelectedRegion}
      onRiskTypeChange={setSelectedRiskType}
      onTimeHorizonChange={setTimeHorizon}
      onApplyFilters={handleApplyFilters}
    />
  );
}
