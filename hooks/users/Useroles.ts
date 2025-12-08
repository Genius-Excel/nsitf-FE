import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface RolesResponse {
  message: string;
  data: Role[];
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Fetch all roles from API
 * Follows regions pattern: single source of truth
 */
export const useRoles = () => {
  const [data, setData] = useState<Role[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await http.getData("/api/admin/roles");

      // API returns: { message, data: Role[] }
      if (!response?.data?.data) {
        throw new Error("Invalid API response structure");
      }

      const apiData = response.data as RolesResponse;
      setData(apiData.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch roles";
      console.error("Roles fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    data,
    loading,
    error,
    refetch: fetchRoles,
  };
};
