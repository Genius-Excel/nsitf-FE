"use client";
import React, { useState, useEffect } from "react";
import { FileText, Shield, CheckCircle, AlertCircle, Plus } from "lucide-react";
import {
  StatisticsCards,
  RecentHSEActivities,
  MonthlySummary,
  ComplianceRate,
  HSEFormModal,
  ViewDetailsModal,
} from "./hseDesign";
import { HSEActivity, StatCard, HSEFormData } from "@/lib/types";
import { mockHSEActivities } from "@/lib/Constants";

export default function HSEManagement() {
  // ============== STATE ==============
  const [activities, setActivities] = useState<HSEActivity[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [viewingActivity, setViewingActivity] = useState<HSEActivity | null>(
    null
  );
  const [formData, setFormData] = useState<HSEFormData>({
    type: "",
    organization: "",
    date: "",
    status: "",
    details: "",
    recommendations: "",
  });

  // ============== INITIALIZATION ==============
  useEffect(() => {
    setIsClient(true);
    setActivities(mockHSEActivities);
  }, []);

  // ============== HANDLERS ==============
  const handleAddNew = () => {
    setEditingActivityId(null);
    setFormData({
      type: "",
      organization: "",
      date: "",
      status: "",
      details: "",
      recommendations: "",
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (activity: HSEActivity) => {
    setEditingActivityId(activity.id);
    setFormData({
      type: activity.type,
      organization: activity.organization,
      date: activity.date,
      status: activity.status,
      details: activity.details || "",
      recommendations: activity.recommendations || "",
    });
    setIsFormModalOpen(true);
  };

  const handleViewDetails = (activity: HSEActivity) => {
    setViewingActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    if (
      !formData.type ||
      !formData.organization ||
      !formData.date ||
      !formData.status ||
      !formData.details
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const icon =
        formData.type === "OSH Awareness"
          ? "🛡️"
          : formData.type === "Safety Audit"
          ? "✓"
          : formData.type === "Accident Investigation"
          ? "⚠️"
          : "📋";

      if (editingActivityId) {
        // UPDATE ACTIVITY
        setActivities(
          activities.map((activity) =>
            activity.id === editingActivityId
              ? {
                  ...activity,
                  type: formData.type as HSEActivity["type"],
                  organization: formData.organization,
                  date: formData.date,
                  status: formData.status as HSEActivity["status"],
                  details: formData.details,
                  recommendations: formData.recommendations,
                  icon,
                }
              : activity
          )
        );
      } else {
        // CREATE NEW ACTIVITY
        const newActivity: HSEActivity = {
          id: Date.now().toString(),
          type: formData.type as HSEActivity["type"],
          organization: formData.organization,
          date: formData.date,
          status: formData.status as HSEActivity["status"],
          details: formData.details,
          recommendations: formData.recommendations,
          icon,
        };
        setActivities([newActivity, ...activities]);
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error saving HSE record:", error);
      alert("An error occurred while saving the HSE record.");
    }
  };

  // ============== CALCULATIONS ==============
  // Total actual OSH activities (all activities)
  const actualOsh = activities.length;

  // Target OSH activities (you may want to set this as a constant or fetch from config)
  const targetOsh = 50; // Example target

  // Performance rate calculation (completed / total * 100)
  const completedCount = activities.filter(
    (a) => a.status === "Completed"
  ).length;
  const performanceRate =
    actualOsh > 0 ? Math.round((completedCount / actualOsh) * 100) : 0;

  // Count by activity type
  const OshEnlightenment = activities.filter(
    (a) => a.type === "OSH Awareness"
  ).length;

  const OshAudit = activities.filter((a) => a.type === "Safety Audit").length;

  const AccidentIncidentInvestigation = activities.filter(
    (a) => a.type === "Accident Investigation"
  ).length;

  const underInvestigationCount = activities.filter(
    (a) => a.status === "Under Investigation"
  ).length;
  const followUpRequiredCount = activities.filter(
    (a) => a.status === "Follow-up Required"
  ).length;

  const compliancePercentage = 92;
  const complianceChange = "↑ 3% from last month";

  // ============== STATISTICS ==============
  const stats: StatCard[] = [
    {
      title: "Total Actual OSH Activities",
      value: actualOsh,
      description: "All HSE activities recorded",
      change: "",
      icon: <FileText />,
      bgColor: "#00a63e",
    },
    {
      title: "Target OSH Activities",
      value: targetOsh,
      description: "Monthly target activities",
      change: "",
      icon: <Shield />,
      bgColor: "#00a63e",
    },
    {
      title: "Performance Rate",
      value: `${performanceRate}%`,
      description: "Completion rate",
      change: "",
      icon: <CheckCircle />,
      bgColor: "#3b82f6",
    },
    {
      title: "OSH Enlightenment & Awareness",
      value: OshEnlightenment,
      description: "Training & awareness programs",
      change: "",
      icon: <Shield />,
      bgColor: "#a855f7",
    },
    {
      title: "OSH Inspection & Audit",
      value: OshAudit,
      description: "Completed workplace audits",
      change: "",
      icon: <CheckCircle />,
      bgColor: "#3b82f6",
    },
    {
      title: "Accident & Incident Investigation",
      value: AccidentIncidentInvestigation,
      description: "Incident investigations",
      change: "",
      icon: <AlertCircle />,
      bgColor: "#ef4444",
    },
  ];

  const monthlySummaryData = [
    { label: "Total Activities", value: activities.length },
    { label: "Completed", value: completedCount },
    { label: "Under Investigation", value: underInvestigationCount },
    { label: "Follow-up Required", value: followUpRequiredCount },
  ];

  // Don't render until client-side
  if (!isClient) {
    return null;
  }

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Health, Safety & Environment (HSE)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage workplace safety and environmental compliance
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            style={{ backgroundColor: "#00a63e" }}
            className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add HSE Record
          </button>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards stats={stats} />

        {/* Recent HSE Activities */}
        <RecentHSEActivities
          activities={activities}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Summary */}
          <div className="lg:col-span-2">
            <MonthlySummary data={monthlySummaryData} />
          </div>

          {/* Compliance Rate */}
          <div className="lg:col-span-1">
            <ComplianceRate
              percentage={compliancePercentage}
              change={complianceChange}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <HSEFormModal
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSave={handleSave}
        formData={formData}
        onFormChange={setFormData}
        isEditing={editingActivityId !== null}
      />

      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        activity={viewingActivity}
      />
    </div>
  );
}
