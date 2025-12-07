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

        // Build payload according to API requirements
        // API requires either region_id, branch_id or organization_level='hq'
        const payload: any = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          password: "Nstif@12345", // Default password
        };

        // Add optional fields
        if (data.department) {
          payload.department = data.department;
        }

        // For now, set organization_level to 'hq' as default
        // TODO: Update form to collect region_id or branch_id instead of region name
        payload.organization_level = 'hq';

        const response = await http.postData(payload, "/api/admin/users");

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("User created successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        // Extract error message from API response
        let message = "Failed to create user";

        if (err?.response?.data?.non_field_errors) {
          message = err.response.data.non_field_errors.join(", ");
        } else if (err?.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.message) {
          message = err.message;
        }

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
