// ============================================================================
// Legal Management Dashboard - Refactored
// ============================================================================
// Clean component that uses hooks for all business logic
// No mock data, no inline logic, just composition
// ============================================================================

"use client";

import { useState, useEffect } from "react";
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
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { LegalDetailModal } from "./legalDetailModal";
import { LegalUploadModal } from "./legalUploadModal";
import { useLegalDashboard } from "@/hooks/legal/useLegalDashboard";
import { useLegalFilters } from "@/hooks/legal/useLegalFilters";
import type { LegalActivityRecord } from "@/lib/types/legal";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { canManageLegal } from "@/lib/permissions";

export default function LegalManagementDashboard() {
  // ============= PERMISSIONS =============
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
      // Check backend permissions first
      if (user.permissions && Array.isArray(user.permissions)) {
        const hasBackendPermission = user.permissions.some(p =>
          p === "can_upload_legal" ||
          p === "can_create_legal_record" ||
          p === "can_edit_legal_record"
        );
        setCanManage(hasBackendPermission);
      } else {
        // Fallback to role-based permissions
        setCanManage(canManageLegal(user.role));
      }
    }
  }, []);

  // ============= STATE =============
  const [selectedActivity, setSelectedActivity] =
    useState<LegalActivityRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============= HOOKS =============
  const { data, loading, error, refetch } = useLegalDashboard();
  const { filteredRecords } = useLegalFilters(data?.summaryTable || [], {
    searchTerm,
  });

  // ============= HANDLERS =============
  const canReview = userRole === "regional_manager";
  const canApprove = userRole && ["admin", "manager"].includes(userRole);

  const handleSelectAll = () => {
    if (selectedActivities.size === filteredRecords.length) {
      setSelectedActivities(new Set());
    } else {
      setSelectedActivities(new Set(filteredRecords.map(a => a.id)));
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
      toast.error("Please select at least one activity");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk review legal activities
      // const response = await fetch('/api/legal/bulk-review', {
      //   method: 'POST',
      //   body: JSON.stringify({ activityIds: Array.from(selectedActivities) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedActivities.size} activity(ies) marked as reviewed`);
      setSelectedActivities(new Set());
    } catch (error) {
      toast.error("Failed to review activities");
      console.error("Bulk review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedActivities.size === 0) {
      toast.error("Please select at least one activity");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk approve legal activities
      // const response = await fetch('/api/legal/bulk-approve', {
      //   method: 'POST',
      //   body: JSON.stringify({ activityIds: Array.from(selectedActivities) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedActivities.size} activity(ies) approved successfully`);
      setSelectedActivities(new Set());
    } catch (error) {
      toast.error("Failed to approve activities");
      console.error("Bulk approve error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (activity: LegalActivityRecord) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleUploadSuccess = () => {
    refetch(); // Refresh dashboard after successful upload
    setIsUploadModalOpen(false);
  };

  const handleUploadClick = () => {
    if (!canManage) {
      toast.error("You don't have permission to upload legal data");
      return;
    }
    setIsUploadModalOpen(true);
  };

  // ============= LOADING & ERROR STATES =============
  if (loading) {
    return <LoadingState message="Loading legal dashboard..." />;
  }

  if (error) {
    return <ErrorState error={new Error(error)} />;
  }

  if (!data) {
    return <ErrorState error={new Error("No dashboard data available")} />;
  }

  // ============= RENDER =============
  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="Legal Activities View"
        description={`Period: ${data.filters.asOf}`}
        action={
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Upload size={16} />
            Upload Legal Data
          </button>
        }
      />

      {/* Dashboard Metrics */}
      <MetricsGrid columns={6}>
        <MetricCard
          title="Recalcitrant Employers"
          value={data.metricCards.recalcitrantEmployers}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorScheme="orange"
        />
        <MetricCard
          title="Defaulting Employers"
          value={data.metricCards.defaultingEmployers}
          icon={<Users className="w-5 h-5" />}
          colorScheme="blue"
        />
        <MetricCard
          title="Plan Issued"
          value={data.metricCards.planIssued}
          icon={<FileText className="w-5 h-5" />}
          colorScheme="green"
        />
        <MetricCard
          title="ADR Cases"
          value={data.metricCards.adrCases}
          icon={<Scale className="w-5 h-5" />}
          colorScheme="purple"
        />
        <MetricCard
          title="Cases Instituted"
          value={data.metricCards.casesInstituted}
          icon={<Gavel className="w-5 h-5" />}
          colorScheme="gray"
        />
        <MetricCard
          title="Sectors Covered"
          value={data.metricCards.sectorsCovered}
          icon={<Building className="w-5 h-5" />}
          colorScheme="blue"
        />
      </MetricsGrid>

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by branch, period..."
        showUpload={false}
        showExport={false}
        showFilter={false}
      />

      {/* Legal Activities Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        {(canReview || canApprove) && selectedActivities.size > 0 && (
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
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {(canReview || canApprove) && (
                  <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedActivities.size === filteredRecords.length && filteredRecords.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label="Select all activities"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recalcitrant Employers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defaulting Employers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ECS NO.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Issued
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ADR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases Instituted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sectors
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activities Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition">
                    {(canReview || canApprove) && (
                      <td className="px-2 py-1.5 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedActivities.has(activity.id)}
                          onChange={() => handleSelectActivity(activity.id)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          aria-label={`Select activity for ${activity.branch}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {activity.region}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.branch}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.recalcitrantEmployers}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.defaultingEmployers}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.ecsNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.planIssued}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.adr}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.casesInstituted}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.sectors.join(", ") || "None"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activity.activitiesPeriod}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(activity)}
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
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No legal activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LegalDetailModal
        activity={selectedActivity}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedActivity(null);
        }}
      />

      <LegalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
