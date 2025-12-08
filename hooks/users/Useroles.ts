import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface Role {
  id: string;
  name: string;
  description?: string;
}

// API returns this structure
interface RoleApiResponse {
  role_id: string;
  role_name: string;
  description?: string;
}

export interface RolesResponse {
  message: string;
  data: RoleApiResponse[];
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

      console.log("Fetching roles from /api/admin/roles...");
      const response = await http.getData("/api/admin/roles");
      console.log("Roles API response:", response);

      // Helper function to transform API response to our format
      const transformRole = (apiRole: RoleApiResponse): Role => ({
        id: apiRole.role_id,
        name: apiRole.role_name,
        description: apiRole.description || "",
      });

      // Try different response structures
      // Structure 1: { message, data: RoleApiResponse[] }
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const apiData = response.data as RolesResponse;
        console.log("Roles data (structure 1):", apiData.data);
        const transformedRoles = apiData.data.map(transformRole);
        console.log("Transformed roles:", transformedRoles);
        setData(transformedRoles);
        return;
      }

      // Structure 2: Direct array of RoleApiResponse
      if (Array.isArray(response?.data)) {
        console.log("Roles data (structure 2 - direct array):", response.data);
        const transformedRoles = response.data.map(transformRole);
        console.log("Transformed roles:", transformedRoles);
        setData(transformedRoles);
        return;
      }

      // Structure 3: { data: RoleApiResponse[] } without message
      if (response?.data && !response.data.data) {
        console.log("Roles data (structure 3):", response.data);
        // This might be a single object or needs different handling
        setData([transformRole(response.data)]);
        return;
      }

      console.error("Unexpected API response structure:", response);
      throw new Error("Invalid API response structure");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch roles";
      console.error("Roles fetch error:", err);
      console.error("Error response:", err?.response);
      setError(message);
      setData(null);
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
