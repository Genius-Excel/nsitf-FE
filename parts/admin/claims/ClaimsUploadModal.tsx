"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

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

interface ClaimsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  progress: UploadProgress;
}

/**
 * Claims Upload Modal - Refactored Version
 *
 * Changes from original:
 * - REMOVED: Region selector (server determines from auth token)
 * - REMOVED: Client-side Excel processing logic (moved to hook)
 * - ADDED: Integration with useClaimsUpload hook
 * - ADDED: Progress tracking from hook
 *
 * The modal now only handles:
 * - File selection UI
 * - Template download
 * - Display progress/errors from hook
 */
export const ClaimsUploadModal: React.FC<ClaimsUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  progress,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // Reset file when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
    }
  }, [isOpen]);

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Claim ID": "CLM-00001",
        Employer: "Example Company Ltd",
        Claimant: "John Doe",
        Type: "Medical Refund",
        "Amount Requested": "250000",
        "Amount Paid": "200000",
        Status: "Paid",
        "Date Processed": "2024-01-15",
        "Date Paid": "2024-01-20",
        Sector: "Manufacturing",
        Class: "Class A",
        "Payment Period": "2024-01-01",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 12 }, // Claim ID
      { wch: 25 }, // Employer
      { wch: 20 }, // Claimant
      { wch: 18 }, // Type
      { wch: 18 }, // Amount Requested
      { wch: 15 }, // Amount Paid
      { wch: 15 }, // Status
      { wch: 15 }, // Date Processed
      { wch: 12 }, // Date Paid
      { wch: 15 }, // Sector
      { wch: 10 }, // Class
      { wch: 15 }, // Payment Period
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Claims Template");

    XLSX.writeFile(wb, `NSITF_Claims_Template.xlsx`);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    await onUpload(file);
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  const isProcessing =
    progress.stage === "validating" || progress.stage === "uploading";
  const isComplete = progress.stage === "complete";
  const hasError = progress.stage === "error";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Upload Claims Data
              </h2>
            </div>
            <button
              aria-label="Close"
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Info Banner - Region Auto-Determined */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    Your regional office will be automatically detected based on
                    your account. The uploaded claims will be assigned to your
                    region.
                  </p>
                </div>
              </div>
            </div>

            {/* Download Template */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Download Template
                  </p>
                  <p className="text-xs text-green-700">
                    Use the NSITF standard template with all required columns
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => {
                  if (!isProcessing) {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${
                    isDragging
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileSelect(e.target.files[0])
                  }
                  className="hidden"
                  disabled={isProcessing}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">Excel or CSV files only</p>
                {file && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {progress.stage !== "idle" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {progress.message}
                  </span>
                  <span className="text-gray-600">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-300 ${
                      hasError ? "bg-red-600" : "bg-green-600"
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {isComplete && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{progress.message}</span>
                  </div>
                )}

                {hasError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{progress.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isComplete ? "Close" : "Cancel"}
            </button>
            {!isComplete && (
              <button
                onClick={handleUpload}
                disabled={!file || isProcessing}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
              >
                {isProcessing ? "Processing..." : "Upload & Validate"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
