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
import { InvestmentFilters } from "./InvestmentFilters";
import { InvestmentCharts } from "./InvestmentCharts";
import { InvestmentTable } from "./InvestmentTable";
import { InvestmentUploadModal } from "./InvestmentUploadModal";
import { useInvestmentDashboard } from "@/hooks/investment/useInvestmentDashboard";
import { useBulkInvestmentActions } from "@/hooks/investment/useBulkInvestmentActions";
import { getUserFromStorage } from "@/lib/auth";
import type { InvestmentFilterParams } from "@/lib/types/investment";

export default function InvestmentDashboard() {
  // ============= STATE =============
  const [filters, setFilters] = useState<InvestmentFilterParams>({
    selectedMonth: undefined,
    selectedYear: undefined,
    periodFrom: undefined,
    periodTo: undefined,
    recordStatus: "",
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  // ============= HOOKS =============
  const { data, metrics, chartData, records, loading, error, refetch } =
    useInvestmentDashboard(filters);

  const { bulkReview, bulkApprove, loading: actionLoading } =
    useBulkInvestmentActions();

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

  const filteredCount = records.length;
  const totalCount = data?.totalRecords || 0;

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
  const handleFilterChange = (newFilters: InvestmentFilterParams) => {
    setFilters(newFilters);
    setSelectedRecords(new Set()); // Clear selection on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      selectedMonth: undefined,
      selectedYear: undefined,
      periodFrom: undefined,
      periodTo: undefined,
      recordStatus: "",
    });
    setSelectedRecords(new Set());
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    refetch();
  };

  const handleBulkReview = async () => {
    if (selectedRecords.size === 0) return;
    const success = await bulkReview(Array.from(selectedRecords));
    if (success) {
      setSelectedRecords(new Set());
      refetch();
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) return;
    const success = await bulkApprove(Array.from(selectedRecords));
    if (success) {
      setSelectedRecords(new Set());
      refetch();
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map((r) => r.id)));
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
    if (filters.periodFrom && filters.periodTo) {
      return `Filtered Period: ${filters.periodFrom} - ${filters.periodTo}`;
    }
    if (filters.selectedMonth && filters.selectedYear) {
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
      const monthLabel = months[parseInt(filters.selectedMonth) - 1];
      return `Filtered Period: ${monthLabel} ${filters.selectedYear}`;
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
          title="Investment and Treasury Management (ITM)"
          description="Monitor contribution collections and treasury activities"
          action={
            isHQUser ? (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
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

      {/* Filters */}
      <InvestmentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalEntries={totalCount}
        filteredCount={filteredCount}
      />

      {/* Metrics Cards */}
      {metrics && (
        <MetricsGrid columns={6}>
          <MetricCard
            title="PRIVATE SECTOR"
            value={formatCurrency(metrics.contributionsPrivateSector.current)}
            change={formatChange(
              metrics.contributionsPrivateSector.changePercent
            )}
            icon={<Building />}
            colorScheme="green"
          />
          <MetricCard
            title="PUBLIC TREASURY FUNDED"
            value={formatCurrency(
              metrics.contributionsPublicTreasury.current
            )}
            change={formatChange(
              metrics.contributionsPublicTreasury.changePercent
            )}
            icon={<Landmark />}
            colorScheme="blue"
          />
          <MetricCard
            title="PUBLIC NON-TREASURY"
            value={formatCurrency(
              metrics.contributionsPublicNonTreasury.current
            )}
            change={formatChange(
              metrics.contributionsPublicNonTreasury.changePercent
            )}
            icon={<Users />}
            colorScheme="purple"
          />
          <MetricCard
            title="INFORMAL ECONOMY"
            value={formatCurrency(
              metrics.contributionsInformalEconomy.current
            )}
            change={formatChange(
              metrics.contributionsInformalEconomy.changePercent
            )}
            icon={<Users />}
            colorScheme="orange"
          />
          <MetricCard
            title="RENTAL FEES"
            value={formatCurrency(metrics.rentalFees.current)}
            change={formatChange(metrics.rentalFees.changePercent)}
            icon={<Home />}
            colorScheme="gray"
          />
          <MetricCard
            title="DEBT RECOVERED"
            value={formatCurrency(metrics.debtRecovered.current)}
            change={formatChange(metrics.debtRecovered.changePercent)}
            icon={<TrendingUp />}
            colorScheme="green"
          />
        </MetricsGrid>
      )}

      {/* Charts */}
      <InvestmentCharts chartData={chartData} />

      {/* Records Table */}
      <InvestmentTable
        records={records}
        selectedRecords={selectedRecords}
        onSelectAll={handleSelectAll}
        onSelectRecord={handleSelectRecord}
        onBulkReview={handleBulkReview}
        onBulkApprove={handleBulkApprove}
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
    </div>
  );
}
