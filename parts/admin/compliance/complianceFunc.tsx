"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { toast } from "sonner";

// Hooks
import {
  useComplianceDashboard,
  useRegions,
  useRegionMutations,
  useBranchMutations,
  useModalState,
  type RegionalSummary,
} from "@/hooks/compliance";

// Auth & Permissions
import { getUserFromStorage } from "@/lib/auth";
import { canManageCompliance } from "@/lib/permissions";

// Types
import type { ComplianceEntry } from "@/lib/types";

// Components
import { DashboardCards, ComplianceTable } from "./complianceDesign";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { AddRegionModal } from "./complianceAddRegionModal";
import { ManageBranchesModal } from "./complianceManageBranchesModal";
import { ComplianceDetailModal } from "./complianceDetailModal";
import { ComplianceUploadModal } from "./ComplianceUploadModal";
import { PageHeader } from "@/components/design-system/PageHeader";
import { MetricsFilter } from "@/components/design-system/MetricsFilter";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/permission-button";

/**
 * Map API response (RegionalSummary) to component format (ComplianceEntry)
 */
const mapToComplianceEntry = (summary: RegionalSummary): ComplianceEntry => ({
  id: summary.id, // Use the compliance record ID, not region_id
  region: summary.region,
  branch: summary.branch || "",
  contributionCollected: summary.actual_contributions_collected,
  target: summary.contributions_target,
  achievement: summary.performance_rate,
  employersRegistered: summary.employers_registered,
  employees: summary.employees_covered,
  registrationFees: summary.registration_fees,
  certificateFees: summary.certificate_fees,
  period: summary.period,
  recordStatus: (["pending", "reviewed", "approved"].includes(
    summary.record_status as string
  )
    ? summary.record_status
    : undefined) as "pending" | "reviewed" | "approved" | undefined,
  reviewedBy: summary.reviewed_by,
  approvedBy: summary.approved_by,
  createdAt: summary.created_at || new Date().toISOString(),
  updatedAt: summary.updated_at || new Date().toISOString(),
});

/**
 * REFACTORED Compliance Dashboard
 *
 * Key improvements:
 * - API-driven (no localStorage mock data)
 * - Single source of truth (no state duplication)
 * - Memoized filtering (performance optimized)
 * - Clean separation of concerns
 * - Follows Dashboard/Users pattern exactly
 */
