import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";
import * as XLSX from "xlsx";
import { ClaimsUploadResponse } from "@/lib/types/claims";

const http = new HttpService();

interface UploadProgress {
  stage: "idle" | "validating" | "uploading" | "complete" | "error";
  percentage: number;
  message: string;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

interface UseClaimsUploadParams {
  onSuccess?: (uploadedCount: number, region: string) => void;
  onError?: (error: string) => void;
}

interface UseClaimsUploadReturn {
  uploadClaims: (file: File) => Promise<void>;
  progress: UploadProgress;
  errors: ValidationError[];
  successCount: number;
  uploadedRegion: string | null;
  reset: () => void;
}

const REQUIRED_COLUMNS = [
  "Claim ID",
  "Employer",
  "Claimant",
  "Type",
  "Amount Requested",
  "Amount Paid",
  "Status",
  "Date Processed",
];

const VALID_STATUSES = ["Paid", "Pending", "Under Review", "Rejected"];
const VALID_TYPES = [
  "Medical Refund",
  "Disability",
  "Death Claim",
  "Loss of Productivity",
];

/**
 * Handles claims file upload with client-side validation + server-side parsing
 * Region is automatically determined by the server from auth token
 *
 * @param params.onSuccess - Callback on successful upload
 * @param params.onError - Callback on error
 *
 * @returns Upload function, progress state, and validation errors
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
  params: UseClaimsUploadParams = {}
): UseClaimsUploadReturn => {
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "idle",
    percentage: 0,
    message: "",
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadedRegion, setUploadedRegion] = useState<string | null>(null);

  const validateRow = useCallback(
    (row: any, rowIndex: number): ValidationError[] => {
      const rowErrors: ValidationError[] = [];

      // Check required fields
      REQUIRED_COLUMNS.forEach((column) => {
        const value = row[column];
        if (value === undefined || value === null || value === "") {
          rowErrors.push({
            row: rowIndex + 2, // +2 because Excel is 1-indexed and has header row
            column,
            message: "Missing required field",
            value: String(value || ""),
          });
        }
      });

      // Validate status
      if (row["Status"]) {
        const status = String(row["Status"]);
        if (!VALID_STATUSES.includes(status)) {
          rowErrors.push({
            row: rowIndex + 2,
            column: "Status",
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(
              ", "
            )}`,
            value: status,
          });
        }
      }

      // Validate type
      if (row["Type"]) {
        const type = String(row["Type"]);
        if (!VALID_TYPES.includes(type)) {
          rowErrors.push({
            row: rowIndex + 2,
            column: "Type",
            message: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
            value: type,
          });
        }
      }

      // Validate amounts are positive numbers
      ["Amount Requested", "Amount Paid"].forEach((column) => {
        if (
          row[column] !== undefined &&
          row[column] !== null &&
          row[column] !== ""
        ) {
          const numValue = Number(row[column]);
          if (isNaN(numValue)) {
            rowErrors.push({
              row: rowIndex + 2,
              column,
              message: `Expected number, got "${row[column]}"`,
              value: String(row[column]),
            });
          } else if (numValue < 0) {
            rowErrors.push({
              row: rowIndex + 2,
              column,
              message: "Value must be positive",
              value: String(row[column]),
            });
          }
        }
      });

      return rowErrors;
    },
    []
  );

  const uploadClaims = useCallback(
    async (file: File) => {
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

      // Reset state
      setErrors([]);
      setSuccessCount(0);
      setUploadedRegion(null);

      try {
        // ==========================================
        // STEP 1: CLIENT-SIDE VALIDATION (UX Enhancement)
        // ==========================================
        setProgress({
          stage: "validating",
          percentage: 10,
          message: "Reading and validating file...",
        });

        const data = await file.arrayBuffer();
        await new Promise((resolve) => setTimeout(resolve, 300));

        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          throw new Error("The file contains no data rows");
        }

        setProgress({
          stage: "validating",
          percentage: 30,
          message: `Validating ${jsonData.length} rows...`,
        });

        // Validate all rows
        const allErrors: ValidationError[] = [];
        jsonData.forEach((row: any, index: number) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) {
            allErrors.push(...rowErrors);
          }

          // Update progress
          const validationProgress = 30 + ((index + 1) / jsonData.length) * 20;
          setProgress({
            stage: "validating",
            percentage: validationProgress,
            message: `Validating row ${index + 1} of ${jsonData.length}...`,
          });
        });

        // If validation errors, stop here
        if (allErrors.length > 0) {
          setErrors(allErrors);
          setProgress({
            stage: "error",
            percentage: 100,
            message: `Validation failed with ${allErrors.length} error(s)`,
          });
          params.onError?.(`Found ${allErrors.length} validation errors`);
          return;
        }

        // ==========================================
        // STEP 2: SERVER-SIDE UPLOAD & PARSING
        // ==========================================
        setProgress({
          stage: "uploading",
          percentage: 60,
          message: "Uploading to server...",
        });

        const formData = new FormData();
        formData.append("file", file);

        const response = await http.postData(
          formData,
          "/api/claims/upload-claims-report"
        );

        if (!response?.data) {
          throw new Error("No response from server");
        }

        const uploadData = response.data as ClaimsUploadResponse;

        // ==========================================
        // STEP 3: SUCCESS
        // ==========================================
        setProgress({
          stage: "complete",
          percentage: 100,
          message: `Successfully uploaded ${uploadData.uploaded_records} records to ${uploadData.region}`,
        });

        setSuccessCount(uploadData.uploaded_records);
        setUploadedRegion(uploadData.region);

        params.onSuccess?.(uploadData.uploaded_records, uploadData.region);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to upload claims file";
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
        params.onError?.(errorMessage);
        console.error("Error uploading claims:", err);
      }
    },
    [validateRow, params]
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
