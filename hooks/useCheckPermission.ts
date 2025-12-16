import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { getUserFromStorage } from "@/lib/auth";
import { rolePermissions, hasPermission } from "@/lib/permissions";

export interface UseCheckPermissionReturn {
  canView: boolean;
  canManage: boolean;
  loading: boolean;
  error: string | null;
}

const httpService = new HttpService();

/**
 * Hook to check if a user has view and/or manage permissions for a specific module
 * Falls back to role-based permissions if backend permissions not available
 */
export function useCheckPermission(module: string): UseCheckPermissionReturn {
  const [canView, setCanView] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = getUserFromStorage();
        if (!user) {
          setCanView(false);
          setCanManage(false);
          setLoading(false);
          return;
        }

        // Normalize role to match rolePermissions keys (case-insensitive)
        const normalizedRole = (user.role || "").toLowerCase();

        // Check view and manage permissions based on role
        const viewPerm = `view_${module}`;
        const managePerm = `manage_${module}`;

        const userCanView = hasPermission(
          normalizedRole as any,
          viewPerm,
          user.permissions
        );
        const userCanManage = hasPermission(
          normalizedRole as any,
          managePerm,
          user.permissions
        );

        setCanView(userCanView);
        setCanManage(userCanManage);
      } catch (err: any) {
        const message = err?.message || "Failed to check permissions";
        console.error("Error checking permissions:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [module]);

  return { canView, canManage, loading, error };
}
