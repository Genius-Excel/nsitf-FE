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
} from "lucide-react";
import {
  mockLegalActivities,
  demandNotices,
  DEFAULT_REGIONS,
} from "@/lib/Constants";
import DemandNoticeForm from "./demandNoticeForm";
import { LegalDetailModal } from "./legalDetailModal";
import { LegalUploadModal } from "./legalUploadModal";
import { LegalActivityRecord } from "@/lib/types";

const LegalManagementDashboard = () => {
  const [showDemandNoticeForm, setShowDemandNoticeForm] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<LegalActivityRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Management</h1>
          <p className="text-gray-600 text-sm">
            Track legal activities, demand notices and regional performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDemandNotice}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            <Bell size={16} />
            Issue Demand Notice
          </button>
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
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Total Recalcitrant Employers
          </p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalRecalcitrant}
          </p>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Total Defaulting Employers
          </p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalDefaulting}
          </p>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">Total Plan Issued</p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalPlanIssued}
          </p>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Alternate Dispute Resolution (ADR)
          </p>
          <p className="text-3xl font-bold">{dashboardMetrics.totalADR}</p>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">
            Cases Instituted in Court
          </p>
          <p className="text-3xl font-bold">
            {dashboardMetrics.totalCasesInstituted}
          </p>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase mb-1 opacity-90">Sectors</p>
          <p className="text-3xl font-bold">{dashboardMetrics.totalSectors}</p>
        </div>
      </div>

      {/* Stats Cards - 4 Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBranches}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-800">Recalcitrant Employers</p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.totalRecalcitrant}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-800">Defaulting Employers</p>
              <p className="text-2xl font-bold text-red-900">
                {stats.totalDefaulting}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-800">Cases Instituted</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.totalCasesInstituted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Activities Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Legal Activities View
          </h2>
        </div>

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

      {/* Recent Demand Notices */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Demand Notices Issued
          </h2>
          <button
            onClick={handleDemandNotice}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            + Nudging Required
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {demandNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-4 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => alert(`Opening demand notice ${notice.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {notice.id}
                    </p>
                    <p className="text-xs text-gray-600">{notice.company}</p>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold text-gray-900 text-sm">
                    {notice.amount}
                  </p>
                  <p className="text-xs text-gray-500">{notice.date}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Sending reminder for ${notice.id}`);
                  }}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition whitespace-nowrap"
                >
                  Pending Response
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-700">Success Rate</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">93%</p>
          <p className="text-xs text-gray-500">Cases won or settled</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-700">Total Recovered</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦12.58M</p>
          <p className="text-xs text-gray-500">Through legal actions</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-700">
              Avg. Case Duration
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900">4.8 months</p>
          <p className="text-xs text-gray-500">From filing to resolution</p>
        </div>
      </div>

      {/* Modals */}
      {showDemandNoticeForm && (
        <DemandNoticeForm
          onClose={() => setShowDemandNoticeForm(false)}
          onSubmit={(data: any) => {
            console.log("Demand Notice submitted:", data);
            setShowDemandNoticeForm(false);
          }}
        />
      )}

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
