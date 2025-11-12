// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   FileText,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   Plus,
//   List,
//   Grid,
// } from "lucide-react";
// import {
//   StatisticsCards,
//   RecentHSEActivities,
//   MonthlySummary,
//   ComplianceRate,
//   HSEFormModal,
//   ViewDetailsModal,
//   HSERecordsTable,
// } from "./hseDesign";
// import { HSEActivity, StatCard, HSEFormData, HSERecord } from "@/lib/types";
// import { mockHSEActivities, mockHSERecords } from "@/lib/Constants";
// import { HSETableDetailModal } from "./hseModal";

// export default function HSEManagement() {
//   // ============== STATE ==============
//   const [activities, setActivities] = useState<HSEActivity[]>([]);
//   const [hseRecords, setHseRecords] = useState<HSERecord[]>([]);
//   const [isClient, setIsClient] = useState(false);
//   const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isTableDetailModalOpen, setIsTableDetailModalOpen] = useState(false);
//   const [editingActivityId, setEditingActivityId] = useState<string | null>(
//     null
//   );
//   const [viewingActivity, setViewingActivity] = useState<HSEActivity | null>(
//     null
//   );
//   const [selectedRecord, setSelectedRecord] = useState<HSERecord | null>(null);
//   const [viewMode, setViewMode] = useState<"activities" | "table">(
//     "activities"
//   );
//   const [formData, setFormData] = useState<HSEFormData>({
//     type: "",
//     organization: "",
//     date: "",
//     status: "",
//     details: "",
//     recommendations: "",
//   });

//   // ============== INITIALIZATION ==============
//   useEffect(() => {
//     setIsClient(true);
//     setActivities(mockHSEActivities);
//     setHseRecords(mockHSERecords);
//   }, []);

//   // ============== HANDLERS ==============
//   const handleAddNew = () => {
//     setEditingActivityId(null);
//     setFormData({
//       type: "",
//       organization: "",
//       date: "",
//       status: "",
//       details: "",
//       recommendations: "",
//     });
//     setIsFormModalOpen(true);
//   };

//   const handleEdit = (activity: HSEActivity) => {
//     setEditingActivityId(activity.id);
//     setFormData({
//       type: activity.type,
//       organization: activity.organization,
//       date: activity.date,
//       status: activity.status,
//       details: activity.details || "",
//       recommendations: activity.recommendations || "",
//     });
//     setIsFormModalOpen(true);
//   };

//   const handleViewDetails = (activity: HSEActivity) => {
//     setViewingActivity(activity);
//     setIsViewModalOpen(true);
//   };

//   const handleViewRecordDetails = (record: HSERecord) => {
//     setSelectedRecord(record);
//     setIsTableDetailModalOpen(true);
//   };

//   const handleSave = async () => {
//     if (
//       !formData.type ||
//       !formData.organization ||
//       !formData.date ||
//       !formData.status ||
//       !formData.details
//     ) {
//       alert("Please fill in all required fields");
//       return;
//     }

//     try {
//       const icon = getIconForType(formData.type);

//       if (editingActivityId) {
//         // UPDATE ACTIVITY
//         setActivities(
//           activities.map((activity) =>
//             activity.id === editingActivityId
//               ? {
//                   ...activity,
//                   type: formData.type as HSEActivity["type"],
//                   organization: formData.organization,
//                   date: formData.date,
//                   status: formData.status as HSEActivity["status"],
//                   details: formData.details,
//                   recommendations: formData.recommendations,
//                   icon,
//                 }
//               : activity
//           )
//         );
//       } else {
//         // CREATE NEW ACTIVITY
//         const newActivity: HSEActivity = {
//           id: Date.now().toString(),
//           type: formData.type as HSEActivity["type"],
//           organization: formData.organization,
//           date: formData.date,
//           status: formData.status as HSEActivity["status"],
//           details: formData.details,
//           recommendations: formData.recommendations,
//           icon,
//         };
//         setActivities([newActivity, ...activities]);
//       }
//       setIsFormModalOpen(false);
//     } catch (error) {
//       console.error("Error saving HSE record:", error);
//       alert("An error occurred while saving the HSE record.");
//     }
//   };

//   const getIconForType = (type: string): string => {
//     const map: Record<string, string> = {
//       "Letter Issued": "📋",
//       "OSH Awareness": "🛡️",
//       "Safety Audit": "✓",
//       "Accident Investigation": "⚠️",
//     };
//     return map[type] || "📋";
//   };

//   // ============== CALCULATIONS ==============
//   // Count by activity type
//   const letterIssuedCount = activities.filter(
//     (a) => a.type === "Letter Issued"
//   ).length;

