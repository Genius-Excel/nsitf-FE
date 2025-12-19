// ============================================================================
// Investment Upload Modal Component
// ============================================================================
// Modal for uploading Excel/CSV files for investment records
// ============================================================================

import React, { useState } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadInvestmentRecords } from "@/services/investment";
import { toast } from "sonner";

interface InvestmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvestmentUploadModal: React.FC<InvestmentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [period, setPeriod] = useState<string>(() => {
    // Default to current month-year in YYYY-MM format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid Excel or CSV file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setErrorMessage("");
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!period) {
      toast.error("Please select a period (YYYY-MM format)");
      return;
    }

    // Validate period format
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      toast.error("Period must be in YYYY-MM format (e.g., 2025-02)");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      setUploadProgress(30);

      const response = await uploadInvestmentRecords({
        file: selectedFile,
        period,
      });

      setUploadProgress(100);

      if (response.success) {
        setUploadStatus("success");
        toast.success(
          response.message || "Successfully uploaded investment records"
        );
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        setUploadStatus("error");
        const errorMsg = response.error_report
          ? JSON.stringify(response.error_report)
          : "Upload failed. Please try again.";
        setErrorMessage(errorMsg);
        toast.error("Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(
        error.response?.data?.message || "An error occurred during upload"
      );
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      handleRemoveFile();
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Investment Records</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file containing investment and treasury data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Excel (.xlsx, .xls) or CSV files (max 10MB)
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              {/* File Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-10 h-10 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                {!uploading && uploadStatus === "idle" && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-600 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Success State */}
              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">Upload successful!</p>
                </div>
              )}

              {/* Error State */}
              {uploadStatus === "error" && (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Upload failed</p>
                    {errorMessage && (
                      <p className="text-xs text-red-500 mt-1">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Period Input */}
          <div className="space-y-2">
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-700"
            >
              Reporting Period (YYYY-MM) <span className="text-red-500">*</span>
            </label>
            <input
              id="period"
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2025-02"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500">
              Enter the reporting period in YYYY-MM format (e.g., 2025-02)
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-900 mb-1">
              Upload Instructions:
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Excel or CSV format with correct column headers</li>
              <li>
                Required columns: Month, Private Sector, Public Treasury, etc.
              </li>
              <li>Numeric values only (no currency symbols)</li>
              <li>Period must be in YYYY-MM format (e.g., 2025-02)</li>
              <li>Sheet type is automatically set to INVESTMENTS</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !selectedFile || uploading || uploadStatus === "success"
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
