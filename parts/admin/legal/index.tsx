"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Bell, Plus, Upload, Eye } from "lucide-react";
import { cases, demandNotices } from "@/lib/Constants";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import DemandNoticeForm from "./demandNoticeForm";
import AddNewCaseForm from "./addNewCaseForm";
import { LegalDetailModal } from "./legalDetailModal";
import { LegalUploadModal } from "./legalUploadModal";
import { LegalCase } from "@/lib/types";

const LegalManagementDashboard = () => {
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>(
    {}
  );
  const [showDemandNoticeForm, setShowDemandNoticeForm] = useState(false);
  const [showAddCaseForm, setShowAddCaseForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "closed" | "assigned-obtained"
  >("all");

  const stats = {
    total: cases.length,
    ongoing: cases.filter((c) => c.status === "pending").length,
    settled: cases.filter((c) => c.status === "closed").length,
    assignedObtained: cases.filter((c) => c.status === "assigned-obtained")
      .length,
  };

  const filteredCases =
    filter === "all" ? cases : cases.filter((c) => c.status === filter);

  const toggleCaseExpanded = (caseId: string) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const handleViewDetails = (legalCase: LegalCase) => {
    setSelectedCase(legalCase);
    setIsDetailModalOpen(true);
  };

  const handleDemandNotice = () => {
    setShowDemandNoticeForm(true);
  };

  const handleAddNewCase = () => {
    setShowAddCaseForm(true);
  };

  const handleUploadSuccess = (uploadedCases: LegalCase[]) => {
    console.log("Uploaded cases:", uploadedCases);
    // You can add the uploaded cases to your state here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Management</h1>
          <p className="text-gray-600 text-sm">
            Track legal cases, demand notices and outcomes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            <Upload size={16} />
            Upload Legal Data
          </button>
          <button
            onClick={handleDemandNotice}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            <Bell size={16} />
            Issue Demand Notice
          </button>
          <button
            onClick={handleAddNewCase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Add New Case
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setFilter("all")}
          className={`bg-white p-4 rounded-lg border-2 cursor-pointer transition ${
            filter === "all"
              ? "border-blue-500"
              : "border-transparent hover:border-gray-300"
          }`}
        >
          <p className="text-sm text-gray-600">Total Cases (Unfiltered)</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div
          onClick={() => setFilter("pending")}
          className={`bg-orange-50 p-4 rounded-lg border-2 cursor-pointer transition ${
            filter === "pending"
              ? "border-orange-500"
              : "border-transparent hover:border-orange-300"
          }`}
        >
          <p className="text-sm text-orange-800">Ongoing Cases</p>
          <p className="text-3xl font-bold text-orange-900">{stats.ongoing}</p>
        </div>
        <div
          onClick={() => setFilter("closed")}
          className={`bg-green-50 p-4 rounded-lg border-2 cursor-pointer transition ${
            filter === "closed"
              ? "border-green-500"
              : "border-transparent hover:border-green-300"
          }`}
        >
          <p className="text-sm text-green-800">Settled Cases</p>
          <p className="text-3xl font-bold text-green-900">{stats.settled}</p>
        </div>
        <div
          onClick={() => setFilter("assigned-obtained")}
          className={`bg-purple-50 p-4 rounded-lg border-2 cursor-pointer transition ${
            filter === "assigned-obtained"
              ? "border-purple-500"
              : "border-transparent hover:border-purple-300"
          }`}
        >
          <p className="text-sm text-purple-800">Assigned Obtained</p>
          <p className="text-3xl font-bold text-purple-900">
            {stats.assignedObtained}
          </p>
        </div>
      </div>

      {/* Legal Cases Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Legal Cases
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Claimed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.map((legalCase) => (
                <tr key={legalCase.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {legalCase.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {legalCase.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {legalCase.amountClaimed}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {legalCase.filed}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                        legalCase.status
                      )}`}
                    >
                      {getStatusLabel(legalCase.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(legalCase)}
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

      {/* Modals should be inside the JSX tree */}
      {showDemandNoticeForm && (
        <DemandNoticeForm
          onClose={() => setShowDemandNoticeForm(false)}
          onSubmit={(data) => {
            console.log("Demand Notice submitted:", data);
            setShowDemandNoticeForm(false);
          }}
        />
      )}

      {showAddCaseForm && (
        <AddNewCaseForm
          onClose={() => setShowAddCaseForm(false)}
          onSubmit={(data) => {
            console.log("New Case submitted:", data);
            setShowAddCaseForm(false);
          }}
        />
      )}

      {/* Legal Detail Modal */}
      <LegalDetailModal
        legalCase={selectedCase}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCase(null);
        }}
      />

      {/* Legal Upload Modal */}
      <LegalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default LegalManagementDashboard;
