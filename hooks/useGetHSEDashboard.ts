import { useState, useEffect } from "react";
import HttpService from "@/services/httpServices";
import { routes } from "@/services/apiRoutes";
import { ErrorHandler } from "@/services/errorHandler";

const httpService = new HttpService();

// ======= TYPES =======
export interface HSEActivityAPI {
  id: string;
  record_type: string;
  employer: string;
  details: string;
  recommendations: string;
  safety_compliance_rate: string;
  date_logged: string;
  created_by_name: string;
  status: string;
}

export interface HSEMetricsResponse {
  totals_by_record_type: {
    letter_issued: number;
    osh_awareness: number;
    safety_audit: number;
    incident_investigation: number;
  };
  recent_activities: HSEActivityAPI[];
  monthly_summary: {
    total_activities: number;
    completed: number;
    under_investigation: number;
    follow_up_required: number;
  };
  safety_compliance: {
    overall_rate: number;
    percentage_increase: number;
  };
}

export interface HSERecordAPI {
  id: string;
  region: string;
  branch: string;
  totalActualOSH: number;
  targetOSH: number;
  performanceRate: number;
  oshEnlightenment: number;
  oshInspectionAudit: number;
  accidentInvestigation: number;
  activitiesPeriod: string;
}

// ======= HOOK =======
export const useGetHSEDashboard = () => {
  const [metrics, setMetrics] = useState<HSEMetricsResponse | null>(null);
  const [records, setRecords] = useState<HSERecordAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const res = await httpService.getData(routes.getHSEDashboardMetrics());
      setMetrics(res.data.data);
    } catch (err) {
      setError(ErrorHandler(err) ?? "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableRecords = async () => {
    try {
      setLoading(true);
      const res = await httpService.getData(routes.getHSEDashboardTable());
      setRecords(res.data.data || []);
    } catch (err) {
      setError(ErrorHandler(err) ?? "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  return {
    metrics,
    records,
    loading,
    error,
    fetchDashboardMetrics,
    fetchTableRecords,
  };
};

