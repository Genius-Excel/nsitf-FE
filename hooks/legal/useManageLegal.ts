import { useState, useEffect } from "react";
import HttpService from "@/services/httpServices";
import {
  ManageLegalRecordAPI,
  LegalRecord,
  transformManageLegalRecord,
} from "@/lib/types/legal-new";

const http = new HttpService();

interface UseManageLegalReturn {
  records: LegalRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseManageLegalOptions {
  regionId?: string;
  branchId?: string;
  period?: string;
  periodFrom?: string;
  periodTo?: string;
}

/**
 * Hook to fetch legal records from manage-legal endpoint
 * GET /api/legal-ops/manage-legal
 */
export const useManageLegal = (
  options: UseManageLegalOptions = {}
): UseManageLegalReturn => {
  const [records, setRecords] = useState<LegalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (options.regionId) params.append("region_id", options.regionId);
      if (options.branchId) params.append("branch_id", options.branchId);
      if (options.period) params.append("period", options.period);
      if (options.periodFrom) params.append("period_from", options.periodFrom);
      if (options.periodTo) params.append("period_to", options.periodTo);

      const queryString = params.toString();
      const url = queryString
        ? `/api/legal-ops/manage-legal?${queryString}`
        : `/api/legal-ops/manage-legal`;

      const response = await http.getData(url);

      console.log("📊 Legal API Response:", response);
      console.log("📊 Response Data:", response.data);

      // Handle different response structures
      let apiRecords: ManageLegalRecordAPI[] = [];

      if (Array.isArray(response)) {
        apiRecords = response;
      } else if (Array.isArray(response.data)) {
        apiRecords = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        apiRecords = response.data.data;
      } else if (
        response.data?.records &&
        Array.isArray(response.data.records)
      ) {
        apiRecords = response.data.records;
      }

      console.log("📊 Parsed API Records:", apiRecords);
      console.log("📊 Number of records:", apiRecords.length);

      const transformedRecords = apiRecords.map(transformManageLegalRecord);
      console.log("📊 Transformed Records:", transformedRecords);

      setRecords(transformedRecords);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch legal records";
      setError(errorMessage);
      console.error("Error fetching legal records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [
    options.regionId,
    options.branchId,
    options.period,
    options.periodFrom,
    options.periodTo,
  ]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
  };
};
