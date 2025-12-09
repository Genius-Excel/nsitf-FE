"use client";

import { useState } from "react";
import { ValuationForecastingDesign } from "./valuationDesign";
import { useValuationDashboard } from "@/hooks/valuation/useGetValuationDashboard";
import { formatValuationMetrics } from "@/lib/types/valuation";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";

export function ValuationForecastingFunc() {
  const [forecastModel, setForecastModel] = useState<"linear" | "prophet">(
    "prophet"
  );
  const [selectedMetric, setSelectedMetric] = useState("claims");

  // Fetch valuation data from API
  const {
    data: valuationData,
    loading,
    error,
    refetch,
  } = useValuationDashboard({
    model: forecastModel,
    horizonQuarters: 2,
  });

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

    if (valuationData) {
      const reportData = {
        model: forecastModel,
        metric: selectedMetric,
        generatedAt: new Date().toISOString(),
        valuationSummary: valuationData.valuationMetrics,
        forecasts: {
          claims: valuationData.claimTrendProjections,
          contributions: valuationData.contributionGrowth,
          inspections: valuationData.inspectionTrends,
          shortTerm: valuationData.shortTermForecasts,
          longTerm: valuationData.longTermForecasts,
        },
      };

      console.log("Report data:", reportData);
      // In production, this would call an API endpoint or generate a file
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading Valuation & Forecasting data..." />;
  }

  // Error state
  if (error) {
    return <ErrorState error={new Error(error)} onRetry={refetch} />;
  }

  // No data state
  if (!valuationData) {
    return <ErrorState error={new Error("No valuation data available")} />;
  }

  // Format metric cards with icons
  const formattedMetrics = formatValuationMetrics({
    total_liabilities: valuationData.valuationMetrics.totalLiabilities,
    total_liabilities_trend:
      valuationData.valuationMetrics.totalLiabilitiesTrend,
    reserve_adequacy_pct: valuationData.valuationMetrics.reserveAdequacy,
    reserve_adequacy_trend: valuationData.valuationMetrics.reserveAdequacyTrend,
    outstanding_claims: valuationData.valuationMetrics.outstandingClaims,
    outstanding_claims_trend:
      valuationData.valuationMetrics.outstandingClaimsTrend,
    expected_inflows: valuationData.valuationMetrics.expectedInflows,
    expected_inflows_trend: valuationData.valuationMetrics.expectedInflowsTrend,
  });

  // Debug: Log long-term forecasts data
  console.log('=== Long-term Forecasts Data ===');
  console.log('Array length:', valuationData.longTermForecasts?.length || 0);
  console.log('Data:', JSON.stringify(valuationData.longTermForecasts, null, 2));

  return (
    <ValuationForecastingDesign
      valuationMetrics={formattedMetrics}
      claimTrendProjections={valuationData.claimTrendProjections}
      contributionGrowth={valuationData.contributionGrowth}
      inspectionTrends={valuationData.inspectionTrends}
      hseTrends={valuationData.hseTrends}
      shortTermForecasts={valuationData.shortTermForecasts}
      longTermForecasts={valuationData.longTermForecasts}
      forecastModel={forecastModel}
      selectedMetric={selectedMetric}
      onForecastModelChange={(value: string) => {
        if (value === "linear" || value === "prophet") {
          setForecastModel(value);
        }
      }}
      onSelectedMetricChange={setSelectedMetric}
      onExportReport={handleExportReport}
    />
  );
}
