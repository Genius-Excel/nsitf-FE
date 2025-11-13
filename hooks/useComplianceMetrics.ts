import { useState, useEffect } from "react";
import HttpService from "@/services/httpServices";

export interface ComplianceMetricCards {
  total_contributions: number;
  total_target: number;
  performance_rate: number;
  total_employers: number;
  total_employees: number;
}

export interface RegionalSummary {
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
  message: string;
  filters: {
    period: string;
    as_of: string;
  };
  metric_cards: ComplianceMetricCards;
  regional_summary: RegionalSummary[];
}

const httpService = new HttpService();

export const useComplianceMetrics = () => {
  const [metrics, setMetrics] = useState<ComplianceMetricCards | null>(null);
  const [regionalSummary, setRegionalSummary] = useState<RegionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await httpService.getData("/api/dashboard/compliance");
        const data: ComplianceDashboardResponse = res.data;
        setMetrics(data.metric_cards);
        setRegionalSummary(data.regional_summary);
      } catch (err: any) {
        console.error("Failed to fetch compliance metrics:", err);
        setError(err.message || "Failed to fetch compliance metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, regionalSummary, loading, error };
};
