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

        console.log("Form data received:", JSON.stringify(data, null, 2));

        // Build payload according to API requirements
        // API requires either region_id, branch_id or organizational_level='hq'
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

        // Add organizational fields based on level
        if (data.organizational_level === "hq") {
          payload.organization_level = "hq";
        } else if (data.organizational_level === "region") {
          // For regional users: only region_id is needed
          if (!data.region_id) {
            throw new Error("Region is required for regional users");
          }
          payload.region_id = data.region_id;
        } else if (data.organizational_level === "branch") {
          // For branch users: both region_id and branch_id are needed
          if (!data.region_id || !data.branch_id) {
            throw new Error("Region and branch are required for branch users");
          }
          payload.region_id = data.region_id;
          payload.branch_id = data.branch_id;
        } else {
          throw new Error("Please select an organizational level");
        }

        console.log(
          "Creating user with payload:",
          JSON.stringify(payload, null, 2),
        );

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
    [options],
  );

  // Edit existing user
  const editUser = useCallback(
    async (userId: string, data: UserFormData) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Edit form data received:", JSON.stringify(data, null, 2));

        // Build payload according to API requirements
        const payload: any = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
        };

        // Add optional fields
        if (data.department) {
          payload.department = data.department;
        }

        // Add organizational fields based on level
        if (data.organizational_level === "hq") {
          payload.organization_level = "hq";
        } else if (data.organizational_level === "region") {
          // For regional users: only region_id is needed
          if (!data.region_id) {
            throw new Error("Region is required for regional users");
          }
          payload.region_id = data.region_id;
        } else if (data.organizational_level === "branch") {
          // For branch users: both region_id and branch_id are needed
          if (!data.region_id || !data.branch_id) {
            throw new Error("Region and branch are required for branch users");
          }
          payload.region_id = data.region_id;
          payload.branch_id = data.branch_id;
        } else if (data.organizational_level) {
          throw new Error("Please select a valid organizational level");
        }

        console.log(
          "Updating user with payload:",
          JSON.stringify(payload, null, 2),
        );

        const response = await http.patchDataJson(
          payload,
          `/api/admin/users/${userId}`,
        );

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("User updated successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        // Extract error message from API response
        let message = "Failed to update user";

        if (err?.response?.data?.non_field_errors) {
          message = err.response.data.non_field_errors.join(", ");
        } else if (err?.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.message) {
          message = err.message;
        }

        console.error("Edit user error:", err);
        setError(message);
        toast.error(message);
        options?.onError?.(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options],
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
    [options],
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
