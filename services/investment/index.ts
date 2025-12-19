// ============================================================================
// Investment & Treasury Management Service
// ============================================================================
// API service layer for ITM module using Axios
// ============================================================================

import axios from "axios";
import { getAccessToken } from "@/lib/utils";
import type {
  InvestmentDashboardData,
  InvestmentMetricsResponse,
  InvestmentRecord,
  InvestmentFilterParams,
  BulkActionPayload,
  BulkActionResponse,
  InvestmentUploadPayload,
} from "@/lib/types/investment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const BASE_URL = `${API_BASE_URL}/api/investments/manage-investments`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Transform snake_case API response to camelCase frontend format
const transformInvestmentRecord = (record: any): InvestmentRecord => {
  return {
    id: record.id,
    month: record.month,
    contributionsPrivateSector: record.private_sector_contribution_collected,
    contributionsPublicTreasury: record.public_treasury_contribution_collected,
    contributionsPublicNonTreasury:
      record.public_non_treasury_contribution_collected,
    contributionsInformalEconomy:
      record.informal_economy_contribution_collected,
    rentalFees: record.rental_fees,
    ecsRegistrationFees: record.ecs_registration_fees,
    ecsCertificateFees: record.ecs_certificate_fees,
    debtRecovered: record.debt_recovered,
    period: record.period,
    recordStatus: record.record_status,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    createdBy: record.created_by,
    reviewedBy: record.reviewed_by,
    approvedBy: record.approved_by,
    regionId: record.region_id,
    branchId: record.branch_id,
    region: record.region,
    branch: record.branch,
  };
};

// Transform camelCase frontend data to snake_case API format
const transformToApiFormat = (data: Partial<InvestmentRecord>): any => {
  const apiData: any = {};

  if (data.contributionsPrivateSector !== undefined)
    apiData.private_sector_contribution_collected =
      data.contributionsPrivateSector;
  if (data.contributionsPublicTreasury !== undefined)
    apiData.public_treasury_contribution_collected =
      data.contributionsPublicTreasury;
  if (data.contributionsPublicNonTreasury !== undefined)
    apiData.public_non_treasury_contribution_collected =
      data.contributionsPublicNonTreasury;
  if (data.contributionsInformalEconomy !== undefined)
    apiData.informal_economy_contribution_collected =
      data.contributionsInformalEconomy;
  if (data.rentalFees !== undefined) apiData.rental_fees = data.rentalFees;
  if (data.ecsRegistrationFees !== undefined)
    apiData.ecs_registration_fees = data.ecsRegistrationFees;
  if (data.ecsCertificateFees !== undefined)
    apiData.ecs_certificate_fees = data.ecsCertificateFees;
  if (data.debtRecovered !== undefined)
    apiData.debt_recovered = data.debtRecovered;
  if (data.recordStatus !== undefined)
    apiData.record_status = data.recordStatus;

  return apiData;
};

// ============================================================================
// GET: Fetch Investment Metrics
// ============================================================================
export const getInvestmentMetrics = async (
  params?: InvestmentFilterParams
): Promise<InvestmentMetricsResponse> => {
  try {
    // Build params object, only include defined values
    const apiParams: any = {};

    if (params?.selectedMonth) apiParams.month = params.selectedMonth;
    if (params?.periodFrom) apiParams.period_from = params.periodFrom;
    if (params?.periodTo) apiParams.period_to = params.periodTo;

    const response = await axios.get(
      `${API_BASE_URL}/api/investments/metrics`,
      {
        headers: getAuthHeaders(),
        params: apiParams,
      }
    );

    // API returns { message, data: {...} }
    const apiResponse = response.data;

    if (!apiResponse.data) {
      throw new Error("Invalid API response structure");
    }

    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching investment metrics:", error);
    throw error;
  }
};

