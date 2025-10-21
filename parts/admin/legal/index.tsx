"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Bell, Plus } from "lucide-react";
import { cases, demandNotices } from "@/lib/Constants";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import DemandNoticeForm from "./demandNoticeForm";
import AddNewCaseForm from "./addNewCaseForm";

const LegalManagementDashboard = () => {
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>(
    {}
  );
  const [showDemandNoticeForm, setShowDemandNoticeForm] = useState(false);
  const [showAddCaseForm, setShowAddCaseForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
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

  const handleViewDetails = (caseId: string) => {
    setSelectedCase(caseId);
    alert(`Opening details for case ${caseId}`);
  };

  const handleDemandNotice = () => {
    setShowDemandNoticeForm(true);
  };

  const handleAddNewCase = () => {
    setShowAddCaseForm(true);
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

      {/* Legal Cases Timeline */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Legal Cases Timeline
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {filteredCases.map((legalCase) => (
            <div
              key={legalCase.id}
              className="border border-gray-200 rounded-lg bg-gray-50"
            >
              {/* Collapsed View */}
              <div className="p-4 flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="mt-0.5">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {legalCase.id}
                      </h3>
                      <span className="text-gray-600 text-sm">
                        - {legalCase.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {legalCase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(legalCase.id)}
                    className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                      legalCase.status
                    )} hover:opacity-90 transition whitespace-nowrap`}
                  >
                    {getStatusLabel(legalCase.status)}
                  </button>
                  <button
                    onClick={() => toggleCaseExpanded(legalCase.id)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    {expandedCases[legalCase.id] ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCases[legalCase.id] && (
                <div className="px-4 pb-4 border-t border-gray-200 pt-3 bg-white">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Created</p>
                      <p className="font-medium text-gray-900">
                        {legalCase.created}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">
                        Amount Claimed
                      </p>
                      <p className="font-medium text-gray-900">
                        {legalCase.amountClaimed}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">
                        Case Instituted
                      </p>
                      <p className="font-medium text-gray-900">
                        {legalCase.filed}
                      </p>
                    </div>
                    {legalCase.nextHearing && (
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">
                          Next Hearing
                        </p>
                        <p className="font-medium text-gray-900">
                          {legalCase.nextHearing}
                        </p>
                      </div>
                    )}
                  </div>

                  {legalCase.outcome && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">
                        Outcome:
                      </p>
                      <p className="text-sm text-gray-700">
                        {legalCase.outcome}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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
    </div>
  );
};

export default LegalManagementDashboard;
