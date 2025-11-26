import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  transformRiskAnalysisFromAPI,
  type RiskAnalysisAPIResponse,
  type RiskAnalysisDashboardData,
} from "@/lib/types/risk";

interface UseRiskAnalysisParams {
  regionId?: string;
}

interface UseRiskAnalysisReturn {
  data: RiskAnalysisDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRiskAnalysis(
  params: UseRiskAnalysisParams = {}
): UseRiskAnalysisReturn {
  const { regionId } = params;

  const [data, setData] = useState<RiskAnalysisDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (regionId) {
        queryParams.append("region_id", regionId);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/api/risk-analysis/dashboard?${queryString}`
        : "/api/risk-analysis/dashboard";

      const response = await httpService.getData(endpoint);

      const apiData: RiskAnalysisAPIResponse = response.data;
      const transformedData = transformRiskAnalysisFromAPI(apiData.data);

      setData(transformedData);
    } catch (err: any) {
      console.error("Error fetching Risk Analysis dashboard:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load Risk Analysis data"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
