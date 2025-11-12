import { useState, useEffect, useCallback } from "react";
import HttpService from "../services/httpServices";
import { routes } from "../services/apiRoutes";
import { ErrorHandler } from "../services/errorHandler";

const httpService = new HttpService();

export const useGetInspectionDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await httpService.getData(
        routes.getInspectionDashboardMetrics()
      );
      setData(response.data);
    } catch (err: any) {
      const message = ErrorHandler(err);
      console.error("Inspection dashboard fetch failed:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (data) console.log("INSPECTION DASHBOARD DATA:", data);
  }, [data]);

  return { data, loading, error, refetch: fetchDashboard };
};
