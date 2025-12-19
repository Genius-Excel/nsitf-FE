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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
}

function FileUploadArea({ file, onFileChange, disabled }: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          file ? "border-green-400 bg-green-50" : ""
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
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
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
  const { uploading, uploadFile } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        return; // File upload will show its own error
      }
      return;
    }

    const success = await uploadFile(formData);
    if (success) {
      resetForm();
      onUploadSuccess();
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
              onFileChange={(file) => updateField("file", file)}
              disabled={isFormDisabled}
            />
            <p className="text-xs text-gray-500">
              Supported format: Excel (.xlsx) • Maximum size: 10MB
            </p>
          </div>

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
