import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface Region {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  target_amount: number | null;
  achieved_amount: number | null;
  period: string | null;
}

export interface RegionsResponse {
  message: string;
  count: number;
  data: Region[];
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Fetch all regions from API
 * Follows users pattern: single source of truth
 */
export const useRegions = () => {
  const [data, setData] = useState<Region[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await http.getData("/api/admin/regions");

      // API returns: { message, count, data: Region[] }
      if (!response?.data?.data) {
        throw new Error("Invalid API response structure");
      }

      const apiData = response.data as RegionsResponse;
      console.log("useRegions: Regions fetched successfully", apiData.data);
      setData(apiData.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch regions";
      console.error("Regions fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    data,
    loading,
    error,
    refetch: fetchRegions,
  };
};
