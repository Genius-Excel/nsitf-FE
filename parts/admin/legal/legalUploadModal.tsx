// ============================================================================
// LegalUploadModal - Refactored
// ============================================================================
// NOW ACTUALLY CALLS THE UPLOAD API
// Uploads Excel files with region selection
// ============================================================================

"use client";

import { useState, useRef } from "react";
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

interface LegalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

// Hardcoded regions with their UUIDs (from DEFAULT_REGIONS)
const REGIONS = [
  { id: "76e5b79f-3557-407f-a2d4-e1c3be850aaf", name: "Lagos" },
  { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", name: "Abuja" },
  { id: "d9e8c2f1-4b5a-4c7e-8a9f-3d2e1b0c9a8b", name: "Kano" },
  { id: "c8d7b6a5-9e4f-3c2b-1a0d-9e8f7d6c5b4a", name: "Port Harcourt" },
  { id: "b7c6a5d4-8e3f-2c1b-0a9d-8e7f6d5c4b3a", name: "Ibadan" },
  { id: "a6b5c4d3-7e2f-1c0b-9a8d-7e6f5d4c3b2a", name: "Enugu" },
  { id: "95a4b3c2-6d1f-0e9c-8b7a-6d5e4c3b2a1f", name: "Kaduna" },
];

export const LegalUploadModal: React.FC<LegalUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, loading, error, clearError } = useUploadLegalActivities();

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
        Sectors: "",
        "Activities Period": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const selectedRegion = REGIONS.find((r) => r.id === selectedRegionId);
    const regionName = selectedRegion?.name || "All_Regions";
    XLSX.writeFile(wb, `${regionName}_Legal_Activities_Template.xlsx`);
  };

  const handleUpload = async () => {
    if (!file || !selectedRegionId) {
      return;
    }

    clearError();
    const result = await uploadFile(selectedRegionId, file);

    if (result) {
      setUploadSuccess(true);
      setTimeout(() => {
        handleClose();
        onUploadSuccess();
      }, 2000);
    }
  };

  const handleClose = () => {
    setSelectedRegionId("");
    setFile(null);
    setUploadSuccess(false);
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  const selectedRegion = REGIONS.find((r) => r.id === selectedRegionId);

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
            {/* Region Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Region <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={loading}
              >
                <option value="">Choose a region</option>
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Download */}
            {selectedRegionId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm text-blue-800">
                    Download the template for {selectedRegion?.name}
                  </span>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => {
                  if (selectedRegionId && !loading) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${
                    file
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  ${
                    !selectedRegionId || loading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && setFile(e.target.files[0])
                  }
                  className="hidden"
                  disabled={!selectedRegionId || loading}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">Upload your file</p>
              </div>
            </div>

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
                  <div>
                    <p className="font-semibold text-red-800 mb-1">
                      Upload failed:
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || !selectedRegionId || loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
