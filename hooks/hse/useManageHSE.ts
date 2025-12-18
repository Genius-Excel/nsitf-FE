import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  ManageHSERecordAPI,
  RegionalSummary,
  transformManageHSERecord,
} from "@/lib/types/hse";

const http = new HttpService();

interface UseManageHSEParams {
  page?: number;
  perPage?: number;
  branch_id?: string;
  region_id?: string;
  record_status?: "pending" | "reviewed" | "approved";
  period?: string; // YYYY-MM format
  period_from?: string; // YYYY-MM format - start period
  period_to?: string; // YYYY-MM format - end period
}

interface UseManageHSEReturn {
  // Transformed data for components (camelCase)
  records: RegionalSummary[];

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
}

interface ManageHSEApiResponse {
  message: string;
  data: ManageHSERecordAPI[];
}

/**
 * Fetches HSE records from the manage-hse endpoint with filtering support
 *
 * API: GET /api/hse-ops/manage-hse?record_status=pending&region_id=xxx&period=2025-05
 *
 * Response: { message, data: [...] } where data is array of ManageHSERecordAPI
 *
 * @param params.region_id - Filter by region
 * @param params.branch_id - Filter by branch
 * @param params.record_status - Filter by status: pending | reviewed | approved
 * @param params.period - Filter by period (YYYY-MM)
 * @param params.period_from - Filter by start period (YYYY-MM)
 * @param params.period_to - Filter by end period (YYYY-MM)
 *
 * @returns Transformed HSE records list
 *
 * @example
 * ```tsx
 * const { records, loading, refetch } = useManageHSE({
 *   record_status: "pending",
 *   region_id: "abc-123"
 * });
 * ```
 */
export const useManageHSE = (
  params: UseManageHSEParams = {}
): UseManageHSEReturn => {
  const [records, setRecords] = useState<RegionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters - only add non-empty values
      const queryParams = new URLSearchParams();

      if (params.record_status && params.record_status !== "") {
        queryParams.append("record_status", params.record_status);
      }
      if (params.branch_id && params.branch_id !== "") {
        queryParams.append("branch_id", params.branch_id);
      }
      if (params.region_id && params.region_id !== "") {
        queryParams.append("region_id", params.region_id);
      }
      if (params.period && params.period !== "") {
        queryParams.append("period", params.period);
      }
      if (params.period_from && params.period_from !== "") {
        queryParams.append("period_from", params.period_from);
      }
      if (params.period_to && params.period_to !== "") {
        queryParams.append("period_to", params.period_to);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/api/hse-ops/manage-hse?${queryString}`
        : `/api/hse-ops/manage-hse`;

      console.log("Fetching HSE records with params:", queryString);

      const response = await http.getData(endpoint);
      console.log("Raw API response:", response);

      if (!response?.data) {
        throw new Error("Invalid response format from API");
      }

      console.log("Response.data:", response.data);
      console.log("Is response.data an array?", Array.isArray(response.data));

      // API returns flat array under data: { message, data: [...] }
      const resultsData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      console.log("Results data after parsing:", resultsData);
      console.log("Results data length:", resultsData.length);

      if (!Array.isArray(resultsData)) {
        console.error("Invalid API response structure:", response.data);
        throw new Error(
          `Expected array but got ${typeof resultsData}. Response structure: ${JSON.stringify(
            response.data
          ).substring(0, 300)}`
        );
      }

      // Transform records using manage-hse record transformer
      const transformedRecords = resultsData.map((record: ManageHSERecordAPI) =>
        transformManageHSERecord(record)
      );

      console.log(
        "Fetched and transformed HSE records:",
        transformedRecords.length,
        "records"
      );
      console.log("Transformed records sample:", transformedRecords[0]);
      setRecords(transformedRecords);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch HSE records";
      setError(errorMessage);
      console.error("Error fetching manage-hse:", err);
    } finally {
      setLoading(false);
    }
  }, [
    params.record_status,
    params.region_id,
    params.branch_id,
    params.period,
    params.period_from,
    params.period_to,
  ]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
  };
};
