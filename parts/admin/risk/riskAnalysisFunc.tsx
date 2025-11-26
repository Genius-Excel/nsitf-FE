"use client";

import { useState } from "react";
import { RiskAnalysisDesign } from "./riskAnalysisDesign";
import { useRiskAnalysis } from "@/hooks/risk/useGetRiskAnalysis";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";

export function RiskAnalysisFunc() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedRiskType, setSelectedRiskType] = useState("all");
  const [timeHorizon, setTimeHorizon] = useState("1y");

  // Fetch risk analysis data from API
  const {
    data: riskData,
    loading,
    error,
    refetch,
  } = useRiskAnalysis({
    regionId: selectedRegion !== "all" ? selectedRegion : undefined,
  });

  const handleApplyFilters = () => {
    // Refetch data with current filters
    refetch();
    console.log("Applying filters:", {
      selectedRegion,
      selectedRiskType,
      timeHorizon,
    });
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading Risk Analysis data..." />;
  }

  // Error state
  if (error) {
    return <ErrorState error={new Error(error)} onRetry={refetch} />;
  }

  // No data state
  if (!riskData) {
    return <ErrorState error={new Error("No risk analysis data available")} />;
  }

  return (
    <RiskAnalysisDesign
      riskMetrics={riskData.riskMetrics}
      trendlineData={riskData.trendlineData}
      regionalRiskData={riskData.regionalData}
      riskEntities={riskData.topRiskEntities}
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
