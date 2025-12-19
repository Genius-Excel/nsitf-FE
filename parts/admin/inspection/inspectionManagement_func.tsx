"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PermissionGuard } from "@/components/permission-guard";
import { PageHeader } from "@/components/design-system/PageHeader";
import { MetricsFilter } from "@/components/design-system/MetricsFilter";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import ScheduleInspectionModal from "@/components/shedule-inspection";
import ViewAllInspectionsModal from "@/components/view-all-inspection";
import {
  InspectionStatisticsCards,
  InspectionBarChart,
  UpcomingInspectionCard,
  SearchAndFilters,
  InspectionsTable,
} from "./inspectionDesign";
import { InspectionDetailModal } from "./inspectionModal";
import { InspectionUploadModal } from "./inspectionUploadModal";
import { useManageInspections } from "@/hooks/inspection/UsemanageInspections";
import { useInspectionMetrics } from "@/hooks/inspection/UseinspectionMetrics";
import { useSingleInspection } from "@/hooks/inspection/UsesingleInspection";
import type {
  InspectionRecord,
  InspectionStatCard,
} from "@/lib/types/inspection";

export default function InspectionManagement() {
  // ============= STATE =============
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<
    string | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Metrics filters state
  const [metricsFilters, setMetricsFilters] = useState({
    selectedMonth: undefined as string | undefined,
    selectedYear: undefined as string | undefined,
    periodFrom: undefined as string | undefined,
    periodTo: undefined as string | undefined,
  });

  const handleMetricsFilterChange = (newFilters: typeof metricsFilters) => {
    setMetricsFilters(newFilters);
  };

  const handleResetMetricsFilters = () => {
    setMetricsFilters({
      selectedMonth: undefined,
      selectedYear: undefined,
      periodFrom: undefined,
      periodTo: undefined,
    });
  };

  // ============= ADVANCED FILTERS =============
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
    module: "inspection",
  });

  // ============= MEMOIZE PARAMS =============
  const manageInspectionsParams = useMemo(
    () => ({
      page: 1,
      branch_id: apiParams.branch_id || undefined,
      region_id: apiParams.region_id || undefined,
      record_status: filters.recordStatus || undefined,
      period: apiParams.period || undefined,
      period_from: apiParams.period_from || undefined,
      period_to: apiParams.period_to || undefined,
    }),
    [
      apiParams.branch_id,
      apiParams.region_id,
      filters.recordStatus,
      apiParams.period,
      apiParams.period_from,
      apiParams.period_to,
    ]
  );

  // ============= API HOOKS =============
  // 1. Fetch inspections from manage-inspections endpoint
  const { inspections, pagination, loading, error, refetch, setPage } =
    useManageInspections(manageInspectionsParams);

  // 2. Fetch dashboard metrics (without filters - shows overall data)
  const { metrics, monthlyChart } = useInspectionMetrics();

  // 3. Fetch single inspection detail (for modal)
  const {
    data: inspectionDetail,
    loading: detailLoading,
    fetchDetail,
    clearDetail,
  } = useSingleInspection();

  // ============= TRANSFORM FLAT DATA TO NESTED STRUCTURE FOR MODAL =============
  const transformedInspectionDetail = useMemo(() => {
    console.log("🔄 [Transform] inspectionDetail:", inspectionDetail);
    console.log("🔄 [Transform] recordStatus:", inspectionDetail?.recordStatus);
    console.log("🔄 [Transform] reviewedBy:", inspectionDetail?.reviewedBy);

    if (!inspectionDetail) return null;

    // Calculate recovery rate and demand notices percent
    const recoveryRate =
      inspectionDetail.debtEstablished > 0
        ? (inspectionDetail.debtRecovered / inspectionDetail.debtEstablished) *
          100
        : 0;

    const demandNoticesPercent =
      inspectionDetail.inspectionsConducted > 0
        ? (inspectionDetail.demandNotice /
            inspectionDetail.inspectionsConducted) *
          100
        : 0;

    const outstandingDebt =
      inspectionDetail.debtEstablished - inspectionDetail.debtRecovered;

    const averageDebtPerInspection =
      inspectionDetail.inspectionsConducted > 0
        ? inspectionDetail.debtEstablished /
          inspectionDetail.inspectionsConducted
        : 0;

    return {
      id: inspectionDetail.id,
      branchInformation: {
        branchName: inspectionDetail.branch,
        region: inspectionDetail.region,
        period: inspectionDetail.period,
      },
      performanceMetrics: {
        performanceRate: inspectionDetail.performanceRate,
        recoveryRate: Math.round(recoveryRate * 10) / 10,
      },
      inspectionActivity: {
        inspectionsConducted: inspectionDetail.inspectionsConducted,
        demandNoticesIssued: inspectionDetail.demandNotice,
        demandNoticesPercent: Math.round(demandNoticesPercent * 10) / 10,
      },
      financialSummary: {
        debtEstablished: inspectionDetail.debtEstablished,
        debtRecovered: inspectionDetail.debtRecovered,
        outstandingDebt: outstandingDebt,
        averageDebtPerInspection: averageDebtPerInspection,
      },
      // Audit fields (nested like claims)
      audit: {
        recordStatus: inspectionDetail.recordStatus,
        reviewedBy: inspectionDetail.reviewedBy,
        approvedBy: inspectionDetail.approvedBy,
      },
    };
  }, [inspectionDetail]);

  // ============= CLIENT-SIDE FILTERING =============
  const filteredInspections = useMemo(() => {
    if (!searchTerm) return inspections;

    const lowerSearch = searchTerm.toLowerCase();
    return inspections.filter(
      (inspection) =>
        inspection.branch.toLowerCase().includes(lowerSearch) ||
        inspection.region?.toLowerCase().includes(lowerSearch) ||
        inspection.period.toLowerCase().includes(lowerSearch)
    );
  }, [inspections, searchTerm]);

  // ============= COMPUTED VALUES =============
  const hasActiveFilters = searchTerm;

  // ============= HANDLERS =============
  const handleViewInspection = useCallback(
    (inspection: InspectionRecord) => {
      console.log(
        "🔍 [handleViewInspection] Opening modal for:",
        inspection.id,
        inspection
      );
      setSelectedInspectionId(inspection.id);
      // Use list data directly since detail endpoint doesn't include audit fields
      fetchDetail(inspection.id);
      setIsDetailModalOpen(true);
    },
    [fetchDetail]
  );

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedInspectionId(null);
    clearDetail();
  }, [clearDetail]);

  const handleRefreshAfterUpdate = useCallback(() => {
    console.log("🔄 [handleRefreshAfterUpdate] Refreshing data...");
    console.log(
      "🔄 [handleRefreshAfterUpdate] Selected ID:",
      selectedInspectionId
    );
    refetch();
    if (selectedInspectionId) {
      console.log(
        "🔄 [handleRefreshAfterUpdate] Fetching detail for:",
        selectedInspectionId
      );
      fetchDetail(selectedInspectionId);
    }
  }, [refetch, fetchDetail, selectedInspectionId]);

  const handleUploadClick = useCallback(() => {
    setIsUploadModalOpen(true);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    refetch();
    setIsUploadModalOpen(false);
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    resetFilters();
  }, [resetFilters]);

  const handleExport = useCallback(() => {
    const headers = [
      "Branch",
      "Inspections Conducted",
      "Debt Established (₦)",
      "Debt Recovered (₦)",
      "Performance Rate (%)",
      "Demand Notice",
      "Period",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredInspections.map((inspection) =>
        [
          `"${inspection.branch}"`,
          inspection.inspectionsConducted,
          inspection.debtEstablished,
          inspection.debtRecovered,
          inspection.performanceRate,
          inspection.demandNotice,
          inspection.period,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inspection-records-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredInspections]);

  // ============= PREPARE STATS =============
  const stats: InspectionStatCard[] = useMemo(() => {
    console.log("🔍 [InspectionManagement] Computing stats, metrics:", metrics);

    if (!metrics) {
      console.log(
        "⚠️ [InspectionManagement] No metrics available, returning empty array"
      );
      return [];
    }

    const computedStats = [
      {
        title: "Total Inspection",
        value: metrics.totalInspections,
        bgColor: "#3b82f6",
        icon: "notice",
      },
      {
        title: "Demand Notice",
        value: metrics.totalDemandNotice,
        bgColor: "#22c55e",
        icon: "alert-circle",
      },
      {
        title: "Cumulative Debt Established",
        value: `₦${(metrics.totalDebtEstablished / 1_000_000).toFixed(1)}M`,
        bgColor: "#f59e0b",
        icon: "file-text",
      },
      {
        title: "Cumulative Debt Recovered",
        value: `₦${(metrics.totalDebtRecovered / 1_000_000).toFixed(1)}M`,
        bgColor: "#16a34a",
        icon: "naira-sign",
      },
      {
        title: "Performance Rate",
        value: `${metrics.performanceRate}%`,
        bgColor: "#3b82f6",
        icon: "trending-up",
      },
    ];

    console.log("✅ [InspectionManagement] Stats computed:", computedStats);
    return computedStats;
  }, [metrics]);

  // ============= MONTHLY CHART DATA =============
  const chartData = useMemo(() => {
    if (!monthlyChart) return { data: [], scale: { max: 0, ticks: [] } };

    const maxValue = Math.max(
      ...monthlyChart.map((d) =>
        Math.max(d.debtsEstablished || 0, d.debtsRecovered || 0)
      )
    );

    return {
      data: monthlyChart,
      scale: {
        max: maxValue,
        ticks: Array.from({ length: 6 }, (_, i) => (maxValue / 5) * i),
      },
    };
  }, [monthlyChart]);

  // ============= LOADING & ERROR STATES =============
  if (loading) {
    return <LoadingState message="Loading inspection dashboard..." />;
  }

  if (error) {
    return <ErrorState error={new Error(error)} />;
  }

  // ============= RENDER =============
  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="Inspection Management"
        description="Track and manage employer inspections, compliance letters, and debt recovery"
        action={
          <PermissionGuard permission="manage_inspection" fallback={<></>}>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              <Plus size={16} />
              Schedule Inspection
            </button>
          </PermissionGuard>
        }
      />

      {/* Metrics Filters */}
      <MetricsFilter
        filters={metricsFilters}
        onFilterChange={handleMetricsFilterChange}
        onReset={handleResetMetricsFilters}
      />

      {/* Statistics Cards */}
      <InspectionStatisticsCards stats={stats} />

      {/* Bar Chart */}
      <InspectionBarChart data={chartData} />

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUpload={handleUploadClick}
      />

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        regions={regions}
        branches={branches}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalEntries={inspections.length}
        filteredCount={filteredInspections.length}
        userRole={userRole}
        userRegionId={userRegionId}
        showRegionFilter={true}
        showBranchFilter={true}
        showMonthYearFilter={false}
        showDateRangeFilter={true}
        showRecordStatusFilter={true}
      />

      {/* Inspections Table */}
      <InspectionsTable
        inspections={filteredInspections}
        onView={handleViewInspection}
        onRefresh={handleRefreshAfterUpdate}
      />

      {/* Modals */}
      <ScheduleInspectionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <ViewAllInspectionsModal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        inspections={[]}
      />

      <InspectionDetailModal
        inspection={transformedInspectionDetail}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onRefresh={handleRefreshAfterUpdate}
      />

      <InspectionUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
