import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { getUserFromStorage } from "@/lib/auth";

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
}

export interface UseUserPermissionsReturn {
  permissions: string[]; // Array of permission names/ids
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const httpService = new HttpService();

/**
 * Hook to fetch and manage user permissions from the backend
 * Permissions are stored by the user's ID and can be checked using the helper methods
 */
export function useUserPermissions(): UseUserPermissionsReturn {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = getUserFromStorage();
      if (!user || !user.user_id) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      // Fetch permissions for the current user
      const response = await httpService.getData(
        `/api/admin/users/${user.user_id}/permissions`
      );

      // Extract permission names/ids from the response
      const permissionList = response.data?.permissions || [];
      setPermissions(permissionList);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch permissions";
      console.error("Error fetching permissions:", message);
      setError(message);
      setPermissions([]); // Reset permissions on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((perm) => permissions.includes(perm));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((perm) => permissions.includes(perm));
    },
    [permissions]
  );

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    error,
    refetch: fetchPermissions,
  };
}
