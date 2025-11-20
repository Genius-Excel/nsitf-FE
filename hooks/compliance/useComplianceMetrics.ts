import { useEffect, useState, useCallback } from "react";
import HttpService from "@/services/httpServices";

export interface ComplianceMetrics {
  total_contributions: number;
  total_target: number;
  performance_rate: number;
  total_employers: number;
  total_employees: number;
}

export interface ComplianceRegion {
  region: string;
  region_id: string;
  branch: string | null;
  collected: number;
  target: number;
  performance_rate: number;
  employers: number;
  employees: number;
  registration_fees: number;
  certificate_fees: number;
  period: string;
}

export interface ComplianceDashboardResponse {
  filters: {
    period: string;
    as_of: string;
  };
  metric_cards: ComplianceMetrics;
  regional_summary: ComplianceRegion[];
}

const http = new HttpService();

export const useComplianceMetrics = (period?: string) => {
  const [data, setData] = useState<ComplianceDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const url = period
        ? `/api/dashboard/compliance?period=${period}`
        : `/api/dashboard/compliance`;

      const response = await http.getData(url);

      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
};
