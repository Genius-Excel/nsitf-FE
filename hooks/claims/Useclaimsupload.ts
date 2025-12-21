import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { ClaimsUploadResponse } from "@/lib/types/claims";

const http = new HttpService();

interface UploadProgress {
  stage: "idle" | "uploading" | "complete" | "error";
  percentage: number;
  message: string;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

interface UseClaimsUploadCallbacks {
  onSuccess?: (uploadedCount: number, region: string) => void;
  onError?: (error: string) => void;
}

interface UseClaimsUploadParams {
  regionId: string;
  branchId: string;
  period: string;
  sheet?: string;
}

interface UseClaimsUploadReturn {
  uploadClaims: (file: File, params: UseClaimsUploadParams) => Promise<void>;
  progress: UploadProgress;
  errors: ValidationError[];
  successCount: number;
  uploadedRegion: string | null;
  reset: () => void;
}

/**
 * Handles claims file upload - validation is done server-side
 * Region is automatically determined by the server from auth token
 *
 * @param params.onSuccess - Callback on successful upload
 * @param params.onError - Callback on error
 *
 * @returns Upload function, progress state, and errors
 *
 * @example
 * ```tsx
 * const { uploadClaims, progress, errors } = useClaimsUpload({
 *   onSuccess: (count, region) => {
 *     toast.success(`Uploaded ${count} claims to ${region}`);
 *     refetch();
 *   }
 * });
 * ```
 */
export const useClaimsUpload = (
  callbacks: UseClaimsUploadCallbacks = {}
): UseClaimsUploadReturn => {
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "idle",
    percentage: 0,
    message: "",
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadedRegion, setUploadedRegion] = useState<string | null>(null);

  const uploadClaims = useCallback(
    async (file: File, params: UseClaimsUploadParams) => {
      if (!file) {
        setErrors([
          {
            row: 0,
            column: "System",
            message: "No file provided",
          },
        ]);
        return;
      }

      if (!params.regionId || !params.branchId || !params.period) {
        setErrors([
          {
            row: 0,
            column: "System",
            message: "Region, branch, and period are required",
          },
        ]);
        return;
      }

      // Reset state
      setErrors([]);
      setSuccessCount(0);
      setUploadedRegion(null);

      try {
        // Upload to server
        setProgress({
          stage: "uploading",
          percentage: 50,
          message: "Uploading to server...",
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("region_id", params.regionId);
        formData.append("branch_id", params.branchId);
        // // Convert period from "YYYY-MM" to integer "YYYYMM"
        // const periodInt = params.period.replace("-", "");
        formData.append("period", params.period);
        formData.append("sheet", params.sheet || "CLAIMS");

        const response = await http.postData(formData, "/api/claims/reports");

        if (!response?.data) {
          throw new Error("No response from server");
        }

        const uploadData = response.data as ClaimsUploadResponse;

        // Success
        setProgress({
          stage: "complete",
          percentage: 100,
          message: `Successfully uploaded ${uploadData.uploaded_records} records to ${uploadData.region}`,
        });

        setSuccessCount(uploadData.uploaded_records);
        setUploadedRegion(uploadData.region);

        callbacks.onSuccess?.(uploadData.uploaded_records, uploadData.region);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err.message ||
          "Failed to upload claims file";
        setErrors([
          {
            row: 0,
            column: "System",
            message: errorMessage,
          },
        ]);
        setProgress({
          stage: "error",
          percentage: 100,
          message: "Upload failed",
        });
        callbacks.onError?.(errorMessage);
        console.error("Error uploading claims:", err);
      }
    },
    [callbacks]
  );

  const reset = useCallback(() => {
    setProgress({ stage: "idle", percentage: 0, message: "" });
    setErrors([]);
    setSuccessCount(0);
    setUploadedRegion(null);
  }, []);

  return {
    uploadClaims,
    progress,
    errors,
    successCount,
    uploadedRegion,
    reset,
  };
};
