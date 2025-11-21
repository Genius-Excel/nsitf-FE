// ============================================================================
// useHSERecords Hook
// ============================================================================
// Fetches complete list of HSE records with optional filtering
//
// API Endpoint: GET /api/hse-ops/hse-records
// Query Params: status, record_type, employer, date_from, date_to, page, limit
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  HSERecordsListAPI,
  HSERecord,
  transformHSERecordFromAPI,
} from "@/lib/types/hse";

interface HSERecordsFilters {
  status?: string;
  recordType?: string;
  employer?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface UseHSERecordsReturn {
  data: HSERecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHSERecords(
  filters?: HSERecordsFilters
): UseHSERecordsReturn {
  const [data, setData] = useState<HSERecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.recordType)
        queryParams.append("record_type", filters.recordType);
      if (filters?.employer) queryParams.append("employer", filters.employer);
      if (filters?.dateFrom) queryParams.append("date_from", filters.dateFrom);
      if (filters?.dateTo) queryParams.append("date_to", filters.dateTo);
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/api/hse-ops/hse-records${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await httpService.getData(endpoint);
      const apiData: HSERecordsListAPI = response.data;

      const transformedRecords = apiData.data.map(transformHSERecordFromAPI);
      setData(transformedRecords);
    } catch (err: any) {
      console.error("Error fetching HSE records:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load HSE records"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecords,
  };
}
