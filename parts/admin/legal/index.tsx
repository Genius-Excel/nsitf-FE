"use client";
import React, { useState } from "react";
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
import {
  mockLegalActivities,
  demandNotices,
  DEFAULT_REGIONS,
} from "@/lib/Constants";
import { LegalDetailModal } from "./legalDetailModal";
import { LegalUploadModal } from "./legalUploadModal";
import { LegalActivityRecord } from "@/lib/types";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { PageHeader } from "@/components/design-system/PageHeader";
import { SearchBar } from "@/components/design-system/SearchBar";

const LegalManagementDashboard = () => {
  const [showDemandNoticeForm, setShowDemandNoticeForm] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<LegalActivityRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate dashboard metrics from mock data
  const dashboardMetrics = {
    totalRecalcitrant: mockLegalActivities.reduce(
      (sum, item) => sum + item.recalcitrantEmployers,
      0
    ),
    totalDefaulting: mockLegalActivities.reduce(
      (sum, item) => sum + item.defaultingEmployers,
      0
    ),
    totalPlanIssued: mockLegalActivities.reduce(
      (sum, item) => sum + item.planIssued,
      0
    ),
    totalADR: mockLegalActivities.reduce((sum, item) => sum + item.adr, 0),
    totalCasesInstituted: mockLegalActivities.reduce(
      (sum, item) => sum + item.casesInstituted,
      0
    ),
    totalSectors: new Set(
      mockLegalActivities.flatMap((item) => item.sectors.split(", "))
    ).size,
  };

  // Calculate stats for the 4 cards
  const stats = {
    totalBranches: mockLegalActivities.length,
    totalRecalcitrant: dashboardMetrics.totalRecalcitrant,
    totalDefaulting: dashboardMetrics.totalDefaulting,
    totalCasesInstituted: dashboardMetrics.totalCasesInstituted,
  };

  const handleViewDetails = (activity: LegalActivityRecord) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleDemandNotice = () => {
    setShowDemandNoticeForm(true);
  };

  const handleUploadSuccess = (uploadedActivities: LegalActivityRecord[]) => {
    console.log("Uploaded activities:", uploadedActivities);
    // You can add the uploaded activities to your state here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <PageHeader
        title="Legal Activities View"
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

      {/* Dashboard Metrics - 6 Cards */}
      <MetricsGrid columns={6}>
        <MetricCard
          title="Recalcitrant Employers"
          value={dashboardMetrics.totalRecalcitrant}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorScheme="orange"
        />
        <MetricCard
          title="Defaulting Employers"
          value={dashboardMetrics.totalDefaulting}
          icon={<Users className="w-5 h-5" />}
          colorScheme="blue"
        />
        <MetricCard
          title="Plan Issued"
          value={dashboardMetrics.totalPlanIssued}
          icon={<FileText className="w-5 h-5" />}
          colorScheme="green"
        />
        <MetricCard
          title="ADR Cases"
          value={dashboardMetrics.totalADR}
          icon={<Scale className="w-5 h-5" />}
          colorScheme="purple"
        />
        <MetricCard
          title="Cases Instituted"
          value={dashboardMetrics.totalCasesInstituted}
          icon={<Gavel className="w-5 h-5" />}
          colorScheme="gray"
        />
        <MetricCard
          title="Sectors Covered"
          value={dashboardMetrics.totalSectors}
          icon={<Building className="w-5 h-5" />}
          colorScheme="blue"
        />
      </MetricsGrid>

      {/* Search and Filters */}
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
                  Alternate Dispute Resolution (ADR)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases Instituted in Court
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
              {mockLegalActivities.map((activity) => (
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
                    {activity.ecsNo}
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
                    {activity.sectors}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Detail Modal */}
      <LegalDetailModal
        activity={selectedActivity}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedActivity(null);
        }}
      />

      {/* Legal Upload Modal */}
      <LegalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        regions={DEFAULT_REGIONS}
        // regions={DEFAULT_REGIONS}
      />
    </div>
  );
};

export default LegalManagementDashboard;
