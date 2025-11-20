import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import toast from "react-hot-toast";
import { UserFormData } from "./UseUserForm";

// ============= TYPES =============

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface AddUserPayload extends UserFormData {
  password: string;
}

interface EditUserPayload extends UserFormData {
  id: string;
}

// ============= HOOK =============

const http = new HttpService();

/**
 * User mutations (add, edit, delete)
 * Uses pessimistic updates: only refetch on success
 * Consistent error handling via toast notifications
 */
export const useUserMutations = (options?: MutationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add new user
  const addUser = useCallback(
    async (data: UserFormData) => {
      try {
        setIsLoading(true);
        setError(null);

        const payload: AddUserPayload = {
          ...data,
          password: "Nstif@12345", // Default password
        };

        const response = await http.postData(payload, "/api/admin/users");

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("User created successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to create user";

        console.error("Add user error:", err);
        setError(message);
        toast.error(message);
        options?.onError?.(message);

        throw err; // Re-throw for component to handle
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  // Edit existing user
  const editUser = useCallback(
    async (userId: string, data: UserFormData) => {
      try {
        setIsLoading(true);
        setError(null);

        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          department: data.department,
          region: data.region,
        };

        const response = await http.patchDataJson(
          payload,
          `/api/admin/users/${userId}`
        );

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("User updated successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to update user";

        console.error("Edit user error:", err);
        setError(message);
        toast.error(message);
        options?.onError?.(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: string, userName: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await http.deleteData(`/api/admin/users/${userId}`);

        toast.success(`User ${userName} deleted successfully`);
        options?.onSuccess?.();
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to delete user";

        console.error("Delete user error:", err);
        setError(message);
        toast.error(message);
        options?.onError?.(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    // Mutations
    addUser,
    editUser,
    deleteUser,

    // State
    isLoading,
    error,
  };
};
