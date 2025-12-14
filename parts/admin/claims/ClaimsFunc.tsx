"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { FileText, Activity, BarChart3, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  StatisticsCards,
  ClaimsProcessingChart,
  ClaimTypeCards,
  SearchAndFilters,
  ClaimsTable,
} from "./ClaimsDesign";
import { ClaimDetailModal } from "./ClaimModal";
import { ClaimsUploadModal } from "./ClaimsUploadModal";
import { StatCard } from "@/lib/types";
import { PageHeader } from "@/components/design-system/PageHeader";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import {
  useClaimsDashboard,
  useClaimsFilters,
  useClaimDetail,
  useClaimsUpload,
  useClaimsCharts,
  Claim,
} from "@/hooks/claims";
import { getUserFromStorage } from "@/lib/auth";
import { canManageClaims } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

export default function ClaimsManagement() {
  // ==========================================
  // ADVANCED FILTERS
  // ==========================================
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
    module: "claims",
  });

  // ==========================================
  // STATE
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);

  // ==========================================
  // PERMISSIONS
  // ==========================================
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      // Claims upload is only for regional officers, not admin
      const isRegionalOfficer = user.role === "regional_manager" ||
                                user.role === "compliance_officer" ||
                                user.role === "claims_officer";

      // Check backend permissions first
      if (user.permissions && Array.isArray(user.permissions)) {
        const hasBackendPermission = user.permissions.some(p =>
          p === "can_upload_claims" ||
          p === "can_create_claims_record" ||
          p === "can_edit_claims_record"
        );
        // Only allow if user has permission AND is a regional officer (not admin)
        setCanManage(hasBackendPermission && isRegionalOfficer);
      } else {
        // Fallback to role-based permissions, but exclude admin
        setCanManage(canManageClaims(user.role) && isRegionalOfficer);
      }
    }
  }, []);

  // ==========================================
  // API HOOKS
  // ==========================================

  // 1. Fetch dashboard data (with pagination support and filters)
  const {
    claims,
    metrics,
    categories,
    monthlyChart,
    pagination,
    loading,
    error,
    refetch,
    setPage,
  } = useClaimsDashboard({
    page: 1,
    ...apiParams, // Add filter parameters from advanced filters
  });

  // 2. Client-side filtering
  const { filteredClaims } = useClaimsFilters({
    claims,
    searchTerm,
    statusFilter,
    typeFilter,
  });

  // 3. Fetch claim detail (for modal)
  const {
    data: claimDetail,
    loading: detailLoading,
    fetchDetail,
    clearDetail,
  } = useClaimDetail();

  // 4. Upload handler
  const { uploadClaims, progress: uploadProgress } = useClaimsUpload({
    onSuccess: (count, region) => {
      toast.success(`Successfully uploaded ${count} claims to ${region}`);
      refetch(); // Refresh dashboard data
      setIsUploadModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error}`);
    },
  });

  // 5. Transform chart data
  const { chartData, maxValue, ticks } = useClaimsCharts({ monthlyChart });

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  // Get unique filter options
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(claims.map(c => c.status));
    return Array.from(statuses).filter(Boolean);
  }, [claims]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(claims.map(c => c.type));
    return Array.from(types).filter(Boolean);
  }, [claims]);

  // Check if filters are active
  const hasActiveFilters = searchTerm || statusFilter || typeFilter;

  // Stats cards configuration
  const stats: StatCard[] = useMemo(() => {
    if (!metrics) return [];

    // Mock change calculation - replace with real logic if available
    const mockChangePercent = "+8.2";

    return [
      {
        title: "Total Claims Paid",
        value: metrics.totalClaimsPaid,
        description: "",
        change: `${mockChangePercent}% from last month`,
        icon: <FileText />,
        bgColor: "#00a63e",
      },
      {
        title: "Beneficiaries Rehabilitated",
        description: "",
        value: metrics.beneficiariesRehabilitated,
        change: `${mockChangePercent}% from last month`,
        icon: <Activity />,
        bgColor: "#00a63e",
      },
      {
        title: "NOK Beneficiaries",
        description: "",
        change: `${mockChangePercent}% from last month`,
        value: metrics.nokBeneficiaries,
        icon: <DollarSign />,
        bgColor: "#3b82f6",
      },
      {
        title: "Disability RSA Benefit",
        description: "",
        value: metrics.disabilityRSABenefit || metrics.disabilityBeneficiaries || 0,
        change: `${mockChangePercent}% from last month`,
        icon: <BarChart3 />,
        bgColor: "#a855f7",
      },
      {
        title: "Disabilities Beneficiaries",
        description: "",
        value: metrics.disabilitiesBeneficiaries || metrics.retireeBenefitBeneficiaries || 0,
        change: `${mockChangePercent}% from last month`,
        icon: <BarChart3 />,
        bgColor: "#f59e0b",
      },
      {
        title: "LOP",
        description: "",
        value: metrics.lop || 0,
        change: `${mockChangePercent}% from last month`,
        icon: <FileText />,
        bgColor: "#8b5cf6",
      },
      {
        title: "MER",
        description: "",
        value: metrics.mer || 0,
        change: `${mockChangePercent}% from last month`,
        icon: <Activity />,
        bgColor: "#ec4899",
      },
    ];
  }, [metrics]);

  // Claim type cards configuration
  const claimTypes = useMemo(() => {
    if (!categories) return [];

    return [
      {
        type: "Medical Refunds",
        count: categories.medicalRefunds,
        color: "bg-green-50 border-l-4 border-green-500",
      },
      {
        type: "Disability Claims",
        count: categories.disabilityClaims,
        color: "bg-blue-50 border-l-4 border-blue-500",
      },
      {
        type: "Death Claims",
        count: categories.deathClaims,
        color: "bg-purple-50 border-l-4 border-purple-500",
      },
      {
        type: "Retiree Benefit Beneficiaries",
        count: categories.retireeBenefits,
        color: "bg-yellow-50 border-l-4 border-yellow-500",
      },
    ];
  }, [categories]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleViewClaim = useCallback(
    (claim: Claim) => {
      fetchDetail(claim.id);
      setIsDetailModalOpen(true);
    },
    [fetchDetail]
  );

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    clearDetail();
  }, [clearDetail]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setTypeFilter("");
  }, []);

  const handleUploadClick = useCallback(() => {
    if (!canManage) {
      toast.error("You don't have permission to upload claims");
      return;
    }
    setIsUploadModalOpen(true);
  }, [canManage]);

  const handleExport = useCallback(() => {
    if (!canManage) {
      toast.error("You don't have permission to export claims");
      return;
    }

    if (filteredClaims.length === 0) {
      toast.error("No claims to export");
      return;
    }

    // Create CSV content
    const headers = [
      "Claim ID",
      "Employer",
      "Claimant",
      "Type",
      "Amount Requested",
      "Amount Paid",
      "Status",
      "Date Processed",
      "Date Paid",
      "Sector",
      "Class",
      "Payment Period",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredClaims.map((claim) =>
        [
          claim.claimId,
          `"${claim.employer}"`,
          `"${claim.claimant}"`,
          claim.type,
          claim.amountRequested,
          claim.amountPaid,
          claim.status,
          claim.dateProcessed,
          claim.datePaid || "",
          claim.sector || "",
          claim.class || "",
          claim.date || "",
        ].join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `claims-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredClaims.length} claims`);
  }, [filteredClaims, canManage]);

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  if (error) {
    return (
      <div className="space-y-4 w-full max-w-[calc(100vw-20rem)] xl:max-w-[1216px]">
        <PageHeader
          title="Claims and Compensation View"
          description="Track and process employee compensation claims"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">
            Failed to load claims data
          </p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button
            onClick={refetch}
            variant="destructive"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-4 w-full max-w-[calc(100vw-20rem)] xl:max-w-[1216px]">
      {/* Header */}
      <PageHeader
        title="Claims and Compensation View"
        description="Track and process employee compensation claims"
      />

      {/* Loading State */}
      {loading && !claims.length ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading claims data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          {stats.length > 0 && <StatisticsCards stats={stats} />}

          {/* Claims Processing Chart */}
          {chartData.length > 0 && (
            <ClaimsProcessingChart
              data={chartData}
              maxValue={maxValue}
              ticks={ticks}
            />
          )}

          {/* Claim Type Cards */}
          {claimTypes.length > 0 && (
            <ClaimTypeCards claimTypes={claimTypes} />
          )}

          {/* Search and Filters */}
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => {}}
            onExport={handleExport}
            onUpload={handleUploadClick}
          />

          {/* Advanced Filter Panel */}
          <AdvancedFilterPanel
            regions={regions}
            branches={branches}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            totalEntries={claims.length}
            filteredCount={filteredClaims.length}
            userRole={userRole}
            userRegionId={userRegionId}
            showRegionFilter={true}
            showBranchFilter={true}
            showMonthYearFilter={true}
            showDateRangeFilter={false}
          />

          {/* Claims Table */}
          <ClaimsTable claims={filteredClaims} onView={handleViewClaim} />

          {/* Pagination Info (Optional) */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}(
              {pagination.totalCount} total claims)
            </div>
          )}
        </>
      )}

      {/* Claim Detail Modal */}
      <ClaimDetailModal
        claimDetail={claimDetail}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        loading={detailLoading}
      />

      {/* Claims Upload Modal */}
      <ClaimsUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={uploadClaims}
        progress={uploadProgress}
      />
    </div>
  );
}
