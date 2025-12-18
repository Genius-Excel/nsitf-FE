// ============================================================================
// Investment & Treasury Management Service
// ============================================================================
// API service layer for ITM module using Axios
// ============================================================================

import axios from "axios";
import type {
  InvestmentDashboardData,
  InvestmentRecord,
  InvestmentFilterParams,
  BulkActionPayload,
  BulkActionResponse,
  InvestmentUploadPayload,
} from "@/lib/types/investment";

const BASE_URL = "/api/investment-treasury";

// ============================================================================
// GET: Fetch Investment Dashboard Data
// ============================================================================
export const getInvestmentDashboard = async (
  params?: InvestmentFilterParams
): Promise<InvestmentDashboardData> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        region_id: params?.regionId,
        branch_id: params?.branchId,
        period: params?.selectedMonth && params?.selectedYear 
          ? `${params.selectedYear}-${params.selectedMonth.padStart(2, "0")}`
          : undefined,
        period_from: params?.periodFrom,
        period_to: params?.periodTo,
        record_status: params?.recordStatus || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching investment dashboard:", error);
    throw error;
  }
};

// ============================================================================
// GET: Fetch All Investment Records (for table)
// ============================================================================
export const getInvestmentRecords = async (
  params?: InvestmentFilterParams & { page?: number; limit?: number }
): Promise<{ records: InvestmentRecord[]; total: number }> => {
  try {
    const response = await axios.get(`${BASE_URL}/records`, {
      params: {
        region_id: params?.regionId,
        branch_id: params?.branchId,
        period_from: params?.periodFrom,
        period_to: params?.periodTo,
        record_status: params?.recordStatus || undefined,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching investment records:", error);
    throw error;
  }
};

// ============================================================================
// GET: Fetch Single Investment Record
// ============================================================================
export const getInvestmentRecord = async (
  recordId: string
): Promise<InvestmentRecord> => {
  try {
    const response = await axios.get(`${BASE_URL}/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching investment record:", error);
    throw error;
  }
};

// ============================================================================
// POST: Upload Investment Records (Excel/CSV)
// ============================================================================
export const uploadInvestmentRecords = async (
  payload: InvestmentUploadPayload
): Promise<{ success: boolean; recordCount: number; message: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("period", payload.period);
    if (payload.regionId) formData.append("region_id", payload.regionId);
    if (payload.branchId) formData.append("branch_id", payload.branchId);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading investment records:", error);
    throw error;
  }
};

// ============================================================================
// POST: Bulk Review Investment Records
// ============================================================================
export const bulkReviewInvestmentRecords = async (
  payload: BulkActionPayload
): Promise<BulkActionResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/bulk-review`, {
      record_ids: payload.recordIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk reviewing investment records:", error);
    throw error;
  }
};

// ============================================================================
// POST: Bulk Approve Investment Records
// ============================================================================
export const bulkApproveInvestmentRecords = async (
  payload: BulkActionPayload
): Promise<BulkActionResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/bulk-approve`, {
      record_ids: payload.recordIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk approving investment records:", error);
    throw error;
  }
};

// ============================================================================
// DELETE: Delete Investment Record
// ============================================================================
export const deleteInvestmentRecord = async (
  recordId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`${BASE_URL}/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting investment record:", error);
    throw error;
  }
};
