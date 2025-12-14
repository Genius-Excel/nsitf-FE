"use client";

import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PermissionGuard } from "@/components/permission-guard";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import ScheduleInspectionModal from "@/components/shedule-inspection";
import ViewAllInspectionsModal from "@/components/view-all-inspection";
import { getUserFromStorage } from "@/lib/auth";
import { canManageInspection } from "@/lib/permissions";
import {
  InspectionStatisticsCards,
  InspectionBarChart,
  UpcomingInspectionCard,
  SearchAndFilters,
  InspectionsTable,
} from "./inspectionDesign";
import { InspectionDetailModal } from "./inspectionModal";
import { InspectionUploadModal } from "./inspectionUploadModal";
import { useInspectionDashboard } from "@/hooks/inspection/useInspectionDashboard";
import { useInspectionFilters } from "@/hooks/inspection/useInspectionFilters";
import type {
  InspectionRecord,
  InspectionStatCard,
} from "@/lib/types/inspection";

export default function InspectionManagement() {
  // ============= PERMISSIONS =============
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      // Check backend permissions first
      if (user.permissions && Array.isArray(user.permissions)) {
        const hasBackendPermission = user.permissions.some(p =>
          p === "can_upload_inspection" ||
          p === "can_create_inspection_record" ||
          p === "can_edit_inspection_record"
        );
        console.log("🔍 [InspectionManagement] Checking permissions:", {
          user,
          userRole: user.role,
          backendPermissions: user.permissions,
          hasBackendPermission,
        });
        setCanManage(hasBackendPermission);
      } else {
        // Fallback to role-based permissions
        console.log("🔍 [InspectionManagement] Using role-based permissions:", {
          user,
          userRole: user.role,
          canManage: canManageInspection(user.role),
        });
        setCanManage(canManageInspection(user.role));
      }
    }
  }, []);

  // ============= STATE =============
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<InspectionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceThreshold, setPerformanceThreshold] = useState<number | undefined>(undefined);
  const [periodFilter, setPeriodFilter] = useState("");

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
    module: "inspection",
  });

  const { data, loading, error } = useInspectionDashboard(apiParams);
  const { filteredRecords, totalCount, filteredCount } = useInspectionFilters(
    data?.inspectionSummary || [],
    { searchTerm, performanceThreshold, periodFilter }
  );

  // Debug logging
  console.log("🔍 [InspectionManagement] Component state:", {
    loading,
    hasError: !!error,
    error,
    hasData: !!data,
    canManage,
  });

  // ============= COMPUTED VALUES =============
  const hasActiveFilters = searchTerm || performanceThreshold !== undefined || periodFilter;

  // ============= HANDLERS =============
  const handleViewInspection = (inspection: InspectionRecord) => {
    setSelectedInspection(inspection);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInspection(null);
  };

  const handleUploadClick = () => {
    if (!canManage) {
      toast.error("You don't have permission to upload inspection data");
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    // Refresh dashboard after successful upload
    window.location.reload();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setPerformanceThreshold(undefined);
    setPeriodFilter("");
    resetFilters();
  };

  const handleExport = () => {
    if (!canManage) {
      toast.error("You don't have permission to export inspection data");
      return;
    }

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
      ...filteredRecords.map((inspection) =>
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
  };

  // ============= LOADING & ERROR STATES =============
  if (loading) {
    return <LoadingState message="Loading inspection dashboard..." />;
  }

  if (error) {
    return <ErrorState error={new Error(error)} />;
  }

  if (!data) {
    return <ErrorState error={new Error("No dashboard data available")} />;
  }

  // ============= PREPARE STATS =============
  console.log("📊 [InspectionManagement] Preparing stats from data:", data.metricCards);

  const stats: InspectionStatCard[] = [
    {
      title: "Total Inspection",
      value: data.metricCards.totalInspections,
      bgColor: "#3b82f6",
      icon: "notice",
    },
    {
      title: "Cumulative Debt Established",
      value: `₦${(data.metricCards.totalDebtEstablished / 1_000_000).toFixed(
        1
      )}M`,
      bgColor: "#f59e0b",
      icon: "file-text",
    },
    {
      title: "Demand Notice",
      value: data.metricCards.totalDemandNotice,
      bgColor: "#22c55e",
      icon: "alert-circle",
    },
    {
      title: "Performance Rate",
      value: `${data.metricCards.performanceRate}%`,
      bgColor: "#3b82f6",
      icon: "trending-up",
    },
    {
      title: "Cumulative Debt Recovered",
      value: `₦${(data.metricCards.totalDebtRecovered / 1_000_000).toFixed(
        1
      )}M`,
      bgColor: "#16a34a",
      icon: "naira-sign",
    },
  ];

  console.log("📊 [InspectionManagement] Stats array to render:", stats);

  // ============= RENDER =============
  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="Inspection Management"
        description="Track and manage employer inspections, compliance letters, and debt recovery"
        action={
          <PermissionGuard permission="manage_inspection" fallback={null}>
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

      {/* Statistics Cards */}
      <InspectionStatisticsCards stats={stats} />

      {/* Bar Chart */}
      <InspectionBarChart data={data.monthlyDebtsComparison} />

      {/* Search and Filters with Upload Button */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onExport={handleExport}
          />
        </div>
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <Upload size={16} />
          Upload Inspection Data
        </button>
      </div>

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

      {/* Inspections Table */}
      <InspectionsTable
        inspections={filteredRecords}
        onView={handleViewInspection}
      />

      {/* Upcoming Inspections Card */}
      <Card>
        <CardHeader className="flex justify-between items-center flex-row">
          <h2 className="text-xl font-semibold">Upcoming Inspections</h2>
          <Button variant="outline" onClick={() => setIsViewAllModalOpen(true)}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.upcomingInspections.length > 0 ? (
            data.upcomingInspections
              .slice(0, 4)
              .map((inspection) => (
                <UpcomingInspectionCard
                  key={inspection.id}
                  companyName={inspection.employer}
                  date={inspection.date}
                  inspectorName={inspection.inspector}
                  location={inspection.location}
                  status={inspection.status}
                />
              ))
          ) : (
            <p className="text-gray-500">No upcoming inspections</p>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ScheduleInspectionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <ViewAllInspectionsModal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        inspections={data.upcomingInspections}
      />

      <InspectionDetailModal
        inspection={selectedInspection}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      <InspectionUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
