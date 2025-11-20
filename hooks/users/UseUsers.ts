import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";

// ============= TYPES =============

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  account_status: "active" | "inactive";
  department: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  message: string;
  data: User[];
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Main hook for fetching all users
 * Follows dashboard pattern: single source of truth, no local state duplication
 */
export const useUsers = () => {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await http.getData("/api/admin/users");

      // API returns flat structure: { message, data: User[] }
      if (!response?.data?.data) {
        throw new Error("Invalid API response structure");
      }

      const apiData = response.data as UsersResponse;
      setData(apiData.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to fetch users";
      console.error("Users fetch error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    loading,
    error,
    refetch: fetchUsers,
  };
};
