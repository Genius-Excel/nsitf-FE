import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import toast from "react-hot-toast";

// ============= TYPES =============

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface CreateBranchPayload {
  name: string;
  region_id: string;
  code?: string;
}

interface UpdateBranchPayload {
  name?: string;
  code?: string;
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Branch mutations (create, update, delete)
 * Uses pessimistic updates: only refetch on success
 * Consistent error handling via toast notifications
 */
export const useBranchMutations = (options?: MutationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new branch
  const createBranch = useCallback(
    async (data: CreateBranchPayload) => {
      try {
        setIsLoading(true);
        setError(null);

        const payload: any = {
          name: data.name,
          region_id: data.region_id,
        };

        if (data.code) {
          payload.code = data.code;
        }

        const response = await http.postData(payload, "/api/admin/branches");

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success(`Branch "${data.name}" created successfully`);
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to create branch";

        console.error("Create branch error:", err);
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

  // Update existing branch
  const updateBranch = useCallback(
    async (branchId: string, data: UpdateBranchPayload) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await http.patchDataJson(
          data,
          `/api/admin/branches/${branchId}`
        );

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("Branch updated successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to update branch";

        console.error("Update branch error:", err);
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

  // Delete branch
  const deleteBranch = useCallback(
    async (branchId: string, branchName: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await http.deleteData(`/api/admin/branches/${branchId}`);

        toast.success(`Branch "${branchName}" deleted successfully`);
        options?.onSuccess?.();
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to delete branch";

        console.error("Delete branch error:", err);
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
    createBranch,
    updateBranch,
    deleteBranch,

    // State
    isLoading,
    error,
  };
};