//   const OshEnlightenment = activities.filter(
//     (a) => a.type === "OSH Awareness"
//   ).length;

//   const OshAudit = activities.filter((a) => a.type === "Safety Audit").length;

//   const AccidentIncidentInvestigation = activities.filter(
//     (a) => a.type === "Accident Investigation"
//   ).length;

//   // ============== STATISTICS ==============
//   const stats: StatCard[] = [
//     {
//       title: "Total Actual OSH Activities",
//       value: letterIssuedCount,
//       description: "Safety compliance letters",
//       icon: <FileText />,
//       bgColor: "#00a63e",
//     },
//     {
//       title: "Target OSH Activities",
//       value: OshEnlightenment,
//       description: "Training & awareness programs",
//       icon: <Shield />,
//       bgColor: "#00a63e",
//     },
//     {
//       title: "Performance Rate",
//       value: OshAudit,
//       description: "Completed workplace audits",
//       change: "",
//       icon: <CheckCircle />,
//       bgColor: "#3b82f6",
//     },
//     {
//       title: "OSH Enlightenment & Awareness",
//       value: AccidentIncidentInvestigation,
//       description: "Incident investigations",
//       change: "",
//       icon: <AlertCircle />,
//       bgColor: "blue",
//     },
//     {
//       title: "OSH Inspection & Audit",
//       value: letterIssuedCount,
//       description: "Safety compliance letters",
//       icon: <FileText />,
//       bgColor: "#00a63e",
//     },
//     {
//       title: "Accident & Incident  Investigation",
//       value: AccidentIncidentInvestigation,
//       description: "Incident investigations",
//       change: "",
//       icon: <AlertCircle />,
//       bgColor: "#ef4444",
//     },
//   ];

//   // ============== MONTHLY SUMMARY ==============
//   const completedCount = activities.filter(
//     (a) => a.status === "resolved"
//   ).length;

//   const underInvestigationCount = activities.filter(
//     (a) => a.status === "progress"
//   ).length;

//   const followUpRequiredCount = activities.filter(
//     (a) => a.status === "closed"
//   ).length;

//   const monthlySummaryData = [
//     { label: "Total Activities", value: activities.length },
//     { label: "Completed", value: completedCount },
//     { label: "Under Investigation", value: underInvestigationCount },
//     { label: "Follow-up Required", value: followUpRequiredCount },
//   ];

//   // ============== COMPLIANCE RATE ==============
//   const compliancePercentage = 92;
//   const complianceChange = "↑ 3% from last month";

//   // Don't render until client-side
//   if (!isClient) {
//     return null;
//   }

//   // ============== RENDER ==============
//   return (
//     <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 flex justify-between items-start">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Health, Safety & Environment (HSE)
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//               Manage workplace safety and environmental compliance
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             {/* View Toggle */}
//             <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
//               <button
//                 onClick={() => setViewMode("activities")}
//                 className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
//                   viewMode === "activities"
//                     ? "bg-green-600 text-white"
//                     : "text-gray-600 hover:bg-gray-100"
//                 }`}
//               >
//                 <Grid className="w-4 h-4" />
//                 Activities
//               </button>
//               <button
//                 onClick={() => setViewMode("table")}
//                 className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
//                   viewMode === "table"
//                     ? "bg-green-600 text-white"
//                     : "text-gray-600 hover:bg-gray-100"
//                 }`}
//               >
//                 <List className="w-4 h-4" />
//                 Table View
//               </button>
//             </div>

//             <button
//               type="button"
//               onClick={handleAddNew}
//               style={{ backgroundColor: "#00a63e" }}
//               className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 flex items-center gap-2"
//             >
//               <Plus className="w-4 h-4" />
//               Add HSE Record
//             </button>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         <StatisticsCards stats={stats} />

//         {/* Conditional View: Activities or Table */}
//         {viewMode === "activities" ? (
//           <>
//             {/* Recent HSE Activities */}
//             <RecentHSEActivities
//               activities={activities}
//               onViewDetails={handleViewDetails}
//               onEdit={handleEdit}
//             />

//             {/* Bottom Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Monthly Summary */}
//               <div className="lg:col-span-2">
//                 <MonthlySummary data={monthlySummaryData} />
//               </div>

//               {/* Compliance Rate */}
//               <div className="lg:col-span-1">
//                 <ComplianceRate
//                   percentage={compliancePercentage}
//                   change={complianceChange}
//                 />
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             {/* HSE Records Table */}
//             <HSERecordsTable
//               records={hseRecords}
//               onViewDetails={handleViewRecordDetails}
//             />
//           </>
//         )}
//       </div>

