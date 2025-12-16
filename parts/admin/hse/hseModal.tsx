"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
          <select
            value={formData.recordType}
            onChange={(e) =>
              onFormChange({ ...formData, recordType: e.target.value })
            }
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
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
          <label className="text-xs font-semibold text-gray-900">
            Employer/Organization <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Enter employer name"
            value={formData.employer}
            onChange={(e) =>
              onFormChange({ ...formData, employer: e.target.value })
            }
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateLogged}
            onChange={(e) =>
              onFormChange({ ...formData, dateLogged: e.target.value })
            }
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              onFormChange({ ...formData, status: e.target.value })
            }
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          >
            <option value="">Select status</option>
            <option value="Completed">Completed</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Follow-up Required">Follow-up Required</option>
          </select>
        </div>

        {/* Safety Compliance Rate */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
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
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
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
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2 min-h-[80px] resize-none"
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
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2 min-h-[80px] resize-none"
          />
        </div>
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 text-sm text-white rounded-md"
          style={{ backgroundColor: "#00a63e" }}
        >
          {isEditing ? "Save Changes" : "Save Record"}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ================= VIEW FULL DETAILS MODAL =================
export const ViewDetailsModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activity: HSEActivity | null;
}> = ({ isOpen, onOpenChange, activity }) => {
  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<HSEActivity | null>(null);

  // Get user role
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  // Initialize edited data when modal opens
  useEffect(() => {
    if (isOpen && activity) {
      setEditedData(activity);
      setIsEditMode(false);
    }
  }, [isOpen, activity]);

  if (!activity) return null;

  // Permission checks (case-insensitive)
  const normalizedRole = userRole?.toLowerCase();
  const canEdit =
    normalizedRole &&
    ["regional_manager", "regional officer", "admin", "manager"].includes(
      normalizedRole
    );
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  // Use edited data or original data
  const displayData = editedData || activity;

  // Handle edit mode
  const handleEdit = () => {
    setIsEditMode(true);
    toast.info("You can now edit the HSE record");
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(activity);
    toast.info("Changes discarded");
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to save edited data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("HSE record updated successfully");
      setIsEditMode(false);
      // Optionally refresh data here
    } catch (error) {
      toast.error("Failed to update HSE record");
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return;

    setEditedData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  // Handle action buttons
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
    setIsSubmitting(true);
    try {
      // TODO: Call API to update status
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const message =
        confirmAction === "reviewed"
          ? "HSE record marked as reviewed"
          : "HSE record approved successfully";

      toast.success(message);
      setShowConfirmDialog(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Action error:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmAction(null);
    }
  };

  // Render field helper for inline editing
  const renderField = (
    label: string,
    value: any,
    field: string,
    type: "text" | "textarea" = "text"
  ) => {
    if (isEditMode && editedData) {
      const fieldValue = (editedData as any)[field];

      if (type === "textarea") {
        return (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {label}
            </h3>
            <textarea
              id={field}
              value={fieldValue || ""}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[80px] resize-none"
            />
          </div>
        );
      }

      return (
        <div>
          <label
            htmlFor={field}
            className="text-sm font-semibold text-gray-900 block mb-2"
          >
            {label}
          </label>
          <input
            id={field}
            type="text"
            value={fieldValue || ""}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      );
    }

    return null; // Return null as the display is handled in the JSX below
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditMode ? (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="type"
                        className="text-sm font-semibold text-gray-900 block mb-1"
                      >
                        Activity Type
                      </label>
                      <input
                        id="type"
                        type="text"
                        value={displayData.type || ""}
                        onChange={(e) =>
                          handleFieldChange("type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="organization"
                          className="text-xs font-semibold text-gray-900 block mb-1"
                        >
                          Organization
                        </label>
                        <input
                          id="organization"
                          type="text"
                          value={displayData.organization || ""}
                          onChange={(e) =>
                            handleFieldChange("organization", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="date"
                          className="text-xs font-semibold text-gray-900 block mb-1"
                        >
                          Date
                        </label>
                        <input
                          id="date"
                          type="date"
                          value={displayData.date || ""}
                          onChange={(e) =>
                            handleFieldChange("date", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-xl font-bold">
                      {displayData.type}
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {displayData.organization} • {displayData.date}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {canEdit && !isEditMode && (
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
                        "Save"
                      )}
                    </Button>
                  </>
                )}
                {!isEditMode && (
                  <Badge
                    className={`${getActivityStatusColor(
                      displayData.status
                    )} font-medium text-xs`}
                  >
                    {displayData.status}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {displayData.details && (
              <div>
                {isEditMode ? (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Details:
                    </h3>
                    <textarea
                      value={displayData.details}
                      onChange={(e) =>
                        handleFieldChange("details", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[80px] resize-none"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Details:
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {displayData.details}
                    </p>
                  </>
                )}
              </div>
            )}
            {displayData.recommendations && (
              <div>
                {isEditMode ? (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Recommendations/Actions:
                    </h3>
                    <textarea
                      value={displayData.recommendations}
                      onChange={(e) =>
                        handleFieldChange("recommendations", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[80px] resize-none"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Recommendations/Actions:
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {displayData.recommendations}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Cancel
            </Button>
            {canReview && (
              <Button
                type="button"
                onClick={handleReviewedClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Reviewed
              </Button>
            )}
            {canApprove && (
              <Button
                type="button"
                onClick={handleApproveClick}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
