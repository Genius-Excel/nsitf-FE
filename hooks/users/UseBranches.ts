import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface Branch {
  id: string;
  name: string;
  code: string | null;
  region_id: string;
}

export interface BranchesResponse {
  message: string;
  data: Branch[];
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Fetch branches for a specific region
 * Does not auto-fetch on mount - call fetchBranches manually when needed
 */
export const useBranches = () => {
  const [data, setData] = useState<Branch[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async (regionId: string) => {
    if (!regionId) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch branches for the region using query parameter
      const response = await http.getData(`/api/admin/branches?region_id=${regionId}`);

      // API returns: { message, data: Branch[] }
      if (!response?.data?.data) {
        throw new Error("Invalid API response structure");
      }

      const apiData = response.data as BranchesResponse;
      setData(apiData.data);
    } catch (err: any) {
      // If 404, the endpoint doesn't exist - set empty array without showing error
      if (err?.response?.status === 404) {
        console.warn("Branches endpoint not available yet. Users can still be created without selecting a branch.");
        setData([]);
        setError(null); // Don't show error for missing endpoint
      } else {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch branches";
        console.error("Branches fetch error:", err);
        setError(message);
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearBranches = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchBranches,
    clearBranches,
  };
};
