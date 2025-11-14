"use client";
import React, { useState } from "react";
import {
  Bell,
  Upload,
  Eye,
  FileText,
  Briefcase,
  Users,
  Scale,
  Search,
} from "lucide-react";
import {
  mockLegalActivities,
  demandNotices,
  DEFAULT_REGIONS,
} from "@/lib/Constants";
import { LegalDetailModal } from "./legalDetailModal";
import { LegalUploadModal } from "./legalUploadModal";
import { LegalActivityRecord } from "@/lib/types";
import { Input } from "@/components/ui/input";

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

  // ============= SEARCH AND FILTERS =============
  interface SearchAndFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onFilterClick?: () => void;
  }

  const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
    searchTerm,
    onSearchChange,
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-3 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by branch, period..."
          className="pl-10 border-gray-200 text-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Legal Activities View
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Upload size={16} />
            Upload Legal Data
          </button>
        </div>
      </div>

      {/* Dashboard Metrics - 6 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-muted-foreground text-black p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Total Recalcitrant Employers
          </p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalRecalcitrant}
          </p>
        </div>
        <div className="bg-muted-foreground text-black p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Total Defaulting Employers
          </p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalDefaulting}
          </p>
        </div>
        <div className="bg-muted-foreground text-black p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">Total Plan Issued</p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalPlanIssued}
          </p>
        </div>
        <div className="bg-muted-foreground text-black p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Alternate Dispute Resolution (ADR)
          </p>
          <p className="text-3xl font-bold">{dashboardMetrics.totalADR}</p>
        </div>
        <div className="bg-muted-foreground text-black p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Cases Instituted in Court
          </p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalCasesInstituted}
          </p>
        </div>
        <div className="bg-muted-foreground text-black p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">Sectors</p>
          <p className="text-3xl font-bold">{dashboardMetrics.totalSectors}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
