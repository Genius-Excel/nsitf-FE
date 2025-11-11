"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, FileText, Plus, Shield } from "lucide-react";
import {
  StatisticsCards,
  RecentHSEActivities,
  MonthlySummary,
  ComplianceRate,
  HSEFormModal,
  ViewDetailsModal,
} from "./hseDesign";
import { HSEActivity, StatCard, HSEFormData } from "@/lib/types";
import {
  useCreateHSERecord,
  useEditHseRecord,
  useGEtDashboardMetrics,
} from "@/services/HSE";
import { getActivityStatusColor } from "@/lib/utils";

export default function HSEManagement() {
  // ============== STATE ==============
  const [activities, setActivities] = useState<HSEActivity[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [viewingActivity, setViewingActivity] = useState<HSEActivity | null>(null);
  const [formData, setFormData] = useState<HSEFormData>({
    type: "",
    organization: "",
    date: "",
    status: "",
    details: "",
    recommendations: "",
    safetyComplianceRate: ""
  });

  // ============== QUERIES / MUTATIONS ==============
  const { HSERecordPayload } = useCreateHSERecord();
  const { editHSEPayload } = useEditHseRecord();
  const { HSEData, gettingHSErData, HSEError } = useGEtDashboardMetrics({ enabled: true });

  // ============== INITIALIZATION ==============
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ============== TRANSFORM API → HSEActivity ==============
  useEffect(() => {
    if (!HSEData) return;

    const typeToIcon: Record<string, React.ReactNode> = {
      "Letter Issued": <FileText className="w-5 h-5" />,
      "OSH Awareness": <Shield className="w-5 h-5" />,
      "Safety Audit": <CheckCircle className="w-5 h-5" />,
      "Accident Investigation": <AlertCircle className="w-5 h-5" />,
    };

    const apiActivities: HSEActivity[] = HSEData.recent_activities.map((a: any) => {
      const recordTypeMap: Record<string, string> = {
        letter_issued: "Letter Issued",
        osh_awareness: "OSH Awareness",
        safety_audit: "Safety Audit",
        incident_investigation: "Accident Investigation",
      };

      const statusMap: Record<string, string> = {
        completed: "Completed",
        pending: "Under Investigation",
        follow_up_required: "Follow-up Required",
      };

      const type = recordTypeMap[a.record_type] || a.record_type;
      return {
        id: a.id,
        type,
        organization: a.employer,
        date: a.date_logged,
        status: statusMap[a.status] || a.status,
        details: a.details || "",
        recommendations: a.recommendations || "",
        icon: typeToIcon[type] || <FileText className="w-5 h-5" />,
      } as HSEActivity;
    });

    setActivities(apiActivities);
  }, [HSEData]);

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
    if (!formData.type || !formData.organization || !formData.date || !formData.status || !formData.details) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      record_type: formData.type.toLowerCase().replace(/\s+/g, "_"),
      employer: formData.organization,
      status: formData.status.toLowerCase().replace(/\s+/g, "_"),
      date_logged: formData.date,
      details: formData.details,
      recommendations: formData.recommendations,
      safety_compliance_rate: formData.safetyComplianceRate ? Number(formData.safetyComplianceRate) : undefined,
    };

    try {
      if (editingActivityId) {
         editHSEPayload({ id: editingActivityId, ...payload });
      } else {
        const tempId = Date.now().toString();
        const newActivity: HSEActivity = {
          id: tempId,//@ts-ignore
          type: formData.type,
          organization: formData.organization,
          date: formData.date,//@ts-ignore
          status: formData.status,
          details: formData.details,
          recommendations: formData.recommendations,
          icon: getIconForType(formData.type),
        };
        setActivities(prev => [newActivity, ...prev]);
         HSERecordPayload(payload);
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save record.");
    }
  };

  const getIconForType = (type: string): React.ReactNode => {
    const map: Record<string, React.ReactNode> = {
      "Letter Issued": <FileText className="w-5 h-5" />,
      "OSH Awareness": <Shield className="w-5 h-5" />,
      "Safety Audit": <CheckCircle className="w-5 h-5" />,
      "Accident Investigation": <AlertCircle className="w-5 h-5" />,
    };
    return map[type] || <FileText className="w-5 h-5" />;
  };

  // ============== STATISTICS (from API) ==============
  const totals = HSEData?.totals_by_record_type ?? {
    letter_issued: 0,
    osh_awareness: 0,
    safety_audit: 0,
    incident_investigation: 0,
  };

  const stats: StatCard[] = [
    {
      title: "Letters Issued",
      value: totals.letter_issued,
      description: "Safety compliance letters",
      icon: <FileText />,
      bgColor: "#00a63e",
    },
    {
      title: "OSH Awareness Sessions",
      value: totals.osh_awareness,
      description: "Training & awareness programs",
      icon: <Shield />,
      bgColor: "#00a63e",
    },
    {
      title: "Safety Audits",
      value: totals.safety_audit,
      description: "Completed workplace audits",
      change: "",
      icon: <CheckCircle />,
      bgColor: "#3b82f6",
    },
    {
      title: "Accident Investigations",
      value: totals.incident_investigation,
      description: "Incident investigations",
      change: "",
      icon: <AlertCircle />,
      bgColor: "#ef4444",
    },
  ];

  // ============== MONTHLY SUMMARY ==============
  const monthly = HSEData?.monthly_summary ?? {
    total_activities: 0,
    completed: 0,
    under_investigation: 0,
    follow_up_required: 0,
  };

  const monthlySummaryData = [
    { label: "Total Activities", value: monthly.total_activities },
    { label: "Completed", value: monthly.completed },
    { label: "Under Investigation", value: monthly.under_investigation },
    { label: "Follow-up Required", value: monthly.follow_up_required },
  ];

  // ============== COMPLIANCE RATE ==============
  const compliance = HSEData?.safety_compliance ?? { overall_rate: 0, percentage_increase: 0 };
  const compliancePercentage = compliance.overall_rate;
  const complianceChange = compliance.percentage_increase
    ? `${compliance.percentage_increase > 0 ? "Up" : "Down"} ${Math.abs(compliance.percentage_increase)}% from last month`
    : "No change";

  // ============== LOADING / ERROR ==============
  if (!isClient) return null;

  if (gettingHSErData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (HSEError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center text-red-600">
          Failed to load HSE data. Please try again later.
        </div>
      </div>
    );
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
            className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 flex items-center gap-2 transition-opacity"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <MonthlySummary data={monthlySummaryData} />
          </div>
          <div className="lg:col-span-1">
            <ComplianceRate percentage={compliancePercentage} change={complianceChange} />
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