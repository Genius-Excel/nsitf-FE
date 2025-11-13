"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { LegalCase } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface LegalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: LegalCase[]) => void;
  regions: string[];
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
  "Title",
  "Description",
  "Created",
  "Filed",
  "Amount Claimed",
  "Status",
];

const COLUMN_TYPES: Record<string, "string" | "number"> = {
  Title: "string",
  Description: "string",
  Created: "string",
  Filed: "string",
  "Amount Claimed": "string",
  Status: "string",
  "Next Hearing": "string",
  Outcome: "string",
};

const VALID_STATUSES = ["pending", "closed", "assigned-obtained"];

export const LegalUploadModal: React.FC<LegalUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  regions,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
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
      const status = String(row["Status"]).toLowerCase();
      if (!VALID_STATUSES.includes(status)) {
        rowErrors.push({
          row: rowIndex + 2,
          column: "Status",
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          value: String(row["Status"]),
        });
      }
    }

    return rowErrors;
  };

  const processFile = async () => {
    if (!file || !selectedRegion) {
      setErrors([
        {
          row: 0,
          column: "System",
          message: "Please select a region and upload a file",
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
      const validRows: LegalCase[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowErrors = validateRow(row, index);
        if (rowErrors.length > 0) {
          allErrors.push(...rowErrors);
        } else {
          validRows.push({
            id: generateId(),
            title: String(row["Title"]),
            description: String(row["Description"]),
            created: String(row["Created"]),
            filed: String(row["Filed"]),
            amountClaimed: String(row["Amount Claimed"]),
            nextHearing: row["Next Hearing"] ? String(row["Next Hearing"]) : "",
            status: String(row["Status"]).toLowerCase() as "pending" | "closed" | "assigned-obtained",
            outcome: row["Outcome"] ? String(row["Outcome"]) : undefined,
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
        Title: "",
        Description: "",
        Created: "",
        Filed: "",
        "Amount Claimed": "",
        "Next Hearing": "",
        Status: "pending",
        Outcome: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const regionName = selectedRegion || "All_Regions";
    XLSX.writeFile(wb, `${regionName}_Legal_Cases_Template.xlsx`);
  };

  const handleClose = () => {
    setSelectedRegion("");
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
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Upload Legal Cases
              </h2>
            </div>
            <button
              aria-label="cancel"
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Region <span className="text-red-500">*</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="">Choose a region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedRegion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm text-blue-800">
                    Download the template for {selectedRegion}
                  </span>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => {
                  if (selectedRegion && !isProcessing) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  ${
                    !selectedRegion || isProcessing
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
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
                  disabled={!selectedRegion || isProcessing}
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
                    className="bg-blue-600 h-2 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {progress.stage === "complete" && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
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
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={processFile}
              disabled={!file || !selectedRegion || isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Upload & Validate"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
