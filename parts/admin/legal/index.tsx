// ============================================================================
// Legal Management Dashboard - Refactored
// ============================================================================
// Clean component that uses hooks for all business logic
// No mock data, no inline logic, just composition
// ============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Eye,
  Users,
  AlertTriangle,
  FileText,
  Scale,
  Gavel,
  Building,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { SearchBar } from "@/components/design-system/SearchBar";
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { LegalRecordModal } from "./LegalRecordModal";
import { LegalUploadModal } from "./legalUploadModal";
import { useManageLegal } from "@/hooks/legal/useManageLegal";
import { useBulkLegalActions } from "@/hooks/legal/useBulkLegalActions";
import type { LegalRecord } from "@/lib/types/legal-new";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { canManageLegal } from "@/lib/permissions";

export default function LegalManagementDashboard() {
  // ============= PERMISSIONS REMOVED =============
  // All users can access upload and management features

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  // ============= STATE =============
  const [selectedRecord, setSelectedRecord] = useState<LegalRecord | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [minRecalcitrant, setMinRecalcitrant] = useState<number | undefined>(
    undefined
  );
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set()
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============= HOOKS =============
  const {
    filters,
    regions,
    branches,
    apiParams,
    userRole: filterUserRole,
    userRegionId,
    handleFilterChange,
    resetFilters,
  } = useAdvancedFilters({
    module: "legal",
  });

  // Fetch ALL records without filters to show complete metrics
  const {
    records: allRecords,
    loading,
    error,
    refetch,
  } = useManageLegal({
    // Don't pass any filters - get all records
    regionId: undefined,
    branchId: undefined,
    period: undefined,
    periodFrom: undefined,
    periodTo: undefined,
  });

  // Debug logging
  useEffect(() => {
    console.log("🔍 Legal Dashboard State:");
    console.log("  - Loading:", loading);
    console.log("  - Error:", error);
    console.log("  - All Records:", allRecords);
    console.log("  - Records Count:", allRecords.length);
  }, [loading, error, allRecords]);

  const {
    bulkReview,
    bulkApprove,
    loading: bulkLoading,
  } = useBulkLegalActions();

  // Calculate metrics from ALL records (not filtered) so metrics aren't affected by filters
  const metrics = useMemo(
    () => ({
      recalcitrantEmployers: allRecords.reduce(
        (sum, r) => sum + r.recalcitrantEmployers,
        0
      ),
      defaultingEmployers: allRecords.reduce(
        (sum, r) => sum + r.defaultingEmployers,
        0
      ),
      planIssued: allRecords.reduce((sum, r) => sum + r.planIssued, 0),
      adrCases: allRecords.reduce(
        (sum, r) => sum + r.alternateDisputeResolution,
        0
      ),
      casesInstituted: allRecords.reduce(
        (sum, r) => sum + r.casesInstitutedInCourt,
        0
      ),
      casesWon: allRecords.reduce((sum, r) => sum + r.casesWon, 0),
    }),
    [allRecords]
  );

  // Sync selectedRecord when data refreshes
  useEffect(() => {
    if (selectedRecord && allRecords) {
      const updated = allRecords.find((r) => r.id === selectedRecord.id);
      if (updated) {
        setSelectedRecord(updated);
      }
    }
  }, [allRecords]);

  // Filter records based on search, advanced filters, and local filters
  const filteredRecords = allRecords.filter((record) => {
    // Search filter (always active when user types)
    const matchesSearch =
      !searchTerm ||
      record.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.period.includes(searchTerm);

    // Advanced filter panel filters (from useAdvancedFilters)
    // Match by region name (find the region name from regions array using region_id)
    const matchesRegionFilter =
      !apiParams.region_id ||
      (() => {
        const selectedRegion = regions.find(
          (r) => r.id === apiParams.region_id
        );
        const result = selectedRegion
          ? record.region === selectedRegion.name
          : true;
        if (apiParams.region_id) {
          console.log("🔍 Region Filter:", {
            apiParamsRegionId: apiParams.region_id,
            selectedRegion,
            recordRegion: record.region,
            result,
          });
        }
        return result;
      })();

    // Match by branch name (find the branch name from branches array using branch_id)
    const matchesBranchFilter =
      !apiParams.branch_id ||
      (() => {
        const selectedBranch = branches.find(
          (b) => b.id === apiParams.branch_id
        );
        const result = selectedBranch
          ? record.branch === selectedBranch.name
          : true;
        if (apiParams.branch_id) {
          console.log("🔍 Branch Filter:", {
            apiParamsBranchId: apiParams.branch_id,
            selectedBranch,
            recordBranch: record.branch,
            result,
          });
        }
        return result;
      })();

    // Period filters (single period OR range mode)
    const matchesPeriod =
      !apiParams.period || record.period === apiParams.period;

    const matchesPeriodFrom =
      !apiParams.period_from || record.period >= apiParams.period_from;

    const matchesPeriodTo =
      !apiParams.period_to || record.period <= apiParams.period_to;

    // Local filters (custom filters on this page)
    const matchesRegion = !regionFilter || record.region === regionFilter;

    const matchesMinRecalcitrant =
      minRecalcitrant === undefined ||
      record.recalcitrantEmployers >= minRecalcitrant;

    const finalResult =
      matchesSearch &&
      matchesRegionFilter &&
      matchesBranchFilter &&
      matchesPeriod &&
      matchesPeriodFrom &&
      matchesPeriodTo &&
      matchesRegion &&
      matchesMinRecalcitrant;

    // Debug first record filtering
    if (allRecords.indexOf(record) === 0) {
      console.log("🔍 First Record Filter Results:", {
        matchesSearch,
        matchesRegionFilter,
        matchesBranchFilter,
        matchesPeriod,
        matchesPeriodFrom,
        matchesPeriodTo,
        matchesRegion,
        matchesMinRecalcitrant,
        finalResult,
        apiParams,
        regions: regions.length,
        branches: branches.length,
      });
    }

    return finalResult;
  });

  const totalCount = allRecords.length;
  const filteredCount = filteredRecords.length;

  // ============= COMPUTED VALUES =============
  const uniqueRegions = Array.from(
    new Set(allRecords.map((r) => r.region))
  ).filter(Boolean);
  const hasActiveFilters =
    searchTerm || regionFilter || minRecalcitrant !== undefined;

  // ============= HANDLERS =============
  const handleResetFilters = () => {
    setSearchTerm("");
    setRegionFilter("");
    setMinRecalcitrant(undefined);
    resetFilters();
  };

  const normalizedRole = userRole?.toLowerCase();
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  const handleSelectAll = () => {
    if (selectedActivities.size === filteredRecords.length) {
      setSelectedActivities(new Set());
    } else {
      setSelectedActivities(new Set(filteredRecords.map((a) => a.id)));
    }
  };

  const handleSelectActivity = (activityId: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const handleBulkReview = async () => {
    if (selectedActivities.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    setIsSubmitting(true);
    try {
      const recordIds = Array.from(selectedActivities);
      const success = await bulkReview(recordIds);

      if (success) {
        toast.success(`${recordIds.length} record(s) marked as reviewed`);
        setSelectedActivities(new Set());
        refetch();
      } else {
        toast.error("Failed to review records");
      }
    } catch (error) {
      toast.error("Failed to review records");
      console.error("Bulk review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedActivities.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    setIsSubmitting(true);
    try {
      const recordIds = Array.from(selectedActivities);
      const success = await bulkApprove(recordIds);

      if (success) {
        toast.success(`${recordIds.length} record(s) approved successfully`);
        setSelectedActivities(new Set());
        refetch();
      } else {
        toast.error("Failed to approve records");
      }
    } catch (error) {
      toast.error("Failed to approve records");
      console.error("Bulk approve error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (record: LegalRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleUploadSuccess = () => {
    refetch(); // Refresh dashboard after successful upload
    setIsUploadModalOpen(false);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  // ============= LOADING & ERROR STATES =============
  if (loading) {
    return <LoadingState message="Loading legal dashboard..." />;
  }

  if (error) {
    return <ErrorState error={new Error(error)} />;
  }

  // ============= RENDER =============
  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="Legal Activities View"
        description={`Showing ${filteredCount} of ${totalCount} records`}
      />

      {/* Dashboard Metrics */}
      <MetricsGrid columns={6}>
        <MetricCard
          title="TOTAL RECALCITRANT EMPLOYERS"
          value={metrics.recalcitrantEmployers}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorScheme="orange"
        />
        <MetricCard
          title="TOTAL DEFAULTING EMPLOYERS"
          value={metrics.defaultingEmployers}
          icon={<Users className="w-5 h-5" />}
          colorScheme="blue"
        />
        <MetricCard
          title="TOTAL PLAN ISSUED"
          value={metrics.planIssued}
          icon={<FileText className="w-5 h-5" />}
          colorScheme="green"
        />
        <MetricCard
          title="ALTERNATE DISPUTE RESOLUTION (ADR)"
          value={metrics.adrCases}
          icon={<Scale className="w-5 h-5" />}
          colorScheme="purple"
        />
        <MetricCard
          title="CASES INSTITUTED IN COURT"
          value={metrics.casesInstituted}
          icon={<Gavel className="w-5 h-5" />}
          colorScheme="gray"
        />
        <MetricCard
          title="CASES WON"
          value={metrics.casesWon}
          icon={<CheckCircle className="w-5 h-5" />}
          colorScheme="green"
        />
      </MetricsGrid>

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by branch, period..."
        showUpload={true}
        onUpload={handleUploadClick}
        uploadButtonText="Upload Legal Data"
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
        userRole={filterUserRole}
        userRegionId={userRegionId}
        showRegionFilter={true}
        showBranchFilter={true}
        showMonthYearFilter={false}
        showDateRangeFilter={true}
        showRecordStatusFilter={true}
      />

      {/* Legal Activities Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        {selectedActivities.size > 0 && (
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedActivities.size} activity(ies) selected
            </span>
            <div className="flex gap-2">
              {canReview && (
                <Button
                  onClick={handleBulkReview}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Mark as Reviewed"}
                </Button>
              )}
              {canApprove && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Approve Selected"}
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedActivities.size === filteredRecords.length &&
                      filteredRecords.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label="Select all activities"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BRANCH
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RECALCITANT EMPLOYERS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DEFAULTING EMPLOYERS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ECS NO.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PLAN ISSUED
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ALTERNATE DISPUTE RESOLUTION (ADR)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CASES INSTITUTED IN COURT
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CASES WON
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SECTOR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PERIOD
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  APPROVAL STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 py-1.5 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedActivities.has(record.id)}
                        onChange={() => handleSelectActivity(record.id)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        aria-label={`Select record for ${record.branch}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {record.region}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.branch}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.recalcitrantEmployers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.defaultingEmployers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.ecsNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.planIssued.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.alternateDisputeResolution.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.casesInstitutedInCourt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.casesWon.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.sector.join(", ") || "None"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.period}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.recordStatus?.toLowerCase() === "approved"
                            ? "bg-green-100 text-green-800"
                            : record.recordStatus?.toLowerCase() === "reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.recordStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No legal records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LegalRecordModal
        record={selectedRecord}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecord(null);
        }}
        onRefresh={refetch}
      />

      <LegalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
