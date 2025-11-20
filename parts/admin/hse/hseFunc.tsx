"use client";

import { useState } from "react";
import {
  useGetHSEDashboard,
  useGetHSERecordDetail,
} from "@/hooks/useGetHSEDashboard";
import { MetricCard } from "@/components/design-system/MetricCard";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { PageHeader } from "@/components/design-system/PageHeader";
import type { HSEDashboardResponse } from "@/lib/types/hse";

export function HSEDashboardContent() {
  const [selectedView, setSelectedView] = useState<"table" | "activities">(
    "table"
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Fetch dashboard data
  const { data, isLoading, error } = useGetHSEDashboard(selectedView);

  // Fetch detail for modal (only when record selected)
  const { data: detailData } = useGetHSERecordDetail(
    selectedRecordId || undefined
  );

  if (isLoading) {
    return <LoadingState message="Loading HSE Dashboard..." />;
  }

  if (error) {
    return <ErrorState error={error as Error} />;
  }

  if (!data) {
    return <ErrorState error={new Error("No data available")} />;
  }

  // Type guard for table view
  const isTableView = (data: any): data is HSEDashboardResponse => {
    return "data" in data && "metric_cards" in data.data;
  };

  if (!isTableView(data)) {
    // Handle activities view
    return <HSEActivitiesView data={data} />;
  }

  const { metric_cards, regional_summary, filters } = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="HSE Management Dashboard"
        subtitle={`Period: ${filters.as_of}`}
      />

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedView("table")}
          className={`px-4 py-2 rounded ${
            selectedView === "table" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setSelectedView("activities")}
          className={`px-4 py-2 rounded ${
            selectedView === "activities"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Activities View
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total OSH Activities"
          value={metric_cards.total_actual_osh_activities}
          subtitle={`Target: ${metric_cards.target_osh_activities}`}
          trend={metric_cards.performance_rate}
        />
        <MetricCard
          title="Performance Rate"
          value={`${metric_cards.performance_rate}%`}
          trend={metric_cards.performance_rate >= 50 ? "up" : "down"}
        />
        <MetricCard
          title="OSH Enlightenment"
          value={metric_cards.osh_enlightenment}
        />
        <MetricCard title="OSH Audits" value={metric_cards.osh_audit} />
      </div>

      {/* Regional Summary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Regional Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regional_summary.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.total_actual_osh_activities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.target_osh_activities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.performance_rate >= 50
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.performance_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <button
                      onClick={() => setSelectedRecordId(record.id)}
                      className="hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecordId && detailData && (
        <HSEDetailModal
          data={detailData}
          onClose={() => setSelectedRecordId(null)}
        />
      )}
    </div>
  );
}

// Activities View Component
function HSEActivitiesView({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Recent HSE Activities" />
      <div className="grid gap-4">
        {data.data.map((activity: any) => (
          <div key={activity.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{activity.employer}</h3>
                <p className="text-sm text-gray-500">{activity.record_type}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  activity.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {activity.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {activity.details || "No details available"}
            </p>
            <div className="mt-4 flex gap-4 text-sm text-gray-500">
              <span>Compliance: {activity.safety_compliance_rate}%</span>
              <span>
                Date: {new Date(activity.date_logged).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail Modal Component
function HSEDetailModal({ data, onClose }: { data: any; onClose: () => void }) {
  const {
    location_information,
    performance_metrics,
    target_vs_actual,
    activity_breakdown,
  } = data.data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {location_information.region} - {location_information.branch}
            </h2>
            <p className="text-gray-500">{location_information.period}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Performance Metrics */}
          <div>
            <h3 className="font-semibold mb-2">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Performance Rate</p>
                <p className="text-2xl font-bold">
                  {performance_metrics.performance_rate}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Achievement Rate</p>
                <p className="text-2xl font-bold">
                  {performance_metrics.achievement_rate}%
                </p>
              </div>
            </div>
          </div>

          {/* Target vs Actual */}
          <div>
            <h3 className="font-semibold mb-2">Target vs Actual</h3>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <div className="flex justify-between">
                <span>Target Activities:</span>
                <span className="font-semibold">
                  {target_vs_actual.target_activities}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Actual Activities:</span>
                <span className="font-semibold">
                  {target_vs_actual.actual_activities}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Variance:</span>
                <span
                  className={`font-semibold ${
                    target_vs_actual.variance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {target_vs_actual.variance}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div>
            <h3 className="font-semibold mb-2">Activity Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>OSH Enlightenment</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {activity_breakdown.osh_enlightenment}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({activity_breakdown.osh_enlightenment_pct}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>OSH Audit</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {activity_breakdown.osh_audit}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({activity_breakdown.osh_audit_pct}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Accident Investigation</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {activity_breakdown.accident_investigation}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({activity_breakdown.accident_investigation_pct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
