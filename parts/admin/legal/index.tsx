// ============================================================================
// Legal Management Dashboard - Refactored
// ============================================================================
// Clean component that uses hooks for all business logic
// No mock data, no inline logic, just composition
// ============================================================================

"use client";

import { useState } from "react";
import {
  Upload,
  Eye,
  Users,
  AlertTriangle,
  FileText,
  Scale,
  Gavel,
  Building,
} from "lucide-react";
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

export default function LegalManagementDashboard() {
  // ============= STATE =============
  const [selectedActivity, setSelectedActivity] =
    useState<LegalActivityRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ============= HOOKS =============
  const { data, loading, error, refetch } = useLegalDashboard();
  const { filteredRecords } = useLegalFilters(data?.summaryTable || [], {
    searchTerm,
  });

  // ============= HANDLERS =============
  const handleViewDetails = (activity: LegalActivityRecord) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleUploadSuccess = () => {
    refetch(); // Refresh dashboard after successful upload
    setIsUploadModalOpen(false);
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <PageHeader
        title="Legal Activities View"
        description={`Period: ${data.filters.asOf}`}
        action={
          <button
            onClick={() => setIsUploadModalOpen(true)}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
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
