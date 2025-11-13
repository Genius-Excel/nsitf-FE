"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Claim } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ClaimsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: Claim[]) => void;
}

interface ParseProgress {
  stage: "idle" | "reading" | "parsing" | "validating" | "complete" | "error";
  percentage: number;
  message: string;
}

interface UploadError {
  row: number;
  column: string;
  message: string;
  value?: string;
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
const VALID_TYPES = ["Medical Refund", "Disability", "Death Claim", "Loss of Productivity"];

export const ClaimsUploadModal: React.FC<ClaimsUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<ParseProgress>({
    stage: "idle",
    percentage: 0,
    message: "",
  });
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const validateRow = (row: any, rowIndex: number): UploadError[] => {
    const rowErrors: UploadError[] = [];

    REQUIRED_COLUMNS.forEach((column) => {
      const value = row[column];
      if (value === undefined || value === null || value === "") {
        rowErrors.push({
          row: rowIndex + 2,
          column,
          message: `Missing required field`,
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
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          value: String(row["Status"]),
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
          value: String(row["Type"]),
        });
      }
    }

    // Validate amounts are numbers
    ["Amount Requested", "Amount Paid"].forEach((column) => {
      if (row[column] !== undefined && row[column] !== null && row[column] !== "") {
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
            message: `Value must be positive`,
            value: String(row[column]),
          });
        }
      }
    });

    return rowErrors;
  };

  const processFile = async () => {
    if (!file) {
      setErrors([
        {
          row: 0,
          column: "System",
          message: "Please upload a file",
        },
      ]);
      return;
    }

    setErrors([]);
    setSuccessCount(0);

    try {
      setProgress({
        stage: "reading",
        percentage: 10,
        message: "Reading file...",
      });

      const data = await file.arrayBuffer();
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress({
        stage: "parsing",
        percentage: 30,
        message: "Parsing spreadsheet data...",
      });

      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (jsonData.length === 0) {
        throw new Error("The file contains no data rows.");
      }

      setProgress({
        stage: "validating",
        percentage: 50,
        message: "Validating data...",
      });

      const allErrors: UploadError[] = [];
      const validRows: Claim[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowErrors = validateRow(row, index);
        if (rowErrors.length > 0) {
          allErrors.push(...rowErrors);
        } else {
          validRows.push({
            claimId: String(row["Claim ID"]),
            employer: String(row["Employer"]),
            claimant: String(row["Claimant"]),
            type: String(row["Type"]),
            amountRequested: Number(row["Amount Requested"]),
            amountPaid: Number(row["Amount Paid"]),
            status: String(row["Status"]) as "Paid" | "Pending" | "Under Review" | "Rejected",
            dateProcessed: String(row["Date Processed"]),
            datePaid: row["Date Paid"] ? String(row["Date Paid"]) : undefined,
            sector: row["Sector"] ? String(row["Sector"]) : undefined,
            class: row["Class"] ? String(row["Class"]) : undefined,
            date: row["Payment Period"] ? String(row["Payment Period"]) : undefined,
          });
        }

        const validationProgress = 50 + ((index + 1) / jsonData.length) * 40;
        setProgress({
          stage: "validating",
          percentage: validationProgress,
          message: `Validating row ${index + 1} of ${jsonData.length}...`,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (allErrors.length > 0) {
        setErrors(allErrors);
        setProgress({
          stage: "error",
          percentage: 100,
          message: `Validation failed with ${allErrors.length} error(s)`,
        });
        return;
      }

      setProgress({
        stage: "complete",
        percentage: 100,
        message: `Successfully validated ${validRows.length} row(s)`,
      });
      setSuccessCount(validRows.length);

      onUploadSuccess(validRows);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setErrors([
        {
          row: 0,
          column: "System",
          message: error.message || "Failed to process file.",
        },
      ]);
      setProgress({
        stage: "error",
        percentage: 100,
        message: "Processing failed",
      });
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Claim ID": "",
        "Employer": "",
        "Claimant": "",
        "Type": "Medical Refund",
        "Amount Requested": "",
        "Amount Paid": "",
        "Status": "Pending",
        "Date Processed": "",
        "Date Paid": "",
        "Sector": "",
        "Class": "",
        "Payment Period": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, `Claims_Template.xlsx`);
  };

  const handleClose = () => {
    setFile(null);
    setErrors([]);
    setProgress({ stage: "idle", percentage: 0, message: "" });
    setSuccessCount(0);
    onClose();
  };

  if (!isOpen) return null;

  const isProcessing =
    progress.stage === "reading" ||
    progress.stage === "parsing" ||
    progress.stage === "validating";

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Upload Claims Data
              </h2>
            </div>
            <button
              aria-label="cancel"
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-sm text-green-800">
                  Download the template for claims data
                </span>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

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
                    e.target.files?.[0] && setFile(e.target.files[0])
                  }
                  className="hidden"
                  disabled={isProcessing}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">Excel or CSV files only</p>
              </div>
            </div>

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
                    className="bg-green-600 h-2 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {progress.stage === "complete" && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Processing complete! Uploaded {successCount} records.
                    </span>
                  </div>
                )}
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-2">
                      Found {errors.length} validation error(s):
                    </p>
                    <ul className="space-y-1 text-sm text-red-700">
                      {errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="font-mono">
                          {error.row > 0
                            ? `Row ${error.row}, Column "${error.column}": ${error.message}`
                            : `${error.column}: ${error.message}`}
                        </li>
                      ))}
                      {errors.length > 10 && (
                        <li className="text-gray-600 italic">
                          ... and {errors.length - 10} more error(s)
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={processFile}
              disabled={!file || isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Upload & Validate"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
