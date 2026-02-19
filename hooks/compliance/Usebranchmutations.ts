import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { toast } from "sonner";

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

/** Extracts a user-friendly message from an Axios error, never exposing raw status codes. */
function extractErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  // Try all common API error fields first
  const apiMessage =
    data?.message ||
    data?.Message ||
    data?.userMessage ||
    data?.detail ||
    data?.error ||
    data?.title ||
    (data?.errors ? Object.values(data.errors)?.[0]?.[0] : null) ||
    data?.validationMessages?.[0];

  if (apiMessage) return String(apiMessage);

  // Suppress Axios "Request failed with status code XXX" — not user-friendly
  const rawMsg: string = err?.message ?? "";
  if (/request failed with status code/i.test(rawMsg)) return fallback;
  if (!rawMsg) return fallback;
  return rawMsg;
}

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
        const message = extractErrorMessage(err, "Failed to create branch");

        console.error("Create branch error:", err);
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

  // Update existing branch
  const updateBranch = useCallback(
    async (branchId: string, data: UpdateBranchPayload) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await http.patchDataJson(
          data,
          `/api/admin/branches/${branchId}`,
        );

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("Branch updated successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message = extractErrorMessage(err, "Failed to update branch");

        console.error("Update branch error:", err);
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
        const message = extractErrorMessage(err, "Failed to delete branch");

        console.error("Delete branch error:", err);
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
    createBranch,
    updateBranch,
    deleteBranch,

    // State
    isLoading,
    error,
  };
};
