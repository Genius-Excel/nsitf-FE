"use client";
import React, { useState, useEffect } from "react";
import {
  Eye,
  ChevronDown,
  CheckCircle,
  FileCheck,
  Pencil,
  X,
  Loader2,
  Edit,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { useBulkHSEActions } from "@/hooks/hse/useBulkHSEActions";
import type {
  HSERecord,
  HSEActivity,
  HSEFormData,
  HSEStatCard,
  RegionalSummary,
} from "@/lib/types/hse";
import { getActivityStatusColor } from "@/lib/utils";
import { getHSEStatusColor } from "@/lib/types/hse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";

export const StatisticsCards: React.FC<{ stats: HSEStatCard[] }> = ({
  stats,
}) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <MetricsGrid columns={6}>
      {stats.map((stat, idx) => (
        <MetricCard
          key={idx}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          colorScheme="green"
        />
      ))}
    </MetricsGrid>
  );
};

export const RecentHSEActivities: React.FC<{
  activities: HSEActivity[];
  onViewDetails: (activity: HSEActivity) => void;
  onEdit: (activity: HSEActivity) => void;
}> = ({ activities, onViewDetails, onEdit }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-muted-foreground">No activities found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Recent HSE Activities
        </h2>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-6 hover:bg-muted/50 transition-colors"
          >
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === activity.id ? null : activity.id)
              }
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 text-xl text-primary">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {activity.type}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.organization} • {activity.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${getActivityStatusColor(
                    activity.status
                  )} font-medium text-xs`}
                >
                  {activity.status}
                </Badge>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedId === activity.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {expandedId === activity.id && activity.details && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Details:</span>
                </p>
                <p className="text-sm text-gray-700">{activity.details}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onViewDetails(activity)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Full Report
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(activity)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonthlySummary: React.FC<{
  data: { label: string; value: number }[];
}> = ({ data }) => (
  <div className="bg-green-50 rounded-lg border border-green-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Monthly HSE Summary
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {data.map((item, idx) => (
        <div key={idx}>
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ComplianceRate: React.FC<{
  percentage: number;
  change: string;
}> = ({ percentage, change }) => (
  <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Safety Compliance Rate
    </h2>
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-600 mt-1">Overall HSE</p>
        </div>
      </div>
    </div>
    <p className="text-center text-sm text-gray-600 mt-4">{change}</p>
  </div>
);

// ============== ADD/EDIT HSE MODAL ==============
export const HSEFormModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  formData: HSEFormData;
  onFormChange: (data: HSEFormData) => void;
  isEditing: boolean;
}> = ({ isOpen, onOpenChange, onSave, formData, onFormChange, isEditing }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditing ? "Edit HSE Record" : "Add New HSE Record"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Record Type */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Record Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.recordType}
            onValueChange={(value) =>
              onFormChange({ ...formData, recordType: value })
            }
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letter issued">Letter Issued</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="incident report">Incident Report</SelectItem>
              <SelectItem value="compliance notice">
                Compliance Notice
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employer */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Employer/Organization <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter employer name"
            value={formData.employer}
            onChange={(e) =>
              onFormChange({ ...formData, employer: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.dateLogged}
            onChange={(e) =>
              onFormChange({ ...formData, dateLogged: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              onFormChange({ ...formData, status: value })
            }
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Under Investigation">
                Under Investigation
              </SelectItem>
              <SelectItem value="Follow-up Required">
                Follow-up Required
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Safety Compliance Rate */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Safety Compliance Rate (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 95"
            value={formData.safetyComplianceRate || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (
                val === "" ||
                (/^\d{0,3}$/.test(val) && parseInt(val) <= 100)
              ) {
                onFormChange({ ...formData, safetyComplianceRate: val });
              }
            }}
            className="mt-1 border-gray-200 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Enter a value between 0 and 100.
          </p>
        </div>

        {/* Details */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Details <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter detailed description of the HSE activity or incident"
            value={formData.details}
            onChange={(e) =>
              onFormChange({ ...formData, details: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm w-full p-2 border rounded-md min-h-[80px] resize-none"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Recommendations/Actions
          </label>
          <textarea
            placeholder="Enter recommendations or corrective actions"
            value={formData.recommendations}
            onChange={(e) =>
              onFormChange({ ...formData, recommendations: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm w-full p-2 border rounded-md min-h-[80px] resize-none"
          />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity bg-[#00a63e]"
        >
          {isEditing ? "Save Changes" : "Save Record"}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ============== VIEW FULL DETAILS MODAL ==============
export const ViewDetailsModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activity: HSEActivity | null;
  onEdit?: (activity: HSEActivity) => void;
  onApprove?: (activity: HSEActivity) => void;
}> = ({ isOpen, onOpenChange, activity, onEdit, onApprove }) => {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);

  React.useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const normalizedRole = userRole?.toLowerCase();
  const canEdit =
    normalizedRole &&
    ["admin", "manager", "regional_manager", "regional officer"].includes(
      normalizedRole
    );
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">
                {activity.type}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {activity.organization} • {activity.date}
              </p>
            </div>
            <Badge
              className={`${getActivityStatusColor(
                activity.status
              )} font-medium text-xs`}
            >
              {activity.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Details:
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {activity.details}
            </p>
          </div>

          {activity.recommendations && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Recommendations/Actions:
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {activity.recommendations}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Record Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Organization</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.organization}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.date}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between">
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(activity);
                  onOpenChange(false);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            )}
            {canApprove && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove(activity);
                  onOpenChange(false);
                }}
                className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity bg-[#00a63e]"
              >
                Approve
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============== REGIONAL RECORD VIEW MODAL ==============
export const RegionalRecordViewModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: RegionalSummary | null;
  onRefresh?: () => void;
}> = ({ isOpen, onOpenChange, record, onRefresh }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<RegionalSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bulkReview, bulkApprove, loading: apiLoading } = useBulkHSEActions();

  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  useEffect(() => {
    if (record && isOpen) {
      setEditedData(record);
      setIsEditMode(false);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // Permission checks (case-insensitive)
  const normalizedRole = userRole?.toLowerCase();
  const canEdit =
    normalizedRole &&
    ["regional_manager", "regional officer", "admin", "manager"].includes(
      normalizedRole
    );
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer" ||
    normalizedRole === "admin" ||
    normalizedRole === "manager";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  const displayData = editedData || record;

  const handleEdit = () => {
    setIsEditMode(true);
    toast.info("You can now edit the HSE record");
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(record);
    toast.info("Changes discarded");
  };

  const handleSaveEdit = async () => {
    if (!record?.id || !editedData) {
      toast.error("Record ID or data not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const httpService = new (
        await import("@/services/httpServices")
      ).default();

      // Transform data to API format (snake_case)
      const payload = {
        total_actual_osh_activities: editedData.totalActualOSHActivities,
        target_osh_activities: editedData.targetOSHActivities,
        osh_enlightenment: editedData.oshEnlightenment,
        osh_inspection_audit: editedData.oshInspectionAudit,
        accident_investigation: editedData.accidentInvestigation,
        period: editedData.period,
      };

      await httpService.patchData(
        payload,
        `/api/hse-ops/manage-hse/${record.id}`
      );

      toast.success("HSE record updated successfully");
      setIsEditMode(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to update HSE record");
      console.error("Error updating HSE record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };

  const handleReviewedClick = () => {
    setConfirmAction("reviewed");
    setShowConfirmDialog(true);
  };

  const handleApproveClick = () => {
    setConfirmAction("approve");
    setShowConfirmDialog(true);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!record?.id || !confirmAction || !editedData) return;

    try {
      const success =
        confirmAction === "reviewed"
          ? await bulkReview([record.id])
          : await bulkApprove([record.id]);

      if (success) {
        // Update local state to reflect the new status immediately
        const user = getUserFromStorage();
        const newStatus =
          confirmAction === "reviewed" ? "reviewed" : "approved";
        const userIdentifier = user?.email || user?.username || "Unknown User";

        const updatedData: RegionalSummary = {
          ...editedData,
          record_status: newStatus,
          reviewed_by:
            confirmAction === "reviewed"
              ? userIdentifier
              : editedData.reviewed_by || null,
          approved_by:
            confirmAction === "approve"
              ? userIdentifier
              : editedData.approved_by || null,
        };

        console.log("Updating modal state:", {
          old: editedData.record_status,
          new: newStatus,
        });
        setEditedData(updatedData);

        toast.success(
          confirmAction === "reviewed"
            ? "HSE record marked as reviewed successfully"
            : "HSE record approved successfully"
        );
        setShowConfirmDialog(false);
        setConfirmAction(null);
        if (onRefresh) onRefresh();
      } else {
        toast.error("Failed to update HSE record status");
      }
    } catch (error) {
      console.error("Error in handleConfirmAction:", error);
      toast.error("Failed to update HSE record status");
    }
  };

  const renderField = (
    label: string,
    value: any,
    field: string,
    type: "text" | "number" = "text"
  ) => {
    if (isEditMode && editedData) {
      return (
        <div>
          <p className="text-xs text-gray-600 uppercase mb-1">{label}</p>
          <input
            type={type}
            value={(editedData as any)[field] || ""}
            onChange={(e) =>
              handleFieldChange(
                field,
                type === "number" ? parseFloat(e.target.value) : e.target.value
              )
            }
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
          />
        </div>
      );
    }
    return (
      <div>
        <p className="text-xs text-gray-600 uppercase">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => !isEditMode && onOpenChange(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Regional HSE Record Details
                  </h2>
                  {displayData.record_status && (
                    <Badge
                      className={
                        displayData.record_status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : displayData.record_status.toLowerCase() ===
                            "reviewed"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-green-100 text-green-800 border-green-300"
                      }
                    >
                      {displayData.record_status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {displayData.region} - {displayData.branch} -{" "}
                  {displayData.period}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {record && canEdit && !isEditMode && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {isEditMode && (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </>
              )}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Location Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {renderField("Region", displayData.region, "region")}
                {renderField("Branch", displayData.branch, "branch")}
                {renderField("Period", displayData.period, "period")}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Total Actual OSH Activities",
                      displayData.totalActualOSHActivities,
                      "totalActualOSHActivities",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Total Actual OSH Activities
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {record.totalActualOSHActivities.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Target OSH Activities",
                      displayData.targetOSHActivities,
                      "targetOSHActivities",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Target OSH Activities
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {record.targetOSHActivities.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Performance Rate
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {record.performanceRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-cyan-50 rounded-lg p-6 border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Activity Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "OSH Enlightenment & Awareness",
                      displayData.oshEnlightenment,
                      "oshEnlightenment",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        OSH Enlightenment & Awareness
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {record.oshEnlightenment.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "OSH Inspection & Audit",
                      displayData.oshInspectionAudit,
                      "oshInspectionAudit",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        OSH Inspection & Audit
                      </p>
                      <p className="text-2xl font-bold text-cyan-700">
                        {record.oshInspectionAudit.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Accident Investigation",
                      displayData.accidentInvestigation,
                      "accidentInvestigation",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Accident Investigation
                      </p>
                      <p className="text-2xl font-bold text-red-700">
                        {record.accidentInvestigation.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            {displayData.record_status && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Audit Trail
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Record Status
                    </p>
                    <Badge
                      className={`mt-1 ${
                        displayData.record_status.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-800"
                          : displayData.record_status.toLowerCase() ===
                            "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {displayData.record_status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Reviewed By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayData.reviewed_by || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Approved By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayData.approved_by || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {!isEditMode &&
              displayData.record_status?.toLowerCase() === "pending" &&
              canReview && (
                <Button
                  onClick={handleReviewedClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Review
                </Button>
              )}
            {!isEditMode &&
              displayData.record_status?.toLowerCase() === "reviewed" &&
              canApprove && (
                <Button
                  onClick={handleApproveClick}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              )}
            {!isEditMode &&
              displayData.record_status?.toLowerCase() === "approved" && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[60]"
            onClick={handleCancelConfirm}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    confirmAction === "reviewed"
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  }`}
                >
                  <AlertCircle
                    className={`w-6 h-6 ${
                      confirmAction === "reviewed"
                        ? "text-blue-600"
                        : "text-purple-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {confirmAction === "reviewed"
                      ? "Mark as Reviewed?"
                      : "Approve HSE Record?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this HSE record as reviewed? This action will update the record status."
                      : "Are you sure you want to approve this HSE record? This action will finalize the approval."}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  onClick={handleCancelConfirm}
                  variant="outline"
                  disabled={apiLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={apiLoading}
                  className={
                    confirmAction === "reviewed"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  }
                >
                  {apiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {confirmAction === "reviewed"
                        ? "Yes, Mark as Reviewed"
                        : "Yes, Approve"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// ============== REGIONAL OSH ACTIVITIES SUMMARY TABLE ==============
export const RegionalOSHSummaryTable: React.FC<{
  regionalData: RegionalSummary[];
  onRefresh?: () => void;
  onView?: (record: RegionalSummary) => void;
  onReview?: (recordId: string) => void;
}> = ({ regionalData, onRefresh, onView, onReview }) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const {
    bulkReview,
    bulkApprove,
    loading: isSubmitting,
  } = useBulkHSEActions();

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const normalizedRole = userRole?.toLowerCase();
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  const handleSelectAll = () => {
    if (selectedRecords.size === regionalData.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(regionalData.map((r) => r.id)));
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleBulkReview = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    const recordIds = Array.from(selectedRecords);
    const success = await bulkReview(recordIds);

    if (success) {
      toast.success(`${recordIds.length} record(s) marked as reviewed`);
      setSelectedRecords(new Set());
      if (onRefresh) {
        onRefresh();
      }
    } else {
      toast.error("Failed to review records");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    const recordIds = Array.from(selectedRecords);
    const success = await bulkApprove(recordIds);

    if (success) {
      toast.success(`${recordIds.length} record(s) approved successfully`);
      setSelectedRecords(new Set());
      if (onRefresh) {
        onRefresh();
      }
    } else {
      toast.error("Failed to approve records");
    }
  };

  if (!regionalData || regionalData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No regional OSH data available</p>
      </div>
    );
  }

  const getPerformanceBadge = (rate: number): string => {
    if (rate >= 80) return "bg-green-100 text-green-700";
    if (rate >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {selectedRecords.size > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedRecords.size} record(s) selected
          </span>
          <div className="flex gap-2">
            {canReview && (
              <Button
                onClick={handleBulkReview}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Mark as Reviewed"}
              </Button>
            )}
            {canApprove && (
              <Button
                onClick={handleBulkApprove}
                disabled={isSubmitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Approve Selected"}
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-base font-bold text-gray-900">
          Regional OSH Activities Summary
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                <input
                  type="checkbox"
                  checked={selectedRecords.size === regionalData.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  aria-label="Select all records"
                />
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Region
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Branch
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Total Actual OSH Activities
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Target OSH Activities
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Performance Rate (%)
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                OSH Enlightenment & Awareness
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                OSH Inspection & Audit
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Accident Investigation
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Period
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                APPROVAL STATUS
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regionalData.map((data) => (
              <tr key={data.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRecords.has(data.id)}
                    onChange={() => handleSelectRecord(data.id)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label={`Select record for ${data.branch}`}
                  />
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {data.region}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {data.branch}
                </td>
                <td className="px-4 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                  {data.totalActualOSHActivities.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                  {data.targetOSHActivities.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-center whitespace-nowrap">
                  <Badge
                    className={`${getPerformanceBadge(
                      data.performanceRate
                    )} font-medium`}
                  >
                    {data.performanceRate}%
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                  {data.oshEnlightenment.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                  {data.oshInspectionAudit.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                  {data.accidentInvestigation.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {data.period}
                </td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.record_status?.toLowerCase() === "approved"
                        ? "bg-green-100 text-green-800"
                        : data.record_status?.toLowerCase() === "reviewed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {data.record_status || "Pending"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(data)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onReview && canReview && (
                      <button
                        onClick={() => onReview(data.id)}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Review"
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============== HSE RECORDS TABLE ==============
export const HSERecordsTable: React.FC<{
  records: HSERecord[];
  onViewDetails: (record: HSERecord) => void;
}> = ({ records, onViewDetails }) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const normalizedRole = userRole?.toLowerCase();
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  const handleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map((r) => r.id)));
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleBulkReview = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk review HSE records
      // const response = await fetch('/api/hse/bulk-review', {
      //   method: 'POST',
      //   body: JSON.stringify({ recordIds: Array.from(selectedRecords) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedRecords.size} record(s) marked as reviewed`);
      setSelectedRecords(new Set());
    } catch (error) {
      toast.error("Failed to review records");
      console.error("Bulk review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk approve HSE records
      // const response = await fetch('/api/hse/bulk-approve', {
      //   method: 'POST',
      //   body: JSON.stringify({ recordIds: Array.from(selectedRecords) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedRecords.size} record(s) approved successfully`);
      setSelectedRecords(new Set());
    } catch (error) {
      toast.error("Failed to approve records");
      console.error("Bulk approve error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No HSE records found</p>
      </div>
    );
  }

  // Helper to get compliance rate badge color
  const getComplianceBadge = (rate: number): string => {
    if (rate >= 80) return "bg-green-100 text-green-700";
    if (rate >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {selectedRecords.size > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedRecords.size} record(s) selected
          </span>
          <div className="flex gap-2">
            {canReview && (
              <Button
                onClick={handleBulkReview}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Mark as Reviewed"}
              </Button>
            )}
            {canApprove && (
              <Button
                onClick={handleBulkApprove}
                disabled={isSubmitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Approve Selected"}
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                <input
                  type="checkbox"
                  checked={selectedRecords.size === records.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  aria-label="Select all records"
                />
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Record Type
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Employer
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Date Logged
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Safety Compliance (%)
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Status
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 uppercase tracking-wide break-words">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRecords.has(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label={`Select record for ${record.employer}`}
                  />
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {record.recordType}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {record.employer}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {new Date(record.dateLogged).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <Badge
                    className={`${getComplianceBadge(
                      record.safetyComplianceRate
                    )} font-medium`}
                  >
                    {record.safetyComplianceRate}%
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <Badge
                    className={`${getHSEStatusColor(
                      record.status
                    )} font-medium`}
                  >
                    {record.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewDetails(record)}
                    title={`View details for ${record.employer}`}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                    aria-label={`View details for ${record.employer}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
