import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

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

export interface ComplianceMetrics {
  total_contributions: number;
  total_target: number;
  performance_rate: number;
  total_employers: number;
  total_employees: number;
}

export interface ComplianceDashboardResponse {
  message: string;
  filters: {
    period: string;
    as_of: string;
    region_id?: string;
    region_name?: string;
  };
  metric_cards: ComplianceMetrics;
  regional_summary?: RegionalSummary[];
  branch_summary?: RegionalSummary[];
}

export interface ComplianceFilters {
  period?: string;
  region_id?: string;
  branch?: string;
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Main hook for fetching compliance dashboard data
 * Follows dashboard pattern: single source of truth, API-driven
 *
 * API returns FLAT structure: { message, filters, metric_cards, regional_summary }
 * No nested .data issues like main dashboard
 */
export const useComplianceDashboard = (filters?: ComplianceFilters) => {
  const [data, setData] = useState<ComplianceDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters?.period) params.append("period", filters.period);
      if (filters?.region_id) params.append("region_id", filters.region_id);
      if (filters?.branch) params.append("branch", filters.branch);

      const queryString = params.toString();
      const url = `/api/dashboard/compliance${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await http.getData(url);

      // API returns flat structure directly
      if (!response?.data) {
        throw new Error("Invalid API response structure");
      }

      setData(response.data as ComplianceDashboardResponse);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch compliance data";
      console.error("Compliance dashboard fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
