"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { HSEActivity, HSEFormData } from "@/lib/types/hse";
import { getActivityStatusColor } from "@/lib/utils";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

// ================= HSE FORM MODAL =================
export const HSEFormModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  formData: HSEFormData;
  onFormChange: (data: HSEFormData) => void;
  isEditing: boolean;
}> = ({ isOpen, onOpenChange, onSave, formData, onFormChange, isEditing }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Edit HSE Record" : "Add New HSE Record"}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Record Type */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Record Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) =>
                    onFormChange({ ...formData, recordType: e.target.value })
                  }
                  className="w-full border border-gray-300 text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Record Type"
                  aria-label="Record Type"
                >
                  <option value="">Select a type</option>
                  <option value="letter issued">Letter Issued</option>
                  <option value="inspection">Inspection</option>
                  <option value="incident report">Incident Report</option>
                  <option value="compliance notice">Compliance Notice</option>
                </select>
              </div>

              {/* Organization */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Employer/Organization <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter employer name"
                  value={formData.employer}
                  onChange={(e) =>
                    onFormChange({ ...formData, employer: e.target.value })
                  }
                  className="w-full border border-gray-300 text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateLogged}
                  onChange={(e) =>
                    onFormChange({ ...formData, dateLogged: e.target.value })
                  }
                  className="w-full border border-gray-300 text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Date"
                  aria-label="Date"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    onFormChange({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Status"
                  aria-label="Status"
                >
                  <option value="">Select status</option>
                  <option value="Completed">Completed</option>
                  <option value="Under Investigation">
                    Under Investigation
                  </option>
                  <option value="Follow-up Required">Follow-up Required</option>
                </select>
              </div>

              {/* Safety Compliance Rate */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Safety Compliance Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
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
                  className="w-full border border-gray-300 text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional. Enter a value between 0 and 100.
                </p>
              </div>

              {/* Details */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter detailed description of the HSE activity or incident"
                  value={formData.details}
                  onChange={(e) =>
                    onFormChange({ ...formData, details: e.target.value })
                  }
                  className="w-full border border-gray-300 text-sm rounded-md p-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Recommendations/Actions
                </label>
                <textarea
                  placeholder="Enter recommendations or corrective actions"
                  value={formData.recommendations}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      recommendations: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 text-sm rounded-md p-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isEditing ? "Save Changes" : "Save Record"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// ================= VIEW FULL DETAILS MODAL =================
export const ViewDetailsModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activity: HSEActivity | null;
}> = ({ isOpen, onOpenChange, activity }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<HSEActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  useEffect(() => {
    if (activity && isOpen) {
      setEditedData(activity);
      setIsEditMode(false);
    }
  }, [activity, isOpen]);

  if (!isOpen) return null;

  // Check if user can edit (Regional Officer, Admin, HQ, HOD)
  const normalizedRole = userRole?.toLowerCase();
  const canEdit =
    normalizedRole &&
    ["regional_manager", "regional officer", "admin", "manager"].includes(
      normalizedRole
    );

  // Check if user can review (Regional Officer and Admin)
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer" ||
    normalizedRole === "admin" ||
    normalizedRole === "manager";

  // Check if user can approve (Admin, HQ, HOD)
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedData(activity);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!editedData) return;

    setIsSubmitting(true);
    try {
      // TODO: Call API to save edited data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("HSE record updated successfully");
      setIsEditMode(false);
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

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setIsSubmitting(true);
    try {
      // TODO: Call API to update status
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        confirmAction === "reviewed"
          ? "HSE record marked as reviewed successfully"
          : "HSE record approved successfully"
      );

      setShowConfirmDialog(false);
      setConfirmAction(null);

      // Keep modal open to show updated status
    } catch (error) {
      toast.error("Failed to update HSE record status");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Render editable field or display value
  const renderField = (
    label: string,
    value: any,
    field: string,
    type: "text" | "number" | "date" = "text"
  ) => {
    if (isEditMode && editedData) {
      const fieldValue = (editedData as any)[field];

      return (
        <div>
          <label
            htmlFor={field}
            className="text-xs text-gray-600 uppercase block mb-1"
          >
            {label}
          </label>
          <input
            id={field}
            type={type}
            value={fieldValue || ""}
            onChange={(e) =>
              handleFieldChange(
                field,
                type === "number" ? parseFloat(e.target.value) : e.target.value
              )
            }
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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

  const displayData = editedData || activity;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  HSE Activity Details
                </h2>
                {activity && displayData && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      {displayData.organization} - {displayData.date}
                    </p>
                    <Badge
                      className={`text-xs ${
                        displayData.status?.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : displayData.status?.toLowerCase() === "reviewed"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : displayData.status?.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      }`}
                    >
                      {displayData.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activity && canEdit && !isEditMode && (
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {displayData && (
              <>
                {/* Activity Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase">
                      Activity Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderField(
                      "Activity Type",
                      displayData.type,
                      "type",
                      "text"
                    )}
                    {renderField(
                      "Organization",
                      displayData.organization,
                      "organization",
                      "text"
                    )}
                    {renderField("Date", displayData.date, "date", "date")}
                    {renderField(
                      "Status",
                      displayData.status,
                      "status",
                      "text"
                    )}
                  </div>
                </div>

                {/* Details */}
                {displayData.details && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase">
                        Details
                      </h3>
                    </div>
                    {isEditMode ? (
                      <textarea
                        value={displayData.details}
                        onChange={(e) =>
                          handleFieldChange("details", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[100px] resize-none"
                        title="Details"
                        aria-label="Details"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {displayData.details}
                      </p>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {displayData.recommendations && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase">
                        Recommendations/Actions
                      </h3>
                    </div>
                    {isEditMode ? (
                      <textarea
                        value={displayData.recommendations}
                        onChange={(e) =>
                          handleFieldChange("recommendations", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[100px] resize-none"
                        title="Recommendations"
                        aria-label="Recommendations"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {displayData.recommendations}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {/* Dynamic buttons based on status */}
            {displayData && !isEditMode && (
              <>
                {/* Pending: Show Review button */}
                {displayData.status?.toLowerCase() === "pending" &&
                  (canReview || canApprove) && (
                    <Button
                      onClick={handleReviewedClick}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  )}
                {/* Reviewed: Show Approve button */}
                {displayData.status?.toLowerCase() === "reviewed" &&
                  canApprove && (
                    <Button
                      onClick={handleApproveClick}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                {/* Approved: Show approved badge */}
                {displayData.status?.toLowerCase() === "approved" && (
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Approved
                  </Badge>
                )}
              </>
            )}
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
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
                      : "bg-green-100"
                  }`}
                >
                  <AlertCircle
                    className={`w-6 h-6 ${
                      confirmAction === "reviewed"
                        ? "text-blue-600"
                        : "text-green-600"
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={
                    confirmAction === "reviewed"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {isSubmitting ? (
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