// ============================================================================
// GET: Fetch Investment Dashboard Data (Records + Metrics)
// ============================================================================
export const getInvestmentDashboard = async (
  params?: InvestmentFilterParams
): Promise<InvestmentDashboardData> => {
  try {
    // Fetch both metrics and records in parallel
    const [metricsResponse, recordsResponse] = await Promise.all([
      getInvestmentMetrics(params),
      getInvestmentRecords(params),
    ]);

    // Return combined data
    return {
      metrics: metricsResponse.metric_cards,
      records: recordsResponse.records,
      monthlyContributionTrend: metricsResponse.monthly_contribution_trend,
      debtRecoveryPerformance: metricsResponse.debt_recovery_performance,
      totalRecords: recordsResponse.total,
      filteredRecords: recordsResponse.total,
    };
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
    // Build params object, only include defined values
    const apiParams: any = {};

    if (params?.regionId) apiParams.region_id = params.regionId;
    if (params?.branchId) apiParams.branch_id = params.branchId;
    if (params?.selectedMonth && params?.selectedYear) {
      apiParams.period = `${
        params.selectedYear
      }-${params.selectedMonth.padStart(2, "0")}`;
    }
    if (params?.periodFrom) apiParams.period_from = params.periodFrom;
    if (params?.periodTo) apiParams.period_to = params.periodTo;
    if (params?.recordStatus) apiParams.record_status = params.recordStatus;
    if (params?.page) apiParams.page = params.page;
    if (params?.limit) apiParams.limit = params.limit;

    const response = await axios.get(BASE_URL, {
      headers: getAuthHeaders(),
      params: apiParams,
    });

    const apiResponse = response.data;

    // Transform the data array - API returns { message, data: [...] }
    let transformedRecords: InvestmentRecord[] = [];
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      transformedRecords = apiResponse.data.map(transformInvestmentRecord);
    }

    return {
      records: transformedRecords,
      total: transformedRecords.length,
    };
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
    const response = await axios.get(`${BASE_URL}/${recordId}`, {
      headers: getAuthHeaders(),
    });

    // API returns { message, data: {...} }
    // Extract the actual record from response.data.data
    const apiResponse = response.data;
    if (!apiResponse.data) {
      throw new Error("Invalid API response structure");
    }

    // Transform the response data
    return transformInvestmentRecord(apiResponse.data);
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
): Promise<{
  success: boolean;
  message: string;
  batch_id?: string;
  status?: string;
  error_report?: any;
}> => {
  try {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("period", payload.period);
    formData.append("sheet", "INVESTMENTS");

    const response = await axios.post(
      `${API_BASE_URL}/api/investments/reports`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // API returns: { message, batch_id, status, error_report }
    // Transform to match expected format
    const data = response.data;
    return {
      success: data.status === "completed" && !data.error_report,
      message: data.message || "Upload processed",
      batch_id: data.batch_id,
      status: data.status,
      error_report: data.error_report,
    };
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
    const response = await axios.post(
      BASE_URL,
      {
        ids: payload.recordIds,
        action: "review",
      },
      {
        headers: getAuthHeaders(),
      }
    );
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
    const response = await axios.post(
      BASE_URL,
      {
        ids: payload.recordIds,
        action: "approve",
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error bulk approving investment records:", error);
    throw error;
  }
};

// ============================================================================
// PATCH: Update Investment Record
// ============================================================================
export const updateInvestmentRecord = async (
  recordId: string,
  data: Partial<InvestmentRecord>
): Promise<{ success: boolean; message: string; data: InvestmentRecord }> => {
  try {
    // Transform camelCase to snake_case for API
    const apiData = transformToApiFormat(data);

    const response = await axios.patch(`${BASE_URL}/${recordId}`, apiData, {
      headers: getAuthHeaders(),
    });

    // Transform response back to camelCase
    const result = response.data;
    if (result.data) {
      result.data = transformInvestmentRecord(result.data);
    }

    return result;
  } catch (error) {
    console.error("Error updating investment record:", error);
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
    const response = await axios.delete(`${BASE_URL}/${recordId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting investment record:", error);
    throw error;
  }
};
