// ============================================================================
// Investment & Treasury Management Dashboard
// ============================================================================
// Main dashboard component for ITM module
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Building,
  Landmark,
  Users,
  Home,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { InvestmentFilters } from "./InvestmentFilters";
import { InvestmentCharts } from "./InvestmentCharts";
import { InvestmentTable } from "./InvestmentTable";
import { InvestmentUploadModal } from "./InvestmentUploadModal";
import { InvestmentDetailModal } from "./InvestmentDetailModal";
import { useInvestmentDashboard } from "@/hooks/investment/useInvestmentDashboard";
import { useBulkInvestmentActions } from "@/hooks/investment/useBulkInvestmentActions";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { getUserFromStorage } from "@/lib/auth";
import type {
  InvestmentFilterParams,
  InvestmentRecord,
} from "@/lib/types/investment";

export default function InvestmentDashboard() {
  // ============= STATE =============
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ============= FILTERS FOR METRICS & CHARTS =============
  const [metricsFilters, setMetricsFilters] = useState<InvestmentFilterParams>({
    selectedMonth: undefined,
    selectedYear: undefined,
    periodFrom: undefined,
    periodTo: undefined,
    recordStatus: undefined,
  });

  // ============= ADVANCED FILTERS FOR TABLE =============
  const {
    filters: tableFilters,
    regions,
    branches,
    apiParams,
    userRole: filterUserRole,
    userRegionId,
    handleFilterChange: handleTableFilterChange,
    resetFilters: resetTableFilters,
    fetchBranchesForRegion,
  } = useAdvancedFilters({
    module: "claims", // Use claims as it's supported, investment will work the same way
  });

  // ============= HOOKS =============
  // Use metrics filters for dashboard data (metrics and charts)
  const {
    data,
    metrics,
    monthlyContributionTrend,
    debtRecoveryPerformance,
    records,
    loading,
    error,
    refetch,
  } = useInvestmentDashboard(metricsFilters);

  // Map table filters to investment filters format for filtered records
  const tableInvestmentFilters: InvestmentFilterParams = useMemo(
    () => ({
      selectedMonth: tableFilters.selectedMonth,
      selectedYear: tableFilters.selectedYear,
      periodFrom: tableFilters.dateFrom,
      periodTo: tableFilters.dateTo,
      recordStatus: tableFilters.recordStatus || undefined,
      regionId: apiParams.region_id,
      branchId: apiParams.branch_id,
    }),
    [
      tableFilters.selectedMonth,
      tableFilters.selectedYear,
      tableFilters.dateFrom,
      tableFilters.dateTo,
      tableFilters.recordStatus,
      apiParams.region_id,
      apiParams.branch_id,
    ]
  );

  // Fetch filtered records for table
  const {
    data: tableData,
    records: filteredRecords,
    loading: tableLoading,
    refetch: refetchTable,
  } = useInvestmentDashboard(tableInvestmentFilters);

  const {
    bulkReview,
    bulkApprove,
    loading: actionLoading,
  } = useBulkInvestmentActions();

  // Get user role for permission checks
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  // ============= COMPUTED VALUES =============
  const isHQUser = useMemo(() => {
    if (!userRole) return false;
    const normalizedRole = userRole.toLowerCase();
    return normalizedRole === "admin" || normalizedRole === "manager";
  }, [userRole]);

  const filteredCount = filteredRecords.length;
  const totalCount = tableData?.totalRecords || records.length;

  // Format change percentage
  const formatChange = (changePercent: number) => {
    const sign = changePercent >= 0 ? "↑" : "↓";
    const abs = Math.abs(changePercent).toFixed(1);
    return `${sign} ${abs}%`;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString()}`;
  };

  // ============= HANDLERS =============
  const handleViewDetail = (investment: InvestmentRecord) => {
    setSelectedInvestment(investment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedInvestment(null);
  };

  const handleRefreshAfterUpdate = () => {
    refetch();
    refetchTable();
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    refetch();
    refetchTable();
  };

  const handleMetricsFilterChange = (newFilters: InvestmentFilterParams) => {
    setMetricsFilters(newFilters);
  };

  const handleResetMetricsFilters = () => {
    setMetricsFilters({
      selectedMonth: undefined,
      selectedYear: undefined,
      periodFrom: undefined,
      periodTo: undefined,
      recordStatus: undefined,
    });
  };

  const handleBulkReview = async () => {
    if (selectedRecords.size === 0) return;
    const success = await bulkReview(Array.from(selectedRecords));
    if (success) {
      setSelectedRecords(new Set());
      refetch();
      refetchTable();
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) return;
    const success = await bulkApprove(Array.from(selectedRecords));
    if (success) {
      setSelectedRecords(new Set());
      refetch();
      refetchTable();
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const newSelection = new Set(selectedRecords);
    if (newSelection.has(recordId)) {
      newSelection.delete(recordId);
    } else {
      newSelection.add(recordId);
    }
    setSelectedRecords(newSelection);
  };

  // ============= LOADING STATE =============
  if (loading && !data) {
    return (
      <div className="p-6">
        <PageHeader
          title="Investment and Treasury Management (ITM)"
          description="Monitor contribution collections and treasury activities"
        />
        <LoadingState message="Loading investment data..." />
      </div>
    );
  }

  // ============= ERROR STATE =============
  if (error && !data) {
    return (
      <div className="p-6">
        <PageHeader
          title="Investment and Treasury Management (ITM)"
          description="Monitor contribution collections and treasury activities"
        />
        <ErrorState
          title="Failed to load investment data"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  // ============= PERIOD BADGE =============
  const getPeriodBadgeText = () => {
    if (metricsFilters.periodFrom && metricsFilters.periodTo) {
      return `Filtered Period: ${metricsFilters.periodFrom} - ${metricsFilters.periodTo}`;
    }
    if (metricsFilters.selectedMonth && metricsFilters.selectedYear) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthLabel = months[parseInt(metricsFilters.selectedMonth) - 1];
      return `Filtered Period: ${monthLabel} ${metricsFilters.selectedYear}`;
    }
    return null;
  };

  const periodBadgeText = getPeriodBadgeText();

  // ============= RENDER =============
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <PageHeader
          title="Investment and Treasury Management (ITM) View"
          description="Monitor contribution collections and treasury activities"
          action={
            isHQUser ? (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Investment Data
              </Button>
            ) : undefined
          }
        />
        {periodBadgeText && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
              {periodBadgeText}
            </span>
          </div>
        )}
      </div>

      {/* Filters for Metrics & Charts */}
      <InvestmentFilters
        filters={metricsFilters}
        onFilterChange={handleMetricsFilterChange}
        onReset={handleResetMetricsFilters}
        totalEntries={data?.totalRecords || 0}
        filteredCount={records.length}
      />

      {/* Metrics Cards */}
      {metrics && (
        <MetricsGrid columns={6}>
          <MetricCard
            title="PRIVATE SECTOR"
            value={formatCurrency(metrics.private_sector.value)}
            change={formatChange(metrics.private_sector.change_percent)}
            icon={<Building />}
            colorScheme="green"
          />
          <MetricCard
            title="PUBLIC TREASURY FUNDED"
            value={formatCurrency(metrics.public_treasury_funded.value)}
            change={formatChange(metrics.public_treasury_funded.change_percent)}
            icon={<Landmark />}
            colorScheme="blue"
          />
          <MetricCard
            title="PUBLIC NON-TREASURY"
            value={formatCurrency(metrics.public_non_treasury_funded.value)}
            change={formatChange(
              metrics.public_non_treasury_funded.change_percent
            )}
            icon={<Users />}
            colorScheme="purple"
          />
          <MetricCard
            title="INFORMAL ECONOMY"
            value={formatCurrency(metrics.informal_economy.value)}
            change={formatChange(metrics.informal_economy.change_percent)}
            icon={<Users />}
            colorScheme="orange"
          />
          <MetricCard
            title="RENTAL FEES"
            value={formatCurrency(metrics.rental_fees.value)}
            change={formatChange(metrics.rental_fees.change_percent)}
            icon={<Home />}
            colorScheme="gray"
          />
          <MetricCard
            title="DEBT RECOVERED"
            value={formatCurrency(metrics.debt_recovered.value)}
            change={formatChange(metrics.debt_recovered.change_percent)}
            icon={<TrendingUp />}
            colorScheme="green"
          />
        </MetricsGrid>
      )}

      {/* Charts */}
      <InvestmentCharts
        monthlyContributionTrend={monthlyContributionTrend}
        debtRecoveryPerformance={debtRecoveryPerformance}
      />

      {/* Advanced Filters for Table */}
      <AdvancedFilterPanel
        regions={regions}
        branches={branches}
        filters={tableFilters}
        onFilterChange={handleTableFilterChange}
        onReset={resetTableFilters}
        onRegionChange={fetchBranchesForRegion}
        totalEntries={totalCount}
        filteredCount={filteredCount}
        userRole={filterUserRole}
        userRegionId={userRegionId}
        showRegionFilter={true}
        showBranchFilter={true}
        showMonthYearFilter={true}
        showDateRangeFilter={true}
        showRecordStatusFilter={true}
      />

      {/* Records Table */}
      <InvestmentTable
        records={filteredRecords}
        selectedRecords={selectedRecords}
        onSelectAll={handleSelectAll}
        onSelectRecord={handleSelectRecord}
        onBulkReview={handleBulkReview}
        onBulkApprove={handleBulkApprove}
        onViewDetail={handleViewDetail}
        isHQUser={isHQUser}
        actionLoading={actionLoading}
      />

      {/* Upload Modal */}
      {isHQUser && (
        <InvestmentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Detail Modal */}
      <InvestmentDetailModal
        investment={selectedInvestment}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onRefresh={handleRefreshAfterUpdate}
      />
    </div>
  );
}
