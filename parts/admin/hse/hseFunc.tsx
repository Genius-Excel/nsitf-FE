"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  List,
  Grid,
} from "lucide-react";
import {
  StatisticsCards,
  RecentHSEActivities,
  HSERecordsTable,
} from "./hseDesign";
import {
  HSEFormModal,
  ViewDetailsModal,
  HSETableDetailModal,
} from "./hseModal";
import HttpService from "@/services/httpServices";
import { routes } from "@/services/apiRoutes";
import {
  HSEActivity,
  HSERecord,
  HSERecordDetail,
  HSEFormData,
  StatCard,
  TableDetail,
} from "@/lib/types/hse";
import { inspect } from "util";

const http = new HttpService();

export default function HSEManagement() {
  const [viewMode, setViewMode] = useState<"activities" | "table">(
    "activities"
  );
  const [activities, setActivities] = useState<HSEActivity[]>([]);
  const [records, setRecords] = useState<HSERecord[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<HSEActivity | null>(
    null
  );
  const [selectedRecordDetail, setSelectedRecordDetail] =
    useState<HSERecordDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTableDetailModalOpen, setIsTableDetailModalOpen] = useState(false);

  const [formData, setFormData] = useState<HSEFormData>({
    type: "",
    organization: "",
    date: "",
    status: "",
    details: "",
    recommendations: "",
    safetyComplianceRate: "",
  });

  // ================= API FETCHERS =================
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.getData(routes.getHSEDashboardActivities());
      const json = res.data;

      const mapped: HSEActivity[] = json.data.map((a: any) => ({
        id: a.id,
        type: a.record_type,
        organization: a.employer,
        date: a.date_logged,
        icon: <FileText />,
        details: a.details || "",
        recommendations: a.recommendations || "",
        safetyComplianceRate: a.safety_compliance_rate || "0",
        status: a.status,
      }));

      setActivities(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.getData(routes.getHSEDashboardTable());
      const json = res.data;

      const mapped: HSERecord[] = json.data.regional_summary.map((r: any) => ({
        id: r.id,
        region: r.region,
        branch: r.branch,
        totalActualOSH: r.total_actual_osh_activities,
        targetOSH: r.target_osh_activities,
        performanceRate: r.performance_rate,
        oshEnlightenment: r.osh_enlightenment,
        oshInspectionAudit: r.osh_inspection_audit,
        accidentInvestigation: r.accident_investigation,
        activitiesPeriod: r.period,
      }));

      setRecords(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to fetch table records");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.getData(routes.getHSEBranchDetails(id));
      const json = res.data;
      setSelectedRecordDetail(json.data);
      setIsTableDetailModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch record detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "activities") fetchActivities();
    else fetchRecords();
  }, [viewMode]);

  // ================= STATS =================
  const stats: StatCard[] = useMemo(() => {
    if (!records || records.length === 0) return [];
    const totalActual = records.reduce((acc, r) => acc + r.totalActualOSH, 0);
    const totalEnlightenment = records.reduce(
      (acc, r) => acc + r.oshEnlightenment,
      0
    );
    const totalAudit = records.reduce(
      (acc, r) => acc + r.oshInspectionAudit,
      0
    );
    const totalInvestigation = records.reduce(
      (acc, r) => acc + r.accidentInvestigation,
      0
    );

    return [
      {
        title: "Total Actual OSH Activities",
        value: totalActual,
        description: "Target OSH Activities",
        icon: <FileText />,
        bgColor: "#00a63e",
      },
      {
        title: "Target OSH Activities",
        value: totalEnlightenment,
        description: "Target OSH Activities",
        icon: <Shield />,
        bgColor: "#22c55e",
      },
      {
        title: "Performance Rate",
        value: totalAudit,
        description: "Performance Rate",
        icon: <CheckCircle />,
        bgColor: "#3b82f6",
      },
      {
        title: "OSH Enlightenment & Awareness",
        value: totalInvestigation,
        description: "Accident Investigations",
        icon: <AlertCircle />,
        bgColor: "#ef4444",
      },
      {
        title: "OSH Inspection & Audit",
        value: totalAudit,
        description: "OSH Inspections & Audits",
        icon: <FileText />,
        bgColor: "#ef4444",
      },
      {
        title: "Accident & Incident Investigation",
        value: totalInvestigation,
        description: "Accident Investigations",
        icon: <Shield />,
        bgColor: "#ef4444",
      },
    ];
  }, [records]);

  // ================= HANDLERS =================
  const handleAddNew = () => {
    setFormData({
      type: "",
      organization: "",
      date: "",
      status: "",
      details: "",
      recommendations: "",
      safetyComplianceRate: "",
    });
    setIsFormModalOpen(true);
  };

  const handleViewActivity = (activity: HSEActivity) => {
    setSelectedActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleViewRecordDetails = (record: HSERecord) =>
    fetchRecordDetail(record.id);

  // ================= RENDER =================
  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading HSE data...</div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Occupational Safety & Health (OSH) View
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("activities")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "activities"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-4 h-4" /> Activities
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4" /> Table View
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddNew}
              style={{ backgroundColor: "#00a63e" }}
              className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add HSE Record
            </button>
          </div>
        </div>

        <StatisticsCards stats={stats} />

        {viewMode === "activities" ? (
          <RecentHSEActivities
            activities={activities}
            onViewDetails={handleViewActivity}
            onEdit={() => {}}
          />
        ) : (
          <HSERecordsTable
            records={records}
            onViewDetails={handleViewRecordDetails}
          />
        )}
      </div>

      {/* Modals */}
      <HSEFormModal
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSave={() => alert("TODO: implement save API")}
        formData={formData}
        onFormChange={setFormData}
        isEditing={false}
      />

      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        activity={selectedActivity}
      />

      {selectedRecordDetail && (
        <HSETableDetailModal
          isOpen={isTableDetailModalOpen}
          onClose={() => setIsTableDetailModalOpen(false)}
          record={selectedRecordDetail}
        />
      )}
    </div>
  );
}
