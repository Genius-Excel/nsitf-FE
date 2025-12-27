// ============================================================================
// LegalDetailModal - Refactored
// ============================================================================
// NOW ACTUALLY USES THE DETAIL API ENDPOINT
// Fetches detailed legal activity data when modal opens
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { useLegalDetail } from "@/hooks/legal/useLegalDetail";
import type { LegalActivityRecord } from "@/lib/types/legal";
import { formatLegalDate, formatSectors } from "@/lib/types/legal";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { toast } from "sonner";

interface LegalDetailModalProps {
  activity: LegalActivityRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalDetailModal: React.FC<LegalDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  // ============= FETCH DETAIL DATA =============
  // This is the critical fix - actually fetch detail from API
  const { data: detailData, loading, error } = useLegalDetail(activity?.id);

  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  // Get user role and permissions
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
    setUserPermissions(user?.permissions || []);
  }, []);

  // Initialize edited data when modal opens
  useEffect(() => {
    if (isOpen && detailData) {
      setEditedData(detailData);
      setIsEditMode(false);
    }
  }, [isOpen, detailData]);

  if (!isOpen) return null;

  // ============= HANDLERS =============
  const handleDownload = () => {
    if (!detailData) return;

    const content = `
LEGAL ACTIVITY DETAILS
======================
Region: ${detailData.region}
Branch: ${detailData.branch}
Period: ${detailData.period}

EMPLOYER METRICS
================
Recalcitrant Employers: ${detailData.metrics.recalcitrantEmployers}
Defaulting Employers: ${detailData.metrics.defaultingEmployers}
ECS Number: ${detailData.metrics.ecsNumber}

LEGAL ACTIONS
=============
Plan Issued: ${detailData.legalActions.planIssued}
Alternate Dispute Resolution (ADR): ${detailData.legalActions.adr}
Cases Instituted in Court: ${detailData.legalActions.casesInstituted}

SECTORS
=======
${formatSectors(detailData.sectors)}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal-activity-${detailData.region}-${detailData.branch}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Use edited data or original data
  const displayData = editedData || detailData;

  // Hybrid permission checks: Use BOTH permission system AND role verification
  const normalizedRole = userRole?.toLowerCase();
  const isApproved = displayData?.recordStatus?.toLowerCase() === "approved";

  // Check if user has manage_legal permission (backend or role-based)
  const hasManagePermission = userRole
    ? hasPermission(userRole, "manage_legal", userPermissions)
    : false;

  // Allowed roles for editing and reviewing legal records
  const allowedEditRoles = [
    "legal_officer",
    "legal officer", // Backend format with space
    "regional_manager",
    "regional manager", // Backend format with space
    "regional officer",
    "admin",
    "manager",
  ];
  const isAllowedRole =
    normalizedRole && allowedEditRoles.includes(normalizedRole);

  console.log("🔍 [Legal Modal] Hybrid permission check:", {
    recordStatus: displayData?.recordStatus,
    isApproved,
    userRole,
    normalizedRole,
    hasManagePermission,
    isAllowedRole,
    userPermissions,
  });

  // Can edit: Must have BOTH permission AND be in allowed role AND record not approved
  const canEdit = hasManagePermission && isAllowedRole && !isApproved;

  // Can review: Must have BOTH permission AND be in allowed role
  const canReview = hasManagePermission && isAllowedRole;

  // Can approve: Only admin and manager (final approval authority)
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  // Handle edit mode
  const handleEdit = () => {
    setIsEditMode(true);
    toast.info("You can now edit the legal record");
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(detailData);
    toast.info("Changes discarded");
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to save edited data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Legal record updated successfully");
      setIsEditMode(false);
      // Optionally refresh data here
    } catch (error) {
      toast.error("Failed to update legal record");
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return;

    setEditedData((prev: any) => {
      if (!prev) return prev;

      // Handle nested fields
      if (field.includes(".")) {
        const keys = field.split(".");
        const newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      }

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
          ? "Legal record marked as reviewed"
          : "Legal record approved successfully";

      toast.success(message);
      setShowConfirmDialog(false);
      onClose();
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
    type: "text" | "number" = "text",
    editable: boolean = true
  ) => {
    if (isEditMode && editedData && editable) {
      const fieldValue = field.includes(".")
        ? field.split(".").reduce((obj, key) => obj?.[key], editedData as any)
        : (editedData as any)[field];

      // For number fields, only show value if it's greater than 0
      let displayValue = "";
      let placeholderText = "";

      if (type === "number") {
        // Only show the number if it's actually greater than 0
        if (fieldValue > 0) {
          displayValue = String(fieldValue);
        } else {
          displayValue = "";
        }
        // Always show meaningful placeholder for numbers
        placeholderText = `Enter ${label.toLowerCase()}`;
      } else {
        displayValue = fieldValue || "";
        placeholderText = `Enter ${label.toLowerCase()}`;
      }

      return (
        <div>
          <p className="text-xs text-gray-600 uppercase mb-1">{label}</p>
          <input
            id={field}
            type="text"
            value={displayValue}
            onChange={(e) => {
              const newValue = e.target.value;
              if (type === "number") {
                // Allow empty string or valid numbers only
                if (newValue === "") {
                  handleFieldChange(field, 0);
                } else if (/^\d*\.?\d*$/.test(newValue)) {
                  // Only update if it's a valid number format
                  const parsed = parseFloat(newValue);
                  handleFieldChange(field, isNaN(parsed) ? 0 : parsed);
                }
              } else {
                handleFieldChange(field, newValue);
              }
            }}
            placeholder={placeholderText}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-400"
          />
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs text-gray-600 uppercase mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    );
  };

  // ============= LOADING STATE =============
  if (loading) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8">
            <LoadingState message="Loading legal activity details..." />
          </div>
        </div>
      </>
    );
  }

  // ============= ERROR STATE =============
  if (error) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8">
            <ErrorState error={new Error(error)} />
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============= NO DATA =============
  if (!activity || !detailData) {
    return null;
  }

  // ============= RENDER FULL DETAIL =============
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText
                  className="w-5 h-5 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Legal Activity Details
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {displayData?.region} - {displayData?.branch}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                    className="bg-blue-600 hover:bg-blue-700"
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
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Location Information */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Location Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Region
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayData?.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Branch
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayData?.branch}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Period
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatLegalDate(displayData?.period)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Employer Metrics */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Employer Metrics
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {isEditMode ? (
                    <>
                      {renderField(
                        "Recalcitrant Employers",
                        displayData?.metrics?.recalcitrantEmployers,
                        "metrics.recalcitrantEmployers",
                        "number"
                      )}
                      {renderField(
                        "Defaulting Employers",
                        displayData?.metrics?.defaultingEmployers,
                        "metrics.defaultingEmployers",
                        "number"
                      )}
                      {renderField(
                        "ECS Number",
                        displayData?.metrics?.ecsNumber,
                        "metrics.ecsNumber"
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-orange-600 uppercase mb-1">
                          Recalcitrant Employers
                        </p>
                        <p className="text-2xl font-bold text-orange-900">
                          {displayData?.metrics?.recalcitrantEmployers}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 uppercase mb-1">
                          Defaulting Employers
                        </p>
                        <p className="text-2xl font-bold text-orange-900">
                          {displayData?.metrics?.defaultingEmployers}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 uppercase mb-1">
                          ECS Number
                        </p>
                        <p className="text-sm font-medium text-orange-900">
                          {displayData?.metrics?.ecsNumber}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Legal Actions */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Legal Actions Taken
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {isEditMode ? (
                    <>
                      {renderField(
                        "Plan Issued",
                        displayData?.legalActions?.planIssued,
                        "legalActions.planIssued",
                        "number"
                      )}
                      {renderField(
                        "ADR",
                        displayData?.legalActions?.adr,
                        "legalActions.adr",
                        "number"
                      )}
                      {renderField(
                        "Cases Instituted",
                        displayData?.legalActions?.casesInstituted,
                        "legalActions.casesInstituted",
                        "number"
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-blue-600 uppercase mb-1">
                          Plan Issued
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {displayData?.legalActions?.planIssued}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 uppercase mb-1">
                          ADR
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {displayData?.legalActions?.adr}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Alternate Dispute Resolution
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 uppercase mb-1">
                          Cases Instituted
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {displayData?.legalActions?.casesInstituted}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">In Court</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Sectors */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Sectors Covered
              </h3>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                {detailData.sectors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detailData.sectors.map((sector, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No sectors listed</p>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" onClick={onClose} variant="outline">
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
                      : "Approve Legal Record?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this legal record as reviewed? This action will update the record status."
                      : "Are you sure you want to approve this legal record? This action will finalize the approval."}
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
