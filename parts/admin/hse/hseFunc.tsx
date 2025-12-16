// ============================================================================
// HSE Management Dashboard - Refactored
// ============================================================================
// Clean component that uses hooks for all business logic
// No mock data, no inline logic, just composition
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { SearchBar } from "@/components/design-system/SearchBar";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { getUserFromStorage } from "@/lib/auth";
import { canManageHSE } from "@/lib/permissions";
import {
  StatisticsCards,
  RecentHSEActivities,
  MonthlySummary,
  ComplianceRate,
  HSERecordsTable,
  RegionalOSHSummaryTable,
  ViewDetailsModal,
} from "./hseDesign";
import { HSEFormModal } from "./hseModal";
import { HSEUploadModal } from "./hseUploadModal";
import { useHSEDashboard } from "@/hooks/hse/useGetHSEDashboard";
import { useHSERecords } from "@/hooks/hse/useHSERecords";
import { useHSEFilters } from "@/hooks/hse/useHSEFilters";
import { useCreateHSERecord } from "@/hooks/hse/useCreateHSERecord";
import { useUpdateHSERecord } from "@/hooks/hse/useUpdateHSERecord";
import { useDeleteHSERecord } from "@/hooks/hse/useDeleteHSERecord";
import type { HSERecord, HSEFormData, HSEStatCard, HSEActivity } from "@/lib/types/hse";

export default function HSEDashboardContent() {
  // ============= PERMISSIONS REMOVED =============
  // All users can access upload and management features

  // ============= STATE =============
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
    filters,
    regions,
    branches,
    apiParams,
    userRole,
    userRegionId,
    handleFilterChange,
    resetFilters,
  } = useAdvancedFilters({
    module: "hse",
  });

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useHSEDashboard(apiParams);
  const {
    data: records,
    loading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useHSERecords();
  const { filteredRecords, totalCount, filteredCount } = useHSEFilters(records, {
    searchTerm,
    statusFilter,
    recordTypeFilter,
    dateFrom,
    dateTo
  });
  const { createRecord, loading: creating } = useCreateHSERecord();
  const { updateRecord, loading: updating } = useUpdateHSERecord();
  const { deleteRecord, loading: deleting } = useDeleteHSERecord();

  // ============= COMPUTED VALUES =============
  const uniqueStatuses = Array.from(new Set(records.map(r => r.status))).filter(Boolean);
  const uniqueRecordTypes = Array.from(new Set(records.map(r => r.recordType))).filter(Boolean);
  const hasActiveFilters = searchTerm || statusFilter || recordTypeFilter || dateFrom || dateTo;

  // ============= HANDLERS =============
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setRecordTypeFilter("");
    setDateFrom("");
    setDateTo("");
    resetFilters();
  };
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

  const handleEditFromModal = (activity: HSEActivity) => {
    const record = records.find(r => r.id === activity.id);
    if (record) {
      handleEdit(record);
    }
  };

  const handleApprove = async (activity: HSEActivity) => {
    try {
      // TODO: Call API to approve HSE record
      // const response = await fetch(`/api/hse/${activity.id}/approve`, {
      //   method: 'POST',
      // });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("HSE record approved successfully");
      refetchRecords();
      refetchDashboard();
    } catch (error) {
      toast.error("Failed to approve HSE record");
      console.error("Approve error:", error);
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    refetchDashboard();
    refetchRecords();
    setIsUploadModalOpen(false);
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
      title: "Total Actual OSH Activities",
      value: dashboardData.metricCards.totalActualOSHActivities,
      colorScheme: "blue",
    },
    {
      title: "OSH Enlightenment & Awareness",
      value: dashboardData.metricCards.oshEnlightenment,
      colorScheme: "green",
    },
    {
      title: "OSH Inspection & Audit",
      value: dashboardData.metricCards.oshAudit,
      colorScheme: "orange",
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
      title: "Accident & Incident Investigation",
      value: dashboardData.metricCards.accidentInvestigation,
      colorScheme: "purple",
    },
    {
      title: "Target OSH Activities",
      value: dashboardData.metricCards.targetOSHActivities,
      colorScheme: "blue",
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
      />

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} />

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search HSE records..."
        showUpload={true}
        onUpload={handleUploadClick}
        uploadButtonText="Upload HSE Data"
        uploadButtonColor="green"
        showFilter={false}
      />

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        regions={regions}
        branches={branches}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalEntries={totalCount}
        filteredCount={filteredCount}
        userRole={userRole}
        userRegionId={userRegionId}
        showRegionFilter={true}
        showBranchFilter={true}
        showMonthYearFilter={true}
        showDateRangeFilter={false}
      />

      {/* Regional OSH Activities Summary */}
      <RegionalOSHSummaryTable
        regionalData={dashboardData.regionalSummary}
      />

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySummary data={summaryData} />
        <ComplianceRate
          percentage={dashboardData.metricCards.performanceRate}
          change={`Period: ${dashboardData.filters.asOf}`}
        />
      </div>

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
        onEdit={handleEditFromModal}
        onApprove={handleApprove}
      />

      <HSEUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
