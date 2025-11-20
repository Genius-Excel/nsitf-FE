import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import toast from "react-hot-toast";

// ============= TYPES =============

interface UploadProgress {
  stage: "idle" | "uploading" | "processing" | "complete" | "error";
  percentage: number;
  message: string;
}

interface UploadOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UploadResponse {
  batch_id: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  errors_sample?: Array<{
    sheet: string;
    row: number;
    column: string;
    message: string;
  }>;
  processing_summary?: Record<string, any>;
}

// ============= HOOK =============

const http = new HttpService();

/**
 * Handle regional report uploads with progress tracking
 * Server-side processing with client-side progress visualization
 */
export const useReportUpload = (options?: UploadOptions) => {
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "idle",
    percentage: 0,
    message: "",
  });
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(
    null
  );

  const uploadReport = useCallback(
    async (file: File, regionId: string, period: string) => {
      try {
        // Stage 1: Uploading (0-50%)
        setProgress({
          stage: "uploading",
          percentage: 10,
          message: "Uploading file...",
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("region_id", regionId);
        formData.append("period", period);

        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setProgress((prev) => ({
            ...prev,
            percentage: Math.min(prev.percentage + 10, 40),
          }));
        }, 200);

        const response = await http.postData(formData, "/api/regions/reports");

        clearInterval(uploadInterval);

        // Stage 2: Processing (50-90%)
        setProgress({
          stage: "processing",
          percentage: 60,
          message: "Processing data...",
        });

        // Simulate processing progress
        const processInterval = setInterval(() => {
          setProgress((prev) => ({
            ...prev,
            percentage: Math.min(prev.percentage + 10, 90),
          }));
        }, 300);

        // Wait a bit to show processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        clearInterval(processInterval);

        if (!response?.data) {
          throw new Error("Invalid API response");
        }

        const uploadData = response.data as UploadResponse;
        setUploadResponse(uploadData);

        // Stage 3: Complete (100%)
        setProgress({
          stage: "complete",
          percentage: 100,
          message: `Upload complete! Processed ${uploadData.total_rows} rows (${uploadData.valid_rows} valid, ${uploadData.invalid_rows} errors)`,
        });

        // Show appropriate toast based on status
        if (uploadData.status === "completed_with_errors") {
          toast.success(
            `Upload complete with ${uploadData.invalid_rows} validation errors. Review errors before continuing.`,
            { duration: 5000 }
          );
        } else if (uploadData.status === "completed") {
          toast.success(
            `Successfully uploaded ${uploadData.valid_rows} records!`
          );
        } else {
          toast(`Upload status: ${uploadData.status}`, {
            icon: "⚠️",
          });
        }

        options?.onSuccess?.();

        return uploadData;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to upload report";

        console.error("Report upload error:", err);

        setProgress({
          stage: "error",
          percentage: 0,
          message: "Upload failed",
        });

        toast.error(message);
        options?.onError?.(message);

        throw err;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setProgress({
      stage: "idle",
      percentage: 0,
      message: "",
    });
    setUploadResponse(null);
  }, []);

  return {
    // Upload function
    uploadReport,
    reset,

    // State
    progress,
    uploadResponse,
    isUploading:
      progress.stage === "uploading" || progress.stage === "processing",
  };
};
