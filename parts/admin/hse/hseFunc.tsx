// ============================================================================
// HSE Management Dashboard - Refactored
// ============================================================================
// Clean component that uses hooks for all business logic
// No mock data, no inline logic, just composition
// ============================================================================

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { SearchBar } from "@/components/design-system/SearchBar";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import {
  StatisticsCards,
  RecentHSEActivities,
  MonthlySummary,
  ComplianceRate,
  HSERecordsTable,
} from "./hseDesign";
import { HSEFormModal, ViewDetailsModal } from "./hseModal";
import { useHSEDashboard } from "@/hooks/hse/useGetHSEDashboard";
import { useHSERecords } from "@/hooks/hse/useHSERecords";
import { useHSEFilters } from "@/hooks/hse/useHSEFilters";
import { useCreateHSERecord } from "@/hooks/hse/useCreateHSERecord";
import { useUpdateHSERecord } from "@/hooks/hse/useUpdateHSERecord";
import { useDeleteHSERecord } from "@/hooks/hse/useDeleteHSERecord";
import type { HSERecord, HSEFormData, HSEStatCard } from "@/lib/types/hse";

export default function HSEDashboardContent() {
  // ============= STATE =============
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HSERecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<HSEFormData>({
    recordType: "",
    employer: "",
    safetyComplianceRate: "",
    dateLogged: "",
    status: "",
    details: "",
    recommendations: "",
  });

  // ============= HOOKS =============
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useHSEDashboard();
  const {
    data: records,
    loading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useHSERecords();
  const { filteredRecords } = useHSEFilters(records, { searchTerm });
  const { createRecord, loading: creating } = useCreateHSERecord();
  const { updateRecord, loading: updating } = useUpdateHSERecord();
  const { deleteRecord, loading: deleting } = useDeleteHSERecord();

  // ============= HANDLERS =============
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      recordType: "",
      employer: "",
      safetyComplianceRate: "",
      dateLogged: "",
      status: "",
      details: "",
      recommendations: "",
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (record: HSERecord) => {
    setIsEditing(true);
    setSelectedRecord(record);
    setFormData({
      recordType: record.recordType,
      employer: record.employer,
      safetyComplianceRate: record.safetyComplianceRate.toString(),
      dateLogged: record.dateLogged,
      status: record.status,
      details: record.details,
      recommendations: record.recommendations,
    });
    setIsFormModalOpen(true);
  };

  const handleSave = async () => {
    if (isEditing && selectedRecord) {
      const success = await updateRecord(selectedRecord.id, {
        details: formData.details,
        status: formData.status,
        recommendations: formData.recommendations,
      });
      if (success) {
        setIsFormModalOpen(false);
        refetchRecords();
        refetchDashboard();
      }
    } else {
      const created = await createRecord(formData);
      if (created) {
        setIsFormModalOpen(false);
        refetchRecords();
        refetchDashboard();
      }
    }
  };

  const handleViewDetails = (record: HSERecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  // ============= LOADING & ERROR STATES =============
  if (dashboardLoading || recordsLoading) {
    return <LoadingState message="Loading HSE dashboard..." />;
  }

  if (dashboardError || recordsError) {
    return (
      <ErrorState
        error={new Error(dashboardError || recordsError || "Unknown error")}
      />
    );
  }

  if (!dashboardData) {
    return <ErrorState error={new Error("No dashboard data available")} />;
  }

  // ============= PREPARE STATS =============
  const stats: HSEStatCard[] = [
    {
      title: "Total OSH Activities",
      value: dashboardData.metricCards.totalActualOSHActivities,
      colorScheme: "blue",
      description: `Target: ${dashboardData.metricCards.targetOSHActivities}`,
    },
    {
      title: "Performance Rate",
      value: `${dashboardData.metricCards.performanceRate.toFixed(1)}%`,
      colorScheme:
        dashboardData.metricCards.performanceRate >= 80
          ? "green"
          : dashboardData.metricCards.performanceRate >= 60
          ? "orange"
          : "gray",
    },
    {
      title: "OSH Enlightenment",
      value: dashboardData.metricCards.oshEnlightenment,
      colorScheme: "green",
    },
    {
      title: "OSH Audit",
      value: dashboardData.metricCards.oshAudit,
      colorScheme: "orange",
    },
    {
      title: "Accident Investigation",
      value: dashboardData.metricCards.accidentInvestigation,
      colorScheme: "purple",
    },
  ];

  const summaryData = [
    {
      label: "Total Actual Activities",
      value: dashboardData.metricCards.totalActualOSHActivities,
    },
    {
      label: "Target Activities",
      value: dashboardData.metricCards.targetOSHActivities,
    },
    {
      label: "OSH Enlightenment",
      value: dashboardData.metricCards.oshEnlightenment,
    },
    {
      label: "OSH Audit",
      value: dashboardData.metricCards.oshAudit,
    },
  ];

  // ============= RENDER =============
  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="HSE Management Dashboard"
        description="Health, Safety, and Environment monitoring and compliance tracking"
        action={
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus size={20} />
            Add HSE Record
          </button>
        }
      />

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} />

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySummary data={summaryData} />
        <ComplianceRate
          percentage={dashboardData.metricCards.performanceRate}
          change={`Period: ${dashboardData.filters.asOf}`}
        />
      </div>

      {/* Regional Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Regional OSH Activities Summary
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Performance by region and branch for {dashboardData.filters.period}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Branch
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Total Activities
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Target
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Performance
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Enlightenment
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Audit
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Investigation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.regionalSummary.map((region) => (
                <tr key={region.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {region.region}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {region.branch}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {region.totalActualOSHActivities}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {region.targetOSHActivities}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        region.performanceRate >= 80
                          ? "bg-green-100 text-green-700"
                          : region.performanceRate >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {region.performanceRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {region.oshEnlightenment}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {region.oshInspectionAudit}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {region.accidentInvestigation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search HSE records..."
      />

      {/* Records Table */}
      <HSERecordsTable
        records={filteredRecords}
        onViewDetails={handleViewDetails}
      />

      {/* Modals */}
      <HSEFormModal
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSave={handleSave}
        formData={formData}
        onFormChange={setFormData}
        isEditing={isEditing}
      />

      <ViewDetailsModal
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        activity={
          selectedRecord
            ? {
                id: selectedRecord.id,
                type: selectedRecord.recordType,
                organization: selectedRecord.employer,
                date: selectedRecord.dateLogged,
                status: selectedRecord.status,
                details: selectedRecord.details,
                recommendations: selectedRecord.recommendations,
                icon: "📋",
              }
            : null
        }
      />
    </div>
  );
}
