import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import type { InspectionRecord } from "@/lib/types/inspection";

const http = new HttpService();

interface UseManageInspectionsParams {
  page?: number;
  perPage?: number;
  branch_id?: string;
  region_id?: string;
  period?: string;
  period_from?: string;
  period_to?: string;
  record_status?: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

interface UseManageInspectionsReturn {
  inspections: InspectionRecord[];
  pagination: PaginationState | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
}

/**
 * Fetches inspection records from manage-inspections endpoint with filtering
 *
 * @param params - Filter parameters (branch_id, region_id, period, period_from, period_to, record_status)
 * @returns Inspection records with pagination
 */
export const useManageInspections = (
  params: UseManageInspectionsParams = {}
): UseManageInspectionsReturn => {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage.toString());
      queryParams.append("per_page", (params.perPage || 20).toString());

      // Add filter params if provided
      if (params.branch_id) queryParams.append("branch_id", params.branch_id);
      if (params.region_id) queryParams.append("region_id", params.region_id);
      if (params.record_status)
        queryParams.append("record_status", params.record_status);
      if (params.period) queryParams.append("period", params.period);
      if (params.period_from)
        queryParams.append("period_from", params.period_from);
      if (params.period_to) queryParams.append("period_to", params.period_to);

      const url = `/api/inspection-ops/manage-inspections?${queryParams.toString()}`;
      const response = await http.getData(url);

      console.log("🔍 [useManageInspections] API Response:", response.data);

      // Transform snake_case API response to camelCase
      const apiData = response.data.data || response.data || [];

      console.log("🔍 [useManageInspections] API Data to transform:", apiData);

      const transformedInspections: InspectionRecord[] = Array.isArray(apiData)
        ? apiData.map((item: any) => {
            console.log("🔍 [useManageInspections] Transforming item:", item);

            // Calculate debt recovered from performance rate if not provided
            const debtEstablished = item.cumulative_debt_established || 0;
            const performanceRate = item.performance_rate || 0;
            const debtRecovered =
              item.cumulative_debt_recovered ||
              debtEstablished * (performanceRate / 100);

            return {
              id: item.id || "",
              region: item.region || "",
              branch: item.branch || "N/A",
              inspectionsConducted: item.inspection_conducted || 0,
              debtEstablished: debtEstablished,
              debtRecovered: debtRecovered,
              performanceRate: performanceRate,
              demandNotice: item.demand_notice || 0,
              period: item.period || "",
              recordStatus: item.record_status || "pending",
              reviewedBy: item.reviewed_by || null,
              approvedBy: item.approved_by || null,
            };
          })
        : [];

      console.log(
        "✅ [useManageInspections] Transformed inspections:",
        transformedInspections
      );

      setInspections(transformedInspections);

      // Set pagination if available
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.total_pages,
          totalItems: response.data.pagination.total_items,
          perPage: response.data.pagination.per_page,
        });
      }

      console.log(
        "✅ [useManageInspections] Loaded inspections:",
        transformedInspections.length
      );
    } catch (err: any) {
      console.error("❌ [useManageInspections] Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load inspections";
      setError(errorMessage);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    params.perPage,
    params.branch_id,
    params.region_id,
    params.record_status,
    params.period,
    params.period_from,
    params.period_to,
  ]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return {
    inspections,
    pagination,
    loading,
    error,
    refetch: fetchInspections,
    setPage: setCurrentPage,
  };
};
