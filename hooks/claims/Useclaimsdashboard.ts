import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import {
  ClaimsDashboardResponse,
  Claim,
  DashboardMetrics,
  ClaimCategories,
  MonthlyChart,
  PaginationState,
  transformClaimRecord,
  transformMetrics,
  transformCategories,
} from "@/lib/types/claims";

const http = new HttpService();
interface UseClaimsDashboardParams {
  page?: number;
  perPage?: number;
}

interface UseClaimsDashboardReturn {
  // Transformed data for components (camelCase)
  claims: Claim[];
  metrics: DashboardMetrics | null;
  categories: ClaimCategories | null;
  monthlyChart: MonthlyChart | null;

  // Pagination
  pagination: PaginationState | null;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
  setPage: (page: number) => void;
}

/**
 * Fetches claims dashboard data from API
 *
 * @param params.page - Current page number (default: 1)
 * @param params.perPage - Items per page (default: 20)
 *
 * @returns Dashboard data with transformed claims (camelCase)
 *
 * @example
 * ```tsx
 * const { claims, metrics, loading, setPage } = useClaimsDashboard({ page: 1 });
 * ```
 */
export const useClaimsDashboard = (
  params: UseClaimsDashboardParams = {}
): UseClaimsDashboardReturn => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categories, setCategories] = useState<ClaimCategories | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyChart | null>(null);
  const [pagination, setPagination] = useState<PaginationState | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(currentPage));
      if (params.perPage) {
        queryParams.append("per_page", String(params.perPage));
      }

      const response = await http.getData(
        `/api/claims/dashboard?${queryParams.toString()}`
      );

      if (!response?.data) {
        throw new Error("Invalid response format from API");
      }

      const apiData = response.data as ClaimsDashboardResponse;

      // Transform claims from snake_case to camelCase
      const transformedClaims =
        apiData.data.claims_table.results.map(transformClaimRecord);
      setClaims(transformedClaims);

      // Transform metrics
      const transformedMetrics = transformMetrics(apiData.data.metric_cards);
      setMetrics(transformedMetrics);

      // Transform categories
      const transformedCategories = transformCategories(
        apiData.data.category_metrics
      );
      setCategories(transformedCategories);

      // Monthly chart stays as-is (already has correct structure)
      setMonthlyChart(apiData.data.monthly_chart);

      // Set pagination state
      setPagination({
        page: apiData.data.claims_table.page,
        perPage: apiData.data.claims_table.per_page,
        totalPages: apiData.data.claims_table.total_pages,
        totalCount: apiData.data.claims_table.count,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch claims dashboard";
      setError(errorMessage);
      console.error("Error fetching claims dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, params.perPage]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    claims,
    metrics,
    categories,
    monthlyChart,
    pagination,
    loading,
    error,
    refetch: fetchDashboard,
    setPage,
  };
};