//       {/* Modals */}
//       <HSEFormModal
//         isOpen={isFormModalOpen}
//         onOpenChange={setIsFormModalOpen}
//         onSave={handleSave}
//         formData={formData}
//         onFormChange={setFormData}
//         isEditing={editingActivityId !== null}
//       />

//       <ViewDetailsModal
//         isOpen={isViewModalOpen}
//         onOpenChange={setIsViewModalOpen}
//         activity={viewingActivity}
//       />

//       <HSETableDetailModal
//         record={selectedRecord}
//         isOpen={isTableDetailModalOpen}
//         onClose={() => {
//           setIsTableDetailModalOpen(false);
//           setSelectedRecord(null);
//         }}
//       />
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
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
  MonthlySummary,
  ComplianceRate,
  HSEFormModal,
  ViewDetailsModal,
  HSERecordsTable,
} from "./hseDesign";
import { StatCard, HSEFormData, HSERecord } from "@/lib/types";
import { HSETableDetailModal } from "./hseModal";
import { useGetHSEDashboard } from "@/hooks/useGetHSEDashboard";

export default function HSEManagement() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTableDetailModalOpen, setIsTableDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"activities" | "table">(
    "activities"
  );
  const [viewingActivity, setViewingActivity] = useState<any | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HSERecord | null>(null);
  const [formData, setFormData] = useState<HSEFormData>({
    type: "",
    organization: "",
    date: "",
    status: "",
    details: "",
    recommendations: "",
  });

  const {
    metrics,
    records,
    loading,
    error,
    fetchDashboardMetrics,
    fetchTableRecords,
  } = useGetHSEDashboard();

  // =============== Use Effects ===============

  useEffect(() => {
    if (viewMode === "activities") fetchDashboardMetrics();
    if (viewMode === "table") fetchTableRecords();
  }, [viewMode]);

  // =================== HANDLERS ===================
  const handleAddNew = () => {
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

  const handleViewDetails = (activity: any) => {
    setViewingActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleViewRecordDetails = (record: HSERecord) => {
    setSelectedRecord(record);
    setIsTableDetailModalOpen(true);
  };

  const handleSave = () => {
    alert("TODO: Implement create record API");
  };

  // =================== STATS ===================
  const stats: StatCard[] = metrics
    ? [
        {
          title: "Letters Issued",
          value: metrics.totals_by_record_type.letter_issued,
          description: "Safety compliance letters issued",
          icon: <FileText />,
          bgColor: "#00a63e",
        },
        {
          title: "OSH Awareness",
          value: metrics.totals_by_record_type.osh_awareness,
          description: "Awareness & training programs",
          icon: <Shield />,
          bgColor: "#22c55e",
        },
        {
          title: "Safety Audits",
          value: metrics.totals_by_record_type.safety_audit,
          description: "Audits performed this month",
          icon: <CheckCircle />,
          bgColor: "#3b82f6",
        },
        {
          title: "Incident Investigations",
          value: metrics.totals_by_record_type.incident_investigation,
          description: "Investigations conducted",
          icon: <AlertCircle />,
          bgColor: "#ef4444",
        },
      ]
    : [];

  const monthlySummaryData = metrics
    ? [
        {
          label: "Total Activities",
          value: metrics.monthly_summary.total_activities,
        },
        { label: "Completed", value: metrics.monthly_summary.completed },
        {
          label: "Under Investigation",
          value: metrics.monthly_summary.under_investigation,
        },
        {
          label: "Follow-up Required",
          value: metrics.monthly_summary.follow_up_required,
        },
      ]
    : [];

  const compliancePercentage = metrics?.safety_compliance.overall_rate ?? 0;
  const complianceChange = `${
    metrics?.safety_compliance.percentage_increase ?? 0
  }% change`;

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading HSE metrics...
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  // =================== RENDER ===================
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
              Overview of safety operations and compliance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("activities")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "activities"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-4 h-4" />
                Activities
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4" />
                Table View
              </button>
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
        </div>

        {/* Stats */}
        <StatisticsCards stats={stats} />

        {viewMode === "activities" ? (
          <RecentHSEActivities
            activities={
              (metrics?.recent_activities.map((item) => ({
                id: item.id,
                type: item.record_type,
                organization: item.employer,
                date: item.date_logged,
                status: item.status,
                details: item.details,
                recommendations: item.recommendations,
                icon: "📋",
              })) as any) || []
            }
            onViewDetails={handleViewDetails}
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
        onSave={handleSave}
        formData={formData}
        onFormChange={setFormData}
        isEditing={false}
      />

      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        activity={viewingActivity}
      />

      <HSETableDetailModal
        record={selectedRecord}
        isOpen={isTableDetailModalOpen}
        onClose={() => {
          setIsTableDetailModalOpen(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
}
