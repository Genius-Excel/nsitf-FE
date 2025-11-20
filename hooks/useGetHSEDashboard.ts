"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  HSEDashboardResponse,
  HSEActivitiesResponse,
  HSERecordDetail,
} from "@/lib/types/hse";

const API_URL = "https://nsitf-be.geniusexcel.tech";

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("ACCESS_TOKEN") ||
    process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// HSE Dashboard (Table View)
export function useGetHSEDashboard(view: "table" | "activities" = "table") {
  return useQuery({
    queryKey: ["hse-dashboard", view],
    queryFn: async () => {
      const { data } = await apiClient.get<
        HSEDashboardResponse | HSEActivitiesResponse
      >(`/api/hse-ops/dashboard?view=${view}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

// HSE Record Detail (for modal pop-out)
export function useGetHSERecordDetail(recordId?: string) {
  return useQuery({
    queryKey: ["hse-record-detail", recordId],
    queryFn: async () => {
      const { data } = await apiClient.get<HSERecordDetail>(
        `/api/hse-ops/dashboard/${recordId}/detail`
      );
      return data;
    },
    enabled: !!recordId, // Only run if recordId exists
  });
}
