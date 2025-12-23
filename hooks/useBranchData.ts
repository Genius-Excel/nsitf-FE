import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

// ============== TYPES ==============

export interface Region {
  id: string;
  name: string;
  code: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  regionId: string;
}

export interface UploadRecord {
  id: string;
  period: string; // YYYY-MM format
  fileName: string;
  submittedAt: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  reviewerComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UploadFormData {
  regionId: string;
  branchId: string;
  period: string; // YYYY-MM format
  file: File | null;
}

export interface SheetError {
  error: string;
  message: string;
  row?: number;
}

export interface SheetErrorReport {
  total_rows: number;
  failed_rows: number;
  errors: SheetError[];
}

export interface ErrorReport {
  [sheetName: string]: SheetErrorReport;
}

// ============== MOCK DATA ==============

const MOCK_REGIONS: Region[] = [
  { id: "1", name: "Lagos Region", code: "LAG" },
  { id: "2", name: "Abuja Region", code: "ABJ" },
  { id: "3", name: "Kano Region", code: "KAN" },
  { id: "4", name: "Port Harcourt Region", code: "PHC" },
  { id: "5", name: "Enugu Region", code: "ENU" },
  { id: "6", name: "Ibadan Region", code: "IBD" },
];

const MOCK_BRANCHES: Record<string, Branch[]> = {
  "1": [
    // Lagos Region
    { id: "1-1", name: "Lagos Island Branch", code: "LAG-ISL", regionId: "1" },
    { id: "1-2", name: "Ikeja Branch", code: "LAG-IKE", regionId: "1" },
    {
      id: "1-3",
      name: "Victoria Island Branch",
      code: "LAG-VI",
      regionId: "1",
    },
    { id: "1-4", name: "Surulere Branch", code: "LAG-SUR", regionId: "1" },
  ],
  "2": [
    // Abuja Region
    { id: "2-1", name: "Garki Branch", code: "ABJ-GAR", regionId: "2" },
    { id: "2-2", name: "Wuse Branch", code: "ABJ-WUS", regionId: "2" },
    { id: "2-3", name: "Asokoro Branch", code: "ABJ-ASO", regionId: "2" },
  ],
  "3": [
    // Kano Region
    { id: "3-1", name: "Kano Central Branch", code: "KAN-CEN", regionId: "3" },
    { id: "3-2", name: "Sabon Gari Branch", code: "KAN-SAB", regionId: "3" },
  ],
  "4": [
    // Port Harcourt Region
    {
      id: "4-1",
      name: "Port Harcourt Main Branch",
      code: "PHC-MAIN",
      regionId: "4",
    },
    { id: "4-2", name: "Trans Amadi Branch", code: "PHC-TRA", regionId: "4" },
  ],
  "5": [
    // Enugu Region
    { id: "5-1", name: "Enugu Central Branch", code: "ENU-CEN", regionId: "5" },
  ],
  "6": [
    // Ibadan Region
    { id: "6-1", name: "Ibadan Main Branch", code: "IBD-MAIN", regionId: "6" },
    { id: "6-2", name: "Bodija Branch", code: "IBD-BOD", regionId: "6" },
  ],
};

const MOCK_UPLOAD_HISTORY: UploadRecord[] = [
  {
    id: "1",
    period: "2024-11",
    fileName: "Lagos_Island_November_2024.xlsx",
    submittedAt: "2024-12-01T10:30:00Z",
    status: "approved",
    reviewerComment:
      "All data validated successfully. Good compliance with reporting standards.",
    reviewedAt: "2024-12-02T14:20:00Z",
    reviewedBy: "Regional Manager - Lagos",
  },
  {
    id: "2",
    period: "2024-10",
    fileName: "Lagos_Island_October_2024.xlsx",
    submittedAt: "2024-11-01T09:15:00Z",
    status: "approved",
    reviewerComment: "Minor formatting issues noted but data is accurate.",
    reviewedAt: "2024-11-03T11:45:00Z",
    reviewedBy: "Regional Manager - Lagos",
  },
  {
    id: "3",
    period: "2024-09",
    fileName: "Lagos_Island_September_2024.xlsx",
    submittedAt: "2024-10-01T16:20:00Z",
    status: "rejected",
    reviewerComment:
      "Missing employee contribution data for several entries. Please review and resubmit with complete information.",
    reviewedAt: "2024-10-02T08:30:00Z",
    reviewedBy: "Regional Manager - Lagos",
  },
  {
    id: "4",
    period: "2024-08",
    fileName: "Lagos_Island_August_2024.xlsx",
    submittedAt: "2024-09-01T12:00:00Z",
    status: "approved",
    reviewedAt: "2024-09-02T15:10:00Z",
    reviewedBy: "Regional Manager - Lagos",
  },
];

// ============== REGIONS HOOK ==============

export function useRegions() {
  const { toast } = useToast();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get access token from localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        throw new Error("Authentication required");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
      console.log(
        "Fetching regions from:",
        `${API_BASE_URL}/api/admin/regions`
      );

      const response = await fetch(`${API_BASE_URL}/api/admin/regions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Regions response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Regions API error:", errorData);
        throw new Error(errorData.message || "Failed to fetch regions");
      }

      const result = await response.json();
      console.log("Regions API response:", result);

      // Handle different response structures
      let regionData: any[] = [];
      if (Array.isArray(result)) {
        regionData = result;
      } else if (result.data && Array.isArray(result.data)) {
        regionData = result.data;
      } else if (result.regions && Array.isArray(result.regions)) {
        regionData = result.regions;
      }

      console.log("Extracted region data:", regionData);

      // Map to Region interface
      const mappedRegions: Region[] = regionData.map((item: any) => ({
        id: item.id || item.region_id,
        name: item.name || item.region_name,
        code: item.code || item.region_code || "",
      }));

      console.log("Mapped regions:", mappedRegions);
      setRegions(mappedRegions);

      if (mappedRegions.length === 0) {
        toast({
          title: "No Regions Found",
          description: "No regions are available. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Fetch regions error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch regions";
      setError(errorMessage);
      setRegions([]);
      toast({
        title: "Failed to Load Regions",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    regions,
    loading,
    error,
    refetch: fetchRegions,
  };
}

// ============== BRANCHES HOOK ==============

export function useBranches(regionId: string) {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    if (!regionId) {
      setBranches([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get access token from localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        throw new Error("Authentication required");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
      console.log(
        "Fetching branches from:",
        `${API_BASE_URL}/api/admin/branches?region_id=${regionId}`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/admin/branches?region_id=${regionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Branches response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Branches API error:", errorData);
        throw new Error(errorData.message || "Failed to fetch branches");
      }

      const result = await response.json();
      console.log("Branches API response:", result);

      // Handle different response structures
      let branchData: any[] = [];
      if (Array.isArray(result)) {
        branchData = result;
      } else if (result.data && Array.isArray(result.data)) {
        branchData = result.data;
      } else if (result.branches && Array.isArray(result.branches)) {
        branchData = result.branches;
      }

      console.log("Extracted branch data:", branchData);

      // Map to Branch interface
      const mappedBranches: Branch[] = branchData.map((item: any) => ({
        id: item.id || item.branch_id,
        name: item.name || item.branch_name,
        code: item.code || item.branch_code || "",
        regionId: item.region_id || item.regionId || regionId,
      }));

      console.log("Mapped branches:", mappedBranches);
      setBranches(mappedBranches);
    } catch (err) {
      console.error("Fetch branches error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch branches";
      setError(errorMessage);
      setBranches([]);
      toast({
        title: "Failed to Load Branches",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [regionId, toast]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches,
  };
}

// ============== UPLOAD HOOK ==============

export function useFileUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);

  const uploadFile = useCallback(
    async (formData: UploadFormData): Promise<boolean> => {
      // Clear previous errors
      setUploadError(null);
      if (
        !formData.file ||
        !formData.regionId ||
        !formData.branchId ||
        !formData.period
      ) {
        const errorMsg = "All fields are required";
        setUploadError(errorMsg);
        toast({
          title: "Validation Error",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }

      // Validate file type
      if (!formData.file.name.toLowerCase().endsWith(".xlsx")) {
        const errorMsg = "Please upload an Excel file (.xlsx)";
        setUploadError(errorMsg);
        toast({
          title: "Invalid File Type",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }

      // Validate file size (max 10MB)
      if (formData.file.size > 10 * 1024 * 1024) {
        const errorMsg = `File size (${(
          formData.file.size /
          (1024 * 1024)
        ).toFixed(2)} MB) exceeds the maximum limit of 10MB`;
        setUploadError(errorMsg);
        toast({
          title: "File Too Large",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }

      try {
        setUploading(true);

        // Get access token from localStorage
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

        if (!token) {
          throw new Error("Authentication required. Please log in again.");
        }

        // Create FormData for multipart upload
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.file);
        uploadFormData.append("region_id", formData.regionId);
        uploadFormData.append("branch_id", formData.branchId);
        uploadFormData.append("period", formData.period);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

        const response = await fetch(`${API_BASE_URL}/api/branch/reports`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMsg = result.message || result.error || "Upload failed";
          setUploadError(errorMsg);
          setErrorReport(result.error_report || null);
          throw new Error(errorMsg);
        }

        // Handle completed_with_errors status
        if (result.status === "completed_with_errors" && result.error_report) {
          setErrorReport(result.error_report);

          // Count total errors across all sheets
          const errorCount = Object.values(
            result.error_report as ErrorReport
          ).reduce(
            (total: number, sheet: SheetErrorReport) =>
              total + sheet.errors.length,
            0
          );

          const errorMsg = `Upload completed with ${errorCount} error(s). Please review the error details below.`;
          setUploadError(errorMsg);

          toast({
            title: "Upload Completed with Errors",
            description: errorMsg,
            variant: "destructive",
          });

          return false; // Return false so errors are displayed
        }

        // Success response
        setUploadError(null);
        setErrorReport(null);
        toast({
          title: "Upload Successful",
          description: `Your report has been submitted successfully. Batch ID: ${result.batch_id}. Status: ${result.status}`,
        });

        return true;
      } catch (err) {
        console.error("Upload error:", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to upload file. Please try again.";
        setUploadError(errorMsg);
        toast({
          title: "Upload Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      } finally {
        setUploading(false);
      }
    },
    [toast]
  );

  return {
    uploading,
    uploadFile,
    uploadError,
    errorReport,
  };
}

// ============== UPLOAD HISTORY HOOK ==============

export function useUploadHistory() {
  const [history, setHistory] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get access token from localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        throw new Error("Authentication required");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(
        `${API_BASE_URL}/api/branch/reports/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch upload history");
      }

      const result = await response.json();

      // Map API response to UploadRecord format
      // Handle actual API response structure
      let dataArray: any[] = [];

      if (Array.isArray(result)) {
        dataArray = result;
      } else if (
        result.data?.upload_history &&
        Array.isArray(result.data.upload_history)
      ) {
        dataArray = result.data.upload_history;
      } else if (result.data && Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (result.reports && Array.isArray(result.reports)) {
        dataArray = result.reports;
      }

      const mappedHistory: UploadRecord[] = dataArray.map((item: any) => ({
        id: item.id || item.batch_id,
        period: item.period,
        fileName: item.filename || item.file_name || item.fileName || "Unknown",
        submittedAt:
          item.submitted_on ||
          item.created_at ||
          item.submittedAt ||
          item.uploaded_at,
        status: (item.upload_status || item.status) as
          | "submitted"
          | "under_review"
          | "approved"
          | "rejected",
        reviewerComment:
          item.reviewer_comments ||
          item.reviewer_comment ||
          item.reviewerComment,
        reviewedAt: item.reviewed_at || item.reviewedAt,
        reviewedBy:
          item.reviewed_by || item.reviewedBy || item.user_details?.full_name,
      }));

      setHistory(mappedHistory);
    } catch (err) {
      console.error("Fetch history error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch upload history"
      );
      // Fallback to empty array on error
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}

// ============== FORM VALIDATION HOOK ==============

export function useUploadForm() {
  const [formData, setFormData] = useState<UploadFormData>({
    regionId: "",
    branchId: "",
    period: "",
    file: null,
  });

  const updateField = useCallback((field: keyof UploadFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear branch when region changes
      if (field === "regionId" && value !== prev.regionId) {
        newData.branchId = "";
      }

      return newData;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      regionId: "",
      branchId: "",
      period: "",
      file: null,
    });
  }, []);

  const isFormValid = useCallback(() => {
    return !!(
      formData.regionId &&
      formData.branchId &&
      formData.period &&
      formData.file
    );
  }, [formData]);

  return {
    formData,
    updateField,
    resetForm,
    isFormValid,
  };
}