const ComplianceDashboard: React.FC = () => {
  // ============== PERMISSIONS ==============
  const [canManage, setCanManage] = useState(false);
  const [canManageRegion, setCanManageRegion] = useState(false);
  const [canManageBranches, setCanManageBranches] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      // Check backend permissions first
      if (user.permissions && Array.isArray(user.permissions)) {
        const hasBackendPermission = user.permissions.some(
          (p) =>
            p === "can_upload_compliance" ||
            p === "can_create_compliance_record" ||
            p === "can_edit_compliance_record"
        );
        setCanManage(hasBackendPermission);
      } else {
        // Fallback to role-based permissions
        setCanManage(canManageCompliance(user.role));
      }

      // Only admin and manager can manage regions
      const normalizedRole = user.role?.toLowerCase();
      setCanManageRegion(
        normalizedRole === "admin" || normalizedRole === "manager"
      );

      // Admin, manager, regional_manager, and regional_officer can manage branches
      setCanManageBranches(
        normalizedRole === "admin" ||
          normalizedRole === "manager" ||
          normalizedRole === "regional_manager" ||
          normalizedRole === "regional_officer"
      );
    }
  }, []);

  // ============== ADVANCED FILTERS ==============
  const {
    filters,
    regions: filterRegions,
    branches: filterBranches,
    apiParams,
    userRole: filterUserRole,
    userRegionId,
    handleFilterChange,
    resetFilters: resetAdvancedFilters,
    fetchBranchesForRegion,
  } = useAdvancedFilters({
    module: "compliance",
  });

  // ============== METRICS FILTERS STATE ==============
  // Metrics filters state (for top cards)
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

  // ============== API FILTERS ==============
  // Metrics filters (for top cards) - from MetricsFilter component
  const metricsApiFilters = useMemo(() => {
    const params: any = {};

    // Single period (Month + Year)
    if (metricsFilters.selectedMonth && metricsFilters.selectedYear) {
      const monthIndex =
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].indexOf(metricsFilters.selectedMonth) + 1;
      const monthStr = monthIndex.toString().padStart(2, "0");
      params.period = `${metricsFilters.selectedYear}-${monthStr}`;
    }

    // Period range
    if (metricsFilters.periodFrom) {
      params.period_from = metricsFilters.periodFrom;
    }
    if (metricsFilters.periodTo) {
      params.period_to = metricsFilters.periodTo;
    }

    return params;
  }, [metricsFilters]);

  // Table filters (for data table) - from AdvancedFilterPanel
  const tableApiFilters = useMemo(
    () => ({
      period: apiParams.period || undefined,
      period_from: apiParams.period_from || undefined,
      period_to: apiParams.period_to || undefined,
      region_id: apiParams.region_id || undefined,
      branch_id: apiParams.branch_id || undefined,
      record_status: apiParams.record_status || undefined,
    }),
    [apiParams]
  );

  // ============== DATA FETCHING ==============
  // Metrics data (for top cards) - controlled by MetricsFilter
  const {
    data: metricsData,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useComplianceDashboard(metricsApiFilters);

  // Table data - controlled by AdvancedFilterPanel
  const {
    data: tableData,
    loading: tableLoading,
    error: tableError,
    refetch: refetchTable,
  } = useComplianceDashboard(tableApiFilters);

  // Combined loading and error states
  const dashboardLoading = metricsLoading || tableLoading;
  const dashboardError = metricsError || tableError;
  const refetchDashboard = async () => {
    refetchMetrics();
    return await refetchTable();
  };

  // Fetch regions list
  const {
    data: regions,
    loading: regionsLoading,
    error: regionsError,
    refetch: refetchRegions,
  } = useRegions();

  // ============== CLIENT-SIDE FILTERING ==============
  // Use table data for the data table (backend-filtered by AdvancedFilterPanel)
  // Backend returns regional_summary when no region filter, branch_summary when region is selected
  const regionalSummary =
    tableData?.regional_summary ?? tableData?.branch_summary ?? [];

  // Additional client-side search filter (optional)
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSummary = useMemo(() => {
    if (!searchTerm) return regionalSummary;

    const searchLower = searchTerm.toLowerCase();
    return regionalSummary.filter(
      (entry: any) =>
        entry.region?.toLowerCase().includes(searchLower) ||
        entry.branch?.toLowerCase().includes(searchLower)
    );
  }, [regionalSummary, searchTerm]);

  // Combined reset function
  const handleResetFilters = () => {
    setSearchTerm("");
    resetAdvancedFilters();
  };

  // Map filtered summary to ComplianceEntry format
  const mappedEntries: ComplianceEntry[] = (filteredSummary || []).map(
    mapToComplianceEntry
  );

  const totalCount = regionalSummary.length;
  const filteredCount = filteredSummary.length;

  // ============== MUTATIONS ==============
  const {
    createRegion,
    deleteRegion,
    isLoading: isMutating,
  } = useRegionMutations({
    onSuccess: () => {
      refetchRegions();
      refetchDashboard();
    },
  });

  const {
    createBranch,
    deleteBranch,
    isLoading: isBranchMutating,
  } = useBranchMutations({
    onSuccess: () => {
      refetchRegions();
      refetchDashboard();
    },
  });

  // Upload is now handled by the modal internally
  // No need for upload hook here

  // ============== MODALS ==============
  const addModal = useModalState(false);
  const branchModal = useModalState(false);
  const detailModal = useModalState(false);
  const uploadModal = useModalState(false);

  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  // Update selectedEntry when mappedEntries changes (reactive pattern like HSE)
  useEffect(() => {
    if (selectedEntry?.id && mappedEntries.length > 0) {
      const updatedEntry = mappedEntries.find((e) => e.id === selectedEntry.id);
      if (updatedEntry) {
        // Only update if data has actually changed (deep comparison of key fields)
        const hasChanged =
          updatedEntry.contributionCollected !==
            selectedEntry.contributionCollected ||
          updatedEntry.target !== selectedEntry.target ||
          updatedEntry.recordStatus !== selectedEntry.recordStatus ||
          updatedEntry.employersRegistered !==
            selectedEntry.employersRegistered;

        if (hasChanged) {
          console.log(
            "📊 [Compliance] Auto-updating selectedEntry with fresh data"
          );
          setSelectedEntry(updatedEntry);
        }
      }
    }
  }, [mappedEntries, selectedEntry]);

  // ============== HANDLERS ==============
  const handleAddRegion = async (name: string) => {
    if (!canManage) {
      toast.error("You don't have permission to create regions");
      return;
    }
    try {
      await createRegion({ name });
    } catch (err) {
      // Error handled in mutation hook
    }
  };

  const handleDeleteRegion = async (regionId: string, regionName: string) => {
    if (!canManage) {
      toast.error("You don't have permission to delete regions");
      return;
    }

    // Use toast with custom action for confirmation
    toast.error(`Delete region '${regionName}'?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteRegion(regionId, regionName);
          } catch (err) {
            // Error handled in mutation hook
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleAddBranch = async (
    name: string,
    regionId: string,
    code?: string
  ) => {
    if (!canManage) {
      toast.error("You don't have permission to create branches");
      return;
    }
    try {
      await createBranch({ name, region_id: regionId, code });
    } catch (err) {
      // Error handled in mutation hook
    }
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (!canManage) {
      toast.error("You don't have permission to delete branches");
      return;
    }

    // Use toast with custom action for confirmation
    toast.error(`Delete branch '${branchName}'?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteBranch(branchId, branchName);
          } catch (err) {
            // Error handled in mutation hook
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleCreateRegionClick = () => {
    if (!canManage) {
      toast.error("You don't have permission to create regions");
      return;
    }
    addModal.open();
  };

  const handleViewDetails = (entry: any) => {
    setSelectedEntry(entry);
    detailModal.open();
  };

  const handleRefreshAfterUpdate = async () => {
    console.log("🔄 [ComplianceFunc] handleRefreshAfterUpdate called");
    console.log("🔄 [ComplianceFunc] Current selectedEntry:", selectedEntry);

    // Refresh the dashboard list and wait for it to complete
    const result = await refetchDashboard();

    console.log("🔄 [ComplianceFunc] Refetch result:", result);

    // After refetch completes, we need to get the fresh data
    // The result.data will have the updated data
    if (selectedEntry?.id && result?.data) {
      // Find the updated entry in the fresh data
      const freshSummary = result.data.summary || result.data || [];

      console.log(
        "🔄 [ComplianceFunc] Fresh summary length:",
        freshSummary.length
      );

      // Map the fresh entry similar to how mappedEntries works
      const updatedEntry = freshSummary.find(
        (item: any) => item.id === selectedEntry.id
      );

      console.log("🔄 [ComplianceFunc] Found updated entry:", updatedEntry);

      if (updatedEntry) {
        // Map to ComplianceEntry format
        const mapped = mapToComplianceEntry(updatedEntry);
        console.log("🔄 [ComplianceFunc] Mapped entry:", mapped);
        console.log(
          "🔄 [ComplianceFunc] Setting selectedEntry to updated value"
        );
        setSelectedEntry(mapped);
      } else {
        console.warn(
          "⚠️ [ComplianceFunc] Could not find updated entry in fresh data"
        );
      }
    } else {
      console.warn(
        "⚠️ [ComplianceFunc] Missing selectedEntry.id or result.data"
      );
    }
  };

  const handleOpenUpload = () => {
    if (!canManage) {
      toast.error("You don't have permission to upload compliance data");
      return;
    }
    uploadModal.open();
  };

  const handleUploadSuccess = () => {
    refetchDashboard();
    refetchRegions();
    uploadModal.close();
  };

  // ============== LOADING STATE ==============
  if (dashboardLoading || regionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ============== ERROR STATE ==============
  if (dashboardError || regionsError) {
    return (
      <div className="space-y-10">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p>Failed to load data: {dashboardError || regionsError}</p>
          <Button
            onClick={() => {
              refetchDashboard();
              refetchRegions();
            }}
            variant="destructive"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Extract region names for filters and AddRegionModal
  const regionNames = regions?.map((r: any) => r.name) ?? [];

  // Map regions with IDs for ComplianceUploadModal
  const mappedRegions =
    regions?.map((r: any) => ({
      id: r.id,
      name: r.name,
    })) ?? [];

  // ============== RENDER ==============
  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="Compliance View"
        description="Track contributions, targets, and employer registration across regions"
        action={
          <PermissionButton
            onClick={handleOpenUpload}
            hasPermission={canManage}
            permissionMessage="You don't have permission to upload compliance data"
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload size={18} />
            <span>Upload Regional Data</span>
          </PermissionButton>
        }
      />

      {/* Metrics Filters */}
      <MetricsFilter
        filters={metricsFilters}
        onFilterChange={handleMetricsFilterChange}
        onReset={handleResetMetricsFilters}
      />

      {/* Dashboard Cards - controlled by MetricsFilter */}
      <DashboardCards
        metrics={{
          totalActualContributions:
            metricsData?.metric_cards?.total_contributions ?? 0,
          contributionsTarget: metricsData?.metric_cards?.total_target ?? 0,
          performanceRate: metricsData?.metric_cards?.performance_rate ?? 0,
          totalEmployers: metricsData?.metric_cards?.total_employers ?? 0,
          totalEmployees: metricsData?.metric_cards?.total_employees ?? 0,
        }}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by region, branch, or period..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Only admin and manager can manage regions */}
          {canManageRegion && (
            <Button
              onClick={handleCreateRegionClick}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
            >
              <Plus size={18} />
              <span>Manage Region</span>
            </Button>
          )}
          {/* Admin, manager, and regional users can manage branches */}
          {canManageBranches && (
            <Button
              onClick={() => branchModal.open()}
              variant="outline"
              className="flex-1 sm:flex-none border-green-600 text-green-600 hover:bg-green-50"
            >
              <Plus size={18} />
              <span>Manage Branches</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        regions={filterRegions}
        branches={filterBranches}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRegionChange={fetchBranchesForRegion}
        totalEntries={totalCount}
        filteredCount={filteredCount}
        userRole={filterUserRole}
        userRegionId={userRegionId}
        showRegionFilter={true}
        showBranchFilter={true}
        showMonthYearFilter={true}
        showDateRangeFilter={false}
        showRecordStatusFilter={true}
      />

      {/* Main Table */}
      <ComplianceTable
        entries={mappedEntries}
        onViewDetails={handleViewDetails}
        sortConfig={null}
        onSort={() => {}} // Sorting can be added later if needed
        onRefresh={refetchDashboard}
      />

      {/* Bulk Upload Instructions */}
      <div className="p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-gray-900 mb-2">
          Bulk Upload Instructions
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload compliance data in bulk using Excel format. The server will
          validate and process your data.
        </p>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Select a region before uploading</li>
          <li>Provide the period (YYYY-MM format)</li>
          <li>Upload Excel file with required sheets</li>
          <li>Review validation errors if any</li>
        </ul>
      </div>

      {/* Modals */}
      <AddRegionModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onAddEntry={() => {}} // Not used in new version
        regions={regions || []}
        regionNames={regionNames}
        onAddRegion={handleAddRegion}
        onDeleteRegion={(name) => {
          const region = regions?.find((r: any) => r.name === name);
          if (region) {
            handleDeleteRegion(region.id, region.name);
          }
        }}
        onAddBranch={handleAddBranch}
        onDeleteBranch={handleDeleteBranch}
      />

      <ManageBranchesModal
        isOpen={branchModal.isOpen}
        onClose={branchModal.close}
        regions={regions || []}
        onAddBranch={handleAddBranch}
        onDeleteBranch={handleDeleteBranch}
      />

      <ComplianceDetailModal
        key={selectedEntry?.id || "new"}
        entry={selectedEntry}
        isOpen={detailModal.isOpen}
        onClose={() => {
          detailModal.close();
          setSelectedEntry(null);
        }}
        onRefresh={handleRefreshAfterUpdate}
      />

      <ComplianceUploadModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.close}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default ComplianceDashboard;
