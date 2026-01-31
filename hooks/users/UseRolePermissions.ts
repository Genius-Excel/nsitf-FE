import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { PermissionItem } from "@/lib/types/permissions";

// ============= TYPES =============

export interface RolePermissionsResponse {
  message: string;
  data: {
    role: string;
    role_name: string;
    permissions: string[]; // Array of permission names
  };
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Fetch default permissions for a specific role
 * Does not auto-fetch on mount - call fetchRolePermissions manually when needed
 */
export const useRolePermissions = () => {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRolePermissions = useCallback(async (roleId: string) => {
    if (!roleId) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch role details with permissions
      const response = await http.getData(`/api/admin/roles/${roleId}`);

      // API returns: { message, data: { role_id, role_name, permissions: string[] } }
      if (!response?.data?.data) {
        throw new Error("Invalid API response structure");
      }

      const apiData = response.data as RolePermissionsResponse;

      // Return array of permission names that come with this role
      setData(apiData.data.permissions || []);
    } catch (err: any) {
      // If 404, the endpoint doesn't exist - set empty array without showing error
      if (err?.response?.status === 404) {
        console.warn("Role permissions endpoint not available yet.");
        setData([]);
        setError(null); // Don't show error for missing endpoint
      } else {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch role permissions";
        console.error("Role permissions fetch error:", err);
        setError(message);
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRolePermissions = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchRolePermissions,
    clearRolePermissions,
  };
};
