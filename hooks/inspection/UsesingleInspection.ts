import { useState, useCallback } from "react";
import HttpService from "@/services/httpServices";

const http = new HttpService();

interface InspectionDetail {
  id: string;
  region: string;
  branch: string;
  inspectionsConducted: number;
  debtEstablished: number;
  debtRecovered: number;
  performanceRate: number;
  demandNotice: number;
  period: string;
  // Audit fields
  recordStatus?: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseSingleInspectionReturn {
  data: InspectionDetail | null;
  loading: boolean;
  error: string | null;
  fetchDetail: (inspectionId: string) => Promise<void>;
  clearDetail: () => void;
}

/**
 * Hook to fetch single inspection detail for modal
 */
export const useSingleInspection = (): UseSingleInspectionReturn => {
  const [data, setData] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (inspectionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/inspection-ops/manage-inspections/${inspectionId}`;
      console.log("🔍 [useSingleInspection] Fetching:", url);
      const response = await http.getData(url);

      console.log("🔍 [useSingleInspection] API Response:", response);

      // API returns { message, data: {...} }
      const apiData = response.data?.data || response.data;

      console.log("🔍 [useSingleInspection] Parsed apiData:", apiData);

      // Check if this is the detailed format with nested objects
      const isDetailedFormat =
        apiData.branch_information && apiData.performance_metrics;

      // IMPORTANT: Detail endpoint doesn't include audit fields (record_status, reviewed_by, approved_by)
      // So we need to also check root level for these fields
      console.log(
        "🔍 [useSingleInspection] Checking for audit fields at root level..."
      );
      console.log(
        "🔍 [useSingleInspection] record_status:",
        response.data?.record_status
      );
      console.log(
        "🔍 [useSingleInspection] reviewed_by:",
        response.data?.reviewed_by
      );

      // Transform to camelCase
      // For detailed format, check both nested data and response root for audit fields
      const transformed: InspectionDetail = isDetailedFormat
        ? {
            id: inspectionId,
            region: apiData.branch_information?.region || "",
            branch: apiData.branch_information?.branch_name || "",
            inspectionsConducted:
              apiData.inspection_activity?.inspections_conducted || 0,
            debtEstablished: apiData.financial_summary?.debt_established || 0,
            debtRecovered: apiData.financial_summary?.debt_recovered || 0,
            performanceRate: apiData.performance_metrics?.performance_rate || 0,
            demandNotice:
              apiData.inspection_activity?.demand_notices_issued || 0,
            period: apiData.branch_information?.period || "",
            // Audit fields: check root level of response.data first, then apiData
            recordStatus:
              response.data?.record_status ||
              apiData.record_status ||
              "pending",
            reviewedBy:
              response.data?.reviewed_by || apiData.reviewed_by || null,
            approvedBy:
              response.data?.approved_by || apiData.approved_by || null,
          }
        : {
            id: apiData.id || inspectionId,
            region: apiData.region || "",
            branch: apiData.branch || "",
            inspectionsConducted: apiData.inspection_conducted || 0,
            debtEstablished: apiData.cumulative_debt_established || 0,
            debtRecovered: apiData.cumulative_debt_recovered || 0,
            performanceRate: apiData.performance_rate || 0,
            demandNotice: apiData.demand_notice || 0,
            period: apiData.period || "",
            recordStatus: apiData.record_status || "pending",
            reviewedBy: apiData.reviewed_by || null,
            approvedBy: apiData.approved_by || null,
            createdAt: apiData.created_at,
            updatedAt: apiData.updated_at,
          };

      setData(transformed);
      console.log("✅ [useSingleInspection] Loaded detail for:", inspectionId);
    } catch (err: any) {
      console.error("❌ [useSingleInspection] Error:", err);
      console.error("❌ [useSingleInspection] Error response:", err.response);
      console.error(
        "❌ [useSingleInspection] Error status:",
        err.response?.status
      );
      console.error("❌ [useSingleInspection] Error data:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load inspection detail";
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetail = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchDetail,
    clearDetail,
  };
};
