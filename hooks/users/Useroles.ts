import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface Role {
  id: string;
  name: string;
  roleName: string;
  description?: string;
}

// API returns this structure
interface RoleApiResponse {
  role_id: string; // UUID identifier for the role
  role_name: string; // This is the system/code name
  display_name: string; // This is what we show to users
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
 *
 * Note: The API returns 'role_id' (UUID) which we map to 'id'
 * When creating/editing users, send this UUID in the 'role' field
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

      // Helper function to transform API response to our format
      // The 'role_id' field from API (UUID) becomes 'id' for dropdown consistency
      const transformRole = (apiRole: RoleApiResponse): Role => {
        // Ensure we have a valid role identifier (UUID)
        const roleId = apiRole.role_id || apiRole.role_name;

        if (!roleId) {
          console.warn(
            "Role API response missing both 'role_id' and 'role_name':",
            apiRole,
          );
        }

        return {
          id: roleId, // Use role_id (UUID) as the unique identifier
          name: apiRole.display_name || apiRole.role_name, // Display name for UI
          roleName: apiRole.role_name, // Keep original role_name
          description: apiRole.description || "",
        };
      };

      // Try different response structures
      // Structure 1: { message, data: RoleApiResponse[] }
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const apiData = response.data as RolesResponse;
        const transformedRoles = apiData.data
          .map(transformRole)
          .filter((role) => role.id);
        console.log("Roles loaded (Structure 1):", transformedRoles);
        setData(transformedRoles);
        return;
      }

      // Structure 2: Direct array of RoleApiResponse
      if (Array.isArray(response?.data)) {
        const transformedRoles = response.data
          .map(transformRole)
          .filter((role) => role.id);
        console.log("Roles loaded (Structure 2):", transformedRoles);
        setData(transformedRoles);
        return;
      }

      // Structure 3: { data: RoleApiResponse[] } without message
      if (response?.data && !response.data.data) {
        // This might be a single object or needs different handling
        const transformedRole = transformRole(response.data);
        if (transformedRole.id) {
          console.log("Roles loaded (Structure 3):", [transformedRole]);
          setData([transformedRole]);
          return;
        }
      }

      console.error("Unexpected API response structure:", response);
      throw new Error("Invalid API response structure");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to fetch roles";
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
