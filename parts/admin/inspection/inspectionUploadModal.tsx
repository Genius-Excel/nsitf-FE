// ============================================================================
// InspectionUploadModal - Refactored
// ============================================================================
// Uploads Excel files with region/branch/period selection
// Role-based filtering: Admin sees regions, Regional officers see branches
// ============================================================================

"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRegions } from "@/hooks/compliance/Useregions";
import { useBranches } from "@/hooks/users";
import { getUserFromStorage } from "@/lib/auth";
import { toast } from "sonner";

interface InspectionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const InspectionUploadModal: React.FC<InspectionUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<
    "idle" | "uploading" | "processing" | "complete" | "error"
  >("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch regions and branches
  const { data: regions, loading: regionsLoading } = useRegions();
  const {
    data: branches,
    loading: branchesLoading,
    fetchBranches,
    clearBranches,
  } = useBranches();

  // Get user info for role-based filtering
  const user = getUserFromStorage();
  const userRegionId = user?.region_id;
  const userRole = user?.role?.toLowerCase();
  const isRegionalOfficer = userRole !== "admin" && userRole !== "manager";

  // Support backend-provided list of branches the regional manager heads
  const managedBranchIds: string[] =
    (user as any)?.managed_branches ||
    (user as any)?.managed_branch_ids ||
    (user as any)?.branch_ids ||
    [];

  // Auto-select region for regional officers (they cannot change it)
  useEffect(() => {
    if (isRegionalOfficer && userRegionId) {
      setSelectedRegionId(userRegionId);
    }
  }, [isRegionalOfficer, userRegionId]);

  // Fetch branches when region is selected
  useEffect(() => {
    if (selectedRegionId) {
      fetchBranches(selectedRegionId);
    } else {
      clearBranches();
      setSelectedBranchId("");
    }
  }, [selectedRegionId, fetchBranches, clearBranches]);

  const handleDownloadTemplate = () => {
    // Download pre-made template file from public folder
    const templatePath = "/templates/inspection_template.xlsx";

    const selectedRegion = regions?.find((r) => r.id === selectedRegionId);
    const selectedBranch = branches?.find((b) => b.id === selectedBranchId);
    const fileName = selectedBranch
      ? `${selectedBranch.name}_Inspection_Template.xlsx`
      : selectedRegion
      ? `${selectedRegion.name}_Inspection_Template.xlsx`
      : "Inspection_Template.xlsx";

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = templatePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file || !selectedRegionId || !selectedBranchId || !period) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStage("uploading");

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData and upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("region_id", selectedRegionId);
      formData.append("branch_id", selectedBranchId);
      formData.append("period", period);
      formData.append("sheet", "INSPECTIONS");

      const HttpService = (await import("@/services/httpServices")).default;
      const http = new HttpService();
      const response = await http.postData(
        formData,
        "/api/inspection-ops/reports"
      );

      clearInterval(progressInterval);
      setUploadProgress(95);
      setUploadStage("processing");

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUploadProgress(100);
      setUploadStage("complete");
      setUploadSuccess(true);

      const uploadData = response?.data;

      // Check if upload completed with errors
      if (
        uploadData?.status === "completed_with_errors" &&
        uploadData?.error_report
      ) {
        const inspectionErrors =
          uploadData.error_report?.INSPECTIONS?.errors || [];

        setUploadStage("error");
        setError("Upload completed with errors");
        setErrorDetails(inspectionErrors);

        toast.error("Upload failed. Please check the errors below.");
        return;
      }

      const recordCount =
        uploadData?.uploaded_records || uploadData?.total || 0;

      toast.success(`Successfully uploaded ${recordCount} inspections!`);

      setTimeout(() => {
        handleClose();
        onUploadSuccess();
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to upload inspection data";

      // Check if error response has error_report
      const errorReport =
        err?.response?.data?.error_report?.INSPECTIONS?.errors;
      if (errorReport && errorReport.length > 0) {
        setErrorDetails(errorReport);
      }

      setError(message);
      toast.error(message);
      setUploadStage("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRegionId("");
    setSelectedBranchId("");
    setPeriod("");
    setFile(null);
    setUploadSuccess(false);
    setError(null);
    setErrorDetails([]);
    setUploadProgress(0);
    setUploadStage("idle");
    onClose();
  };

  if (!isOpen) return null;

  const selectedRegion = regions?.find((r) => r.id === selectedRegionId);
  const selectedBranch = branches?.find((b) => b.id === selectedBranchId);
  const canDownloadTemplate = selectedRegionId && selectedBranchId && period;
  const canUpload = selectedRegionId && selectedBranchId && period && file;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Upload Inspection Data
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Region Selection - Only visible for admin/manager */}
            {!isRegionalOfficer && (
              <div>
                <label
                  htmlFor="region-select"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Select Region <span className="text-red-500">*</span>
                </label>
                <select
                  id="region-select"
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading || regionsLoading}
                  aria-label="Select region"
                >
                  <option value="">Choose a region</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {regionsLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading regions...
                  </p>
                )}
              </div>
            )}

            {/* Branch Selection */}
            {selectedRegionId && (
              <div>
                <label
                  htmlFor="branch-select"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <select
                  id="branch-select"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading || branchesLoading}
                  aria-label="Select branch"
                >
                  <option value="">Choose a branch</option>
                  {(user?.role === "regional_manager" &&
                  Array.isArray(managedBranchIds) &&
                  managedBranchIds.length > 0
                    ? branches?.filter((b) => managedBranchIds.includes(b.id))
                    : branches
                  )?.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {branchesLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading branches...
                  </p>
                )}
              </div>
            )}

            {/* Period Selection */}
            {selectedBranchId && (
              <div>
                <label
                  htmlFor="period-input"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Period <span className="text-red-500">*</span>
                </label>
                <input
                  id="period-input"
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                  placeholder="Select period (e.g., 2024-01)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select the month and year for this upload
                </p>
              </div>
            )}

            {/* Template Download */}
            {canDownloadTemplate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Download template for:</p>
                    <p className="text-xs mt-1">
                      {selectedRegion?.name} → {selectedBranch?.name} ({period})
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            )}

            {/* File Upload */}
            {canDownloadTemplate && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload File <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => {
                    if (!loading) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                    ${
                      file
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) =>
                      e.target.files?.[0] && setFile(e.target.files[0])
                    }
                    className="hidden"
                    disabled={loading}
                    aria-label="Upload Excel file"
                  />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {file ? file.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Accepted formats: .xlsx, .xls
                  </p>
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {loading && uploadStage !== "idle" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {uploadStage === "uploading" && "Uploading file..."}
                    {uploadStage === "processing" && "Processing data..."}
                    {uploadStage === "complete" && "Upload complete!"}
                  </span>
                  <span className="text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 bg-green-600 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {uploadStage === "processing" && (
                  <p className="text-xs text-gray-500 italic">
                    Please wait while the server processes your file...
                  </p>
                )}
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Upload successful!</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-1">
                      Upload failed:
                    </p>
                    <p className="text-sm text-red-700">{error}</p>

                    {/* Display detailed errors */}
                    {errorDetails && errorDetails.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {errorDetails.map((err, index) => (
                          <div
                            key={index}
                            className="bg-white border border-red-200 rounded p-3"
                          >
                            <p className="text-sm font-medium text-red-900 mb-1">
                              {err.error === "missing_columns" &&
                                "Missing Columns"}
                              {err.error === "validation_error" &&
                                "Validation Error"}
                              {err.error &&
                                err.error !== "missing_columns" &&
                                err.error !== "validation_error" &&
                                err.error}
                            </p>
                            <p className="text-xs text-red-700">
                              {err.message}
                            </p>
                            {err.missing_columns &&
                              err.missing_columns.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-red-800 mb-1">
                                    Required columns:
                                  </p>
                                  <ul className="list-disc list-inside text-xs text-red-700 space-y-0.5">
                                    {err.missing_columns.map(
                                      (col: string, colIndex: number) => (
                                        <li key={colIndex}>{col}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!canUpload || loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={
                !canUpload
                  ? "Please select region, branch, period, and upload file"
                  : "Upload file"
              }
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
