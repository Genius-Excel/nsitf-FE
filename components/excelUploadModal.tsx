"use client";
import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============= TYPES =============
interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, selectedRegion: string) => Promise<void>;
  regions: string[];
  title: string;
  description: string;
  templateFields?: string[];
}

// ============= UPLOAD STAGES =============
type UploadStage =
  | "region-selection"
  | "file-selection"
  | "parsing"
  | "reading"
  | "validating"
  | "complete";

// ============= MAIN COMPONENT =============
const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  regions,
  title,
  description,
  templateFields = [
    "Region",
    "Branch",
    "Contribution Collected",
    "Target",
    "Employers Registered",
    "Employees",
    "Certificate Fees",
    "Period",
  ],
}) => {
  // ============= STATE =============
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("region-selection");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============= STAGE MESSAGES =============
  const getStageMessage = (): string => {
    switch (stage) {
      case "region-selection":
        return "Select a region to continue";
      case "file-selection":
        return "Upload your Excel file";
      case "parsing":
        return "Parsing document...";
      case "reading":
        return `Reading file... ${uploadProgress}%`;
      case "validating":
        return `Validating data... ${uploadProgress}%`;
      case "complete":
        return "Upload complete!";
      default:
        return "";
    }
  };

  // ============= EVENT HANDLERS =============
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setStage("file-selection");
    setUploadError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      setUploadError(
        "Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file."
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedRegion) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate stage progression
      setStage("parsing");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadProgress(20);

      setStage("reading");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadProgress(50);

      setStage("validating");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadProgress(80);

      // Call the actual upload handler
      await onUpload(selectedFile, selectedRegion);

      setUploadProgress(100);
      setStage("complete");

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      setUploadError(error.message || "Upload failed. Please try again.");
      setStage("file-selection");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedRegion("");
    setSelectedFile(null);
    setStage("region-selection");
    setUploadProgress(0);
    setUploadError(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBackToRegionSelection = () => {
    setSelectedRegion("");
    setSelectedFile(null);
    setStage("region-selection");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============= RENDER HELPERS =============
  const renderRegionSelection = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Region Selection Required
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Select the region for which you're uploading data. This ensures
              proper data organization.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Select Region *
        </label>
        <Select value={selectedRegion} onValueChange={handleRegionSelect}>
          <SelectTrigger className="w-full border-gray-200">
            <SelectValue placeholder="Choose a region..." />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Required Template Fields
        </h4>
        <div className="flex flex-wrap gap-2">
          {templateFields.map((field, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFileSelection = () => (
    <div className="space-y-4">
      {/* Selected Region Display */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-green-700">Selected Region</p>
            <p className="text-sm font-semibold text-green-900">
              {selectedRegion}
            </p>
          </div>
        </div>
        <button
          onClick={handleBackToRegionSelection}
          className="text-xs text-green-700 hover:text-green-900 font-medium"
          disabled={isUploading}
        >
          Change
        </button>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* File Upload Area */}
      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Excel (.xlsx, .xls) or CSV files (MAX. 10MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                aria-label="cancel"
                onClick={handleRemoveFile}
                className="p-1 hover:bg-gray-200 rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Upload Guidelines
        </h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Ensure your file matches the template structure</li>
          <li>• All required fields must be filled</li>
          <li>• Numeric fields must contain valid numbers only</li>
          <li>• Date fields should be in a consistent format</li>
        </ul>
      </div>
    </div>
  );

  const renderUploadProgress = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900 mb-2">
          {getStageMessage()}
        </p>
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-gray-900">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Please do not close this window while the upload is in progress.
        </p>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
      <p className="text-sm text-gray-600">
        Your data has been successfully uploaded and validated.
      </p>
    </div>
  );

  // ============= MAIN RENDER =============
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            {!isUploading && (
              <button
                aria-label="cancel"
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4">
          {stage === "region-selection" && renderRegionSelection()}
          {stage === "file-selection" && renderFileSelection()}
          {(stage === "parsing" ||
            stage === "reading" ||
            stage === "validating") &&
            renderUploadProgress()}
          {stage === "complete" && renderComplete()}
        </div>

        {/* Footer Actions */}
        {stage === "file-selection" && !isUploading && (
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={handleBackToRegionSelection}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload File
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExcelUploadModal;