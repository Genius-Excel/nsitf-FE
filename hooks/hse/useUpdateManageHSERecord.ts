// ============================================================================
// useUpdateManageHSERecord Hook
// ============================================================================
// Updates an existing HSE record via the manage-hse endpoint.
//
// API Endpoint: PATCH /api/hse-ops/manage-hse/{uuid}
// Content-Type: application/x-www-form-urlencoded
//
// Payload fields (all optional):
//   record_status             – "reviewed" | "approved"
//   total_actual_osh_activities – number
//   target_osh_activities     – number
//   osh_enlightenment         – number
//   osh_inspection_audit      – number
//   accident_investigation    – number
//   period                    – string (YYYY-MM)
// ============================================================================

import { useState } from "react";
import HttpService from "@/services/httpServices";
import { ManageHSERecordAPI, transformManageHSERecord } from "@/lib/types/hse";
import type { RegionalSummary } from "@/lib/types/hse";

export interface UpdateManageHSEPayload {
  record_status?: "reviewed" | "approved";
  total_actual_osh_activities?: number;
  target_osh_activities?: number;
  osh_enlightenment?: number;
  osh_inspection_audit?: number;
  accident_investigation?: number;
  /** Reporting period in YYYY-MM format, e.g. "2025-01" */
  period?: string;
}

interface UpdateManageHSEResponse {
  message: string;
  data: ManageHSERecordAPI;
}

interface UseUpdateManageHSERecordReturn {
  /** Call this to submit the update */
  updateRecord: (
    uuid: string,
    payload: UpdateManageHSEPayload,
  ) => Promise<RegionalSummary | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUpdateManageHSERecord(): UseUpdateManageHSERecordReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecord = async (
    uuid: string,
    payload: UpdateManageHSEPayload,
  ): Promise<RegionalSummary | null> => {
    if (!uuid) throw new Error("HSE record UUID is required");

    setLoading(true);
    setError(null);

    try {
      const httpService = new HttpService();

      // Build urlencoded body — only include fields that were provided
      const body = new URLSearchParams();
      if (payload.record_status !== undefined)
        body.append("record_status", payload.record_status);
      if (payload.total_actual_osh_activities !== undefined)
        body.append(
          "total_actual_osh_activities",
          String(payload.total_actual_osh_activities),
        );
      if (payload.target_osh_activities !== undefined)
        body.append(
          "target_osh_activities",
          String(payload.target_osh_activities),
        );
      if (payload.osh_enlightenment !== undefined)
        body.append("osh_enlightenment", String(payload.osh_enlightenment));
      if (payload.osh_inspection_audit !== undefined)
        body.append(
          "osh_inspection_audit",
          String(payload.osh_inspection_audit),
        );
      if (payload.accident_investigation !== undefined)
        body.append(
          "accident_investigation",
          String(payload.accident_investigation),
        );
      if (payload.period !== undefined) body.append("period", payload.period);

      // Passing URLSearchParams directly — axios sets Content-Type automatically
      const response = await httpService.patchData(
        body,
        `/api/hse-ops/manage-hse/${uuid}`,
      );

      const apiRecord: ManageHSERecordAPI = (
        response.data as UpdateManageHSEResponse
      ).data;
      return transformManageHSERecord(apiRecord);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update HSE record";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRecord,
    loading,
    error,
    clearError: () => setError(null),
  };
}
