import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface RegionalSummary {
  id: string; // Compliance record ID
  region: string;
  region_id: string;
  branch: string | null;
  actual_contributions_collected: number;
  contributions_target: number;
  performance_rate: number;
  employers_registered: number;
  employees_covered: number;
  registration_fees: number;
  certificate_fees: number;
  period: string;
  record_status?: string;
  reviewed_by?: string | null;
  approved_by?: string | null;
  created_at?: string;
  updated_at?: string;
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
  period_from?: string;
  period_to?: string;
  region_id?: string;
  branch_id?: string;
  record_status?: string;
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
      if (filters?.period_from)
        params.append("period_from", filters.period_from);
      if (filters?.period_to) params.append("period_to", filters.period_to);
      if (filters?.region_id) params.append("region_id", filters.region_id);
      if (filters?.branch_id) params.append("branch_id", filters.branch_id);
      if (filters?.record_status)
        params.append("record_status", filters.record_status);

      const queryString = params.toString();
      const url = `/api/contributions/manage-contributions${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await http.getData(url);

      // API returns { message, data: [...] } structure
      // We need to transform it to match the expected dashboard structure
      if (!response?.data) {
        throw new Error("Invalid API response structure");
      }

      // If response.data is an array (from /api/contributions/manage-contributions)
      // we need to structure it properly
      const records = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      // Create a dashboard response structure
      const dashboardResponse: ComplianceDashboardResponse = {
        message: response.data.message || "Data retrieved",
        filters: {
          period: filters?.period || "",
          as_of: new Date().toISOString(),
          region_id: filters?.region_id,
          region_name: "",
        },
        metric_cards: {
          total_contributions: 0,
          total_target: 0,
          performance_rate: 0,
          total_employers: 0,
          total_employees: 0,
        },
        regional_summary: records,
      };

      // Calculate metrics from records if available
      if (records && Array.isArray(records)) {
        dashboardResponse.metric_cards = {
          total_contributions: records.reduce(
            (sum, r) => sum + (r.actual_contributions_collected || 0),
            0
          ),
          total_target: records.reduce(
            (sum, r) => sum + (r.contributions_target || 0),
            0
          ),
          performance_rate: 0,
          total_employers: records.reduce(
            (sum, r) => sum + (r.employers_registered || 0),
            0
          ),
          total_employees: records.reduce(
            (sum, r) => sum + (r.employees_covered || 0),
            0
          ),
        };

        // Calculate performance rate
        if (dashboardResponse.metric_cards.total_target > 0) {
          dashboardResponse.metric_cards.performance_rate =
            (dashboardResponse.metric_cards.total_contributions /
              dashboardResponse.metric_cards.total_target) *
            100;
        }
      }

      setData(dashboardResponse);
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
