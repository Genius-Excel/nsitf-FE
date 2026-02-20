// ============================================================================
// useManageHSERecordDetail Hook
// ============================================================================
// Fetches a single HSE record from the manage-hse endpoint by UUID.
//
// API Endpoint: GET /api/hse-ops/manage-hse/{uuid}
//
// Response shape:
// {
//   "message": "HSE Record Retrieved",
//   "data": { id, branch, region, total_actual_osh_activities,
//              target_osh_activities, osh_enlightment, osh_inspection_audit,
//              accident_investigation, period, record_status,
//              reviewed_by, approved_by, created_at, updated_at }
// }
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import HttpService from "@/services/httpServices";
import { ManageHSERecordAPI, transformManageHSERecord } from "@/lib/types/hse";
import type { RegionalSummary } from "@/lib/types/hse";

interface UseManageHSERecordDetailReturn {
  data: RegionalSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useManageHSERecordDetail(
  uuid?: string,
): UseManageHSERecordDetailReturn {
  const [data, setData] = useState<RegionalSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!uuid) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const httpService = new HttpService();
      const response = await httpService.getData(
        `/api/hse-ops/manage-hse/${uuid}`,
      );

      const apiRecord: ManageHSERecordAPI = response.data.data;
      setData(transformManageHSERecord(apiRecord));
    } catch (err: any) {
      console.error("Error fetching manage-HSE record detail:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load HSE record details",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecord,
  };
}
