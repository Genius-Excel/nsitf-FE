"use client";

import { useState } from "react";
import { ValuationForecastingDesign } from "./valuationDesign";
import {
  valuationMetrics,
  claimTrendProjections,
  contributionGrowth,
  inspectionTrends,
  shortTermForecasts,
  longTermForecasts,
} from "@/lib/Constants";

export function ValuationForecastingFunc() {
  const [forecastModel, setForecastModel] = useState("linear");
  const [selectedMetric, setSelectedMetric] = useState("claims");

  const handleExportReport = () => {
    // TODO: Implement export functionality
    // This would typically:
    // 1. Generate a comprehensive PDF/Excel report
    // 2. Include all charts, forecasts, and valuations
    // 3. Trigger download
    console.log(
      "Exporting report with model:",
      forecastModel,
      "metric:",
      selectedMetric
    );

    // Placeholder export logic
    const reportData = {
      model: forecastModel,
      metric: selectedMetric,
      generatedAt: new Date().toISOString(),
      valuationSummary: valuationMetrics,
      forecasts: {
        claims: claimTrendProjections,
        contributions: contributionGrowth,
        inspections: inspectionTrends,
        shortTerm: shortTermForecasts,
        longTerm: longTermForecasts,
      },
    };

    console.log("Report data:", reportData);
    // In production, this would call an API endpoint or generate a file
  };

  return (
    <ValuationForecastingDesign
      valuationMetrics={valuationMetrics}
      claimTrendProjections={claimTrendProjections}
      contributionGrowth={contributionGrowth}
      inspectionTrends={inspectionTrends}
      shortTermForecasts={shortTermForecasts}
      longTermForecasts={longTermForecasts}
      forecastModel={forecastModel}
      selectedMetric={selectedMetric}
      onForecastModelChange={setForecastModel}
      onSelectedMetricChange={setSelectedMetric}
      onExportReport={handleExportReport}
    />
  );
}
