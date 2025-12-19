// ============================================================================
// LegalUploadModal - Refactored
// ============================================================================
// NOW ACTUALLY CALLS THE UPLOAD API
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
import { useUploadLegalActivities } from "@/hooks/legal/useUploadLegalActivities";
import { useRegions } from "@/hooks/compliance/Useregions";
import { useBranches } from "@/hooks/users";
import { getUserFromStorage } from "@/lib/auth";

interface LegalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const LegalUploadModal: React.FC<LegalUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<
    "idle" | "uploading" | "processing" | "complete" | "error"
  >("idle");
  const [errorDetails, setErrorDetails] = useState<any[]>([]);

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

  // If backend provides a list of branches the regional manager heads,
  // prefer that list to restrict branch choices.
  const managedBranchIds: string[] =
    (user as any)?.managed_branches ||
    (user as any)?.managed_branch_ids ||
    (user as any)?.branch_ids ||
    [];

  const { uploadFile, loading, error, clearError } = useUploadLegalActivities();

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
    const templateData = [
      {
        Branch: "",
        "Recalcitrant Employers": 0,
        "Defaulting Employers": 0,
        "ECS NO.": "",
        "Plan Issued": 0,
        ADR: 0,
        "Cases Instituted": 0,
        "Cases Won": 0,
        Sectors: "",
        "Activities Period": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const selectedRegion = regions?.find((r) => r.id === selectedRegionId);
    const selectedBranch = branches?.find((b) => b.id === selectedBranchId);
    const fileName = selectedBranch
      ? `${selectedBranch.name}_Legal_Activities_Template.xlsx`
      : selectedRegion
      ? `${selectedRegion.name}_Legal_Activities_Template.xlsx`
      : "Legal_Activities_Template.xlsx";
    XLSX.writeFile(wb, fileName);
  };

  const handleUpload = async () => {
    if (!file || !selectedRegionId) {
      return;
    }

    clearError();
    setErrorDetails([]);
    setUploadProgress(0);
    setUploadStage("uploading");

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

    try {
      const result = await uploadFile(selectedRegionId, file);
      clearInterval(progressInterval);

      if (result) {
        setUploadProgress(95);
        setUploadStage("processing");

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUploadProgress(100);
        setUploadStage("complete");
        setUploadSuccess(true);

        setTimeout(() => {
          handleClose();
          onUploadSuccess();
        }, 2000);
      } else {
        setUploadStage("error");
      }
    } catch (err: any) {
      clearInterval(progressInterval);

      // Extract error message from various possible locations
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to upload legal data";

      // Extract detailed error report if available
      const errorReport = err?.response?.data?.error_report?.LEGAL?.errors;
      if (errorReport && errorReport.length > 0) {
        setErrorDetails(errorReport);
      } else if (err?.response?.data?.error) {
        // If there's a simple error string, create a single error detail
        setErrorDetails([{ message: err.response.data.error }]);
      }

      setUploadStage("error");
    }
  };

  const handleClose = () => {
    setSelectedRegionId("");
    setSelectedBranchId("");
    setPeriod("");
    setFile(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadStage("idle");
    setErrorDetails([]);
    clearError();
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
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Upload Legal Activities
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Period <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Download template for:</p>
                    <p className="text-xs mt-1">
                      {selectedRegion?.name} → {selectedBranch?.name} ({period})
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

            {/* Error Message with Details */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-1">
                      Upload failed
                    </p>
                    <p className="text-sm text-red-700 mb-2">{error}</p>

                    {/* Detailed Error List */}
                    {errorDetails.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-red-800 uppercase">
                          Validation Errors:
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                          {errorDetails.map((err: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-white rounded p-2 border border-red-200"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-mono text-red-600 mt-0.5">
                                  #{idx + 1}
                                </span>
                                <div className="flex-1 text-xs">
                                  {err.row && (
                                    <p className="font-medium text-red-700">
                                      Row {err.row}:
                                    </p>
                                  )}
                                  {err.field && (
                                    <p className="text-gray-600">
                                      Field:{" "}
                                      <span className="font-mono">
                                        {err.field}
                                      </span>
                                    </p>
                                  )}
                                  <p className="text-red-600 mt-1">
                                    {err.message || err.error}
                                  </p>
                                  {err.missing_columns &&
                                    err.missing_columns.length > 0 && (
                                      <p className="text-gray-600 mt-1">
                                        Missing:{" "}
                                        {err.missing_columns.join(", ")}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
