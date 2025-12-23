/**
 * Branch Data Upload Form
 *
 * Simple, single-purpose form for branch data officers to upload monthly reports
 */

"use client";

import React, { useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Calendar,
  MapPin,
  Building,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRegions,
  useBranches,
  useFileUpload,
  useUploadForm,
  type ErrorReport,
} from "@/hooks/useBranchData";
import { cn } from "@/lib/utils";

// ============== MONTH PICKER COMPONENT ==============

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Generate last 12 months including current month
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthValue = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    months.push({ value: monthValue, label: monthLabel });
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select reporting month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ============== FILE UPLOAD AREA ==============

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
}

function FileUploadArea({
  file,
  onFileChange,
  disabled,
  error,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (disabled) return;

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith(".xlsx")) {
      onFileChange(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-green-400",
          file ? "border-green-400 bg-green-50" : "",
          error ? "border-red-300 bg-red-50" : ""
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          aria-label="Upload Excel file"
        />

        <div className="space-y-3">
          {file ? (
            <>
              <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <p className="font-medium text-green-800">{file.name}</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Badge variant="outline">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB /{" "}
                    {MAX_FILE_SIZE / (1024 * 1024)} MB
                  </Badge>
                  {file.size > MAX_FILE_SIZE && (
                    <Badge variant="destructive" className="text-xs">
                      File too large!
                    </Badge>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="font-medium text-gray-700">
                  Drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Only .xlsx files are accepted (Max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {file && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFileChange(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          className="w-full"
        >
          Remove File
        </Button>
      )}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ============== MAIN UPLOAD FORM COMPONENT ==============

interface BranchUploadFormProps {
  onUploadSuccess: () => void;
}

export function BranchUploadForm({ onUploadSuccess }: BranchUploadFormProps) {
  // Form state (must be initialized first)
  const { formData, updateField, resetForm, isFormValid } = useUploadForm();

  // Data fetching hooks
  const { regions, loading: regionsLoading } = useRegions();
  const { branches, loading: branchesLoading } = useBranches(formData.regionId);

  // Upload functionality
  const { uploading, uploadFile, uploadError, errorReport } = useFileUpload();

  // Local state for file validation errors
  const [fileError, setFileError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setFileError(null);

    if (!isFormValid()) {
      // Show specific validation errors
      if (!formData.regionId) {
        return; // Select will show its own error
      }
      if (!formData.branchId) {
        return; // Select will show its own error
      }
      if (!formData.period) {
        return; // Select will show its own error
      }
      if (!formData.file) {
        setFileError("Please select a file to upload");
        return;
      }
      return;
    }

    // Validate file type
    if (formData.file && !formData.file.name.toLowerCase().endsWith(".xlsx")) {
      setFileError("Invalid file type. Please upload an Excel file (.xlsx)");
      return;
    }

    // Validate file size (max 10MB)
    if (formData.file && formData.file.size > 10 * 1024 * 1024) {
      setFileError(
        "File size exceeds 10MB limit. Please upload a smaller file."
      );
      return;
    }

    try {
      const success = await uploadFile(formData);
      if (success) {
        setFileError(null);
        resetForm();
        // Small delay to ensure success message is seen before refresh
        setTimeout(() => {
          onUploadSuccess();
        }, 500);
      }
      // If upload fails, errors are already set by the hook
    } catch (error) {
      console.error("Form submission error:", error);
      setFileError("An unexpected error occurred. Please try again.");
    }
  };

  const isFormDisabled = uploading || regionsLoading;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          <span>Submit Monthly Report</span>
        </CardTitle>
        <CardDescription>
          Upload one consolidated workbook containing all branch reports for the
          month. All fields are required before submission.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Region and Branch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="region" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>Region</span>
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.regionId}
                onValueChange={(value) => updateField("regionId", value)}
                disabled={isFormDisabled}
              >
                <SelectTrigger
                  id="region"
                  className={cn(
                    "transition-colors",
                    !formData.regionId
                      ? "border-gray-300"
                      : "border-green-300 bg-green-50"
                  )}
                >
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name} ({region.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {regionsLoading && (
                <p className="text-xs text-gray-500">Loading regions...</p>
              )}
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch" className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span>Branch</span>
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.branchId}
                onValueChange={(value) => updateField("branchId", value)}
                disabled={
                  isFormDisabled || !formData.regionId || branchesLoading
                }
              >
                <SelectTrigger
                  id="branch"
                  className={cn(
                    "transition-colors",
                    !formData.branchId
                      ? "border-gray-300"
                      : "border-green-300 bg-green-50"
                  )}
                >
                  <SelectValue
                    placeholder={
                      !formData.regionId
                        ? "Select region first"
                        : branchesLoading
                        ? "Loading branches..."
                        : "Select your branch"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.regionId &&
                branches.length === 0 &&
                !branchesLoading && (
                  <p className="text-xs text-orange-600">
                    No branches found for this region
                  </p>
                )}
            </div>
          </div>

          {/* Reporting Month */}
          <div className="space-y-2">
            <Label htmlFor="month" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Reporting Month</span>
              <span className="text-red-500">*</span>
            </Label>
            <MonthPicker
              value={formData.period}
              onChange={(value) => updateField("period", value)}
              className={cn(
                "w-full md:w-64 transition-colors",
                !formData.period
                  ? "border-gray-300"
                  : "border-green-300 bg-green-50"
              )}
            />
          </div>

          {/* Template Download */}
          {formData.regionId && formData.branchId && formData.period && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-sm text-green-800">
                  <p className="font-medium">
                    Download template for selected branch
                  </p>
                  <p className="text-xs mt-1">
                    {regions.find((r) => r.id === formData.regionId)?.name} →{" "}
                    {branches.find((b) => b.id === formData.branchId)?.name} (
                    {formData.period})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const templatePath = "/templates/branch_template.xlsx";
                    const branchName =
                      branches.find((b) => b.id === formData.branchId)?.name ||
                      "Branch";
                    const fileName = `${branchName}_Template.xlsx`;
                    const link = document.createElement("a");
                    link.href = templatePath;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-gray-500" />
              <span>Excel Report File</span>
              <span className="text-red-500">*</span>
            </Label>
            <FileUploadArea
              file={formData.file}
              onFileChange={(file) => {
                updateField("file", file);
                setFileError(null); // Clear error when file changes
              }}
              disabled={isFormDisabled}
              error={fileError}
            />
            <p className="text-xs text-gray-500">
              Supported format: Excel (.xlsx) • Maximum size: 10MB
            </p>
          </div>

          {/* Upload Error Display */}
          {uploadError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Upload Failed</p>
                      <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                    </div>
                  </div>

                  {/* Detailed Error Report */}
                  {errorReport && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-red-900">
                        Error Details:
                      </p>
                      <div className="max-h-96 overflow-y-auto bg-white rounded-md border border-red-200 p-3 space-y-4">
                        {Object.entries(errorReport).map(
                          ([sheetName, sheetData]) => (
                            <div key={sheetName} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-gray-900">
                                  {sheetName}
                                </h4>
                                <div className="flex items-center space-x-2 text-xs">
                                  {sheetData.total_rows > 0 && (
                                    <span className="text-gray-600">
                                      {sheetData.total_rows} rows
                                    </span>
                                  )}
                                  {sheetData.failed_rows > 0 && (
                                    <span className="text-red-600 font-medium">
                                      {sheetData.failed_rows} failed
                                    </span>
                                  )}
                                </div>
                              </div>
                              {sheetData.errors.length > 0 && (
                                <ul className="space-y-1 ml-4">
                                  {sheetData.errors.map((error, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-red-700 flex items-start"
                                    >
                                      <span className="mr-2">•</span>
                                      <span>
                                        {error.row && `Row ${error.row}: `}
                                        {error.message}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isFormValid() || uploading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
