import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import toast from "react-hot-toast";

// ============= TYPES =============

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface CreateRegionPayload {
  name: string;
}

interface UpdateRegionPayload {
  code: string;
  description: string;
  target_amount: number;
  period: string;
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Region mutations (create, update, delete)
 * Uses pessimistic updates: only refetch on success
 * Consistent error handling via toast notifications
 */
export const useRegionMutations = (options?: MutationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new region
  const createRegion = useCallback(
    async (data: CreateRegionPayload) => {
      try {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("name", data.name);

        const response = await http.postData(formData, "/api/admin/regions");

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success(`Region "${data.name}" created successfully`);
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to create region";

        console.error("Create region error:", err);
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

  // Update existing region
  const updateRegion = useCallback(
    async (regionId: string, data: UpdateRegionPayload) => {
      try {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("code", data.code);
        formData.append("description", data.description);
        formData.append("target_amount", data.target_amount.toString());
        // Convert period from "YYYY-MM" to integer "YYYYMM"
        const periodInt = data.period.replace("-", "");
        formData.append("period", periodInt);

        const response = await http.putData(
          formData,
          `/api/admin/regions/${regionId}`
        );

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        toast.success("Region updated successfully");
        options?.onSuccess?.();

        return response.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to update region";

        console.error("Update region error:", err);
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

  // Delete region
  const deleteRegion = useCallback(
    async (regionId: string, regionName: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await http.deleteData(`/api/admin/regions/${regionId}`);

        toast.success(`Region "${regionName}" deleted successfully`);
        options?.onSuccess?.();
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to delete region";

        console.error("Delete region error:", err);
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
    createRegion,
    updateRegion,
    deleteRegion,

    // State
    isLoading,
    error,
  };
};
