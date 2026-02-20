// ============================================================================
// ComplianceDetailModal - Refactored to match Inspection pattern
// ============================================================================
"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  TrendingUp,
  Building2,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyFull } from "@/lib/utils";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { useBulkComplianceActions } from "@/hooks/compliance";

interface ComplianceDetailModalProps {
  entry: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const ComplianceDetailModal: React.FC<ComplianceDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const detailData = entry;

  // ============= BULK ACTIONS HOOK =============
  const {
    updateSingleCompliance,
    updateComplianceDetails,
    loading: apiLoading,
  } = useBulkComplianceActions();

  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  // Get user role
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  // Initialize edited data when modal opens
  useEffect(() => {
    if (isOpen && entry) {
      console.log("📊 [Modal] entry updated:", entry);
      console.log("📊 [Modal] Audit status:", entry?.recordStatus);
      setEditedData(entry);
      setIsEditMode(false);
    }
  }, [isOpen, entry]);

  if (!isOpen || !entry) return null;

  const shortfall = entry.target - entry.contributionCollected;
  const isTargetMet = entry.contributionCollected >= entry.target;

  // Use edited data or original data
  const displayData = editedData || entry;

  // Permission checks (case-insensitive)
  const normalizedRole = userRole?.toLowerCase();
  const isApproved = displayData.recordStatus?.toLowerCase() === "approved";
  const canEdit =
    normalizedRole &&
    ["regional_manager", "regional officer", "admin", "manager"].includes(
      normalizedRole,
    ) &&
    !isApproved;
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer" ||
    normalizedRole === "admin" ||
    normalizedRole === "manager" ||
    normalizedRole === "hse_officer" ||
    normalizedRole === "hse officer" ||
    normalizedRole === "actuary_officer" ||
    normalizedRole === "actuary";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  // Handle edit mode
  const handleEdit = () => {
    setIsEditMode(true);
    toast.info("You can now edit the compliance record");
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(entry);
    toast.info("Changes discarded");
  };

  const handleSaveEdit = async () => {
    if (!entry?.id || !editedData) {
      toast.error("Record ID or data not found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build payload with the exact fields expected by API
      const payload: any = {
        contributionCollected: editedData.contributionCollected,
        target: editedData.target,
        employersRegistered: editedData.employersRegistered,
        employees: editedData.employees,
        registrationFees: editedData.registrationFees,
        certificateFees: editedData.certificateFees,
        period: editedData.period,
      };

      const success = await updateComplianceDetails(entry.id, payload);

      if (success) {
        toast.success("Compliance record updated successfully");
        setIsEditMode(false);
        if (onRefresh) await onRefresh();
      } else {
        toast.error("Failed to update compliance record");
      }
    } catch (error) {
      toast.error("Failed to update compliance record");
      console.error("Error updating compliance record:", error);
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
    if (!entry?.id || !confirmAction) return;

    setIsSubmitting(true);
    try {
      const result = await updateSingleCompliance(
        entry.id,
        confirmAction === "reviewed" ? "reviewed" : "approved",
      );

      if (result.success) {
        toast.success(
          confirmAction === "reviewed"
            ? "Compliance record marked as reviewed successfully"
            : "Compliance record approved successfully",
        );

        setShowConfirmDialog(false);
        setConfirmAction(null);

        // Refresh to get updated data from backend
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        toast.error("Failed to update compliance status");
      }
    } catch (error) {
      toast.error("Failed to update compliance status");
      console.error("Action error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field helper for inline editing
  const renderField = (
    label: string,
    value: any,
    field: string,
    type: "text" | "number" = "text",
  ) => {
    console.log(`🔧 [renderField] ${field}:`, {
      isEditMode,
      hasEditedData: !!editedData,
    });

    if (isEditMode && editedData) {
      const fieldValue = field.includes(".")
        ? field.split(".").reduce((obj, key) => obj?.[key], editedData as any)
        : (editedData as any)[field];

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
                type === "number" ? parseFloat(e.target.value) : e.target.value,
              )
            }
            placeholder={label}
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Compliance Record
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    {displayData?.region} - {displayData?.branch} -{" "}
                    {displayData?.period}
                  </p>
                  <Badge
                    className={`text-xs ${
                      displayData?.recordStatus?.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : displayData?.recordStatus?.toLowerCase() ===
                            "reviewed"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-green-100 text-green-800 border-green-300"
                    }`}
                  >
                    {displayData?.recordStatus?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
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
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Branch Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Branch Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Region</p>
                  <p className="text-sm font-medium text-gray-900">
                    {displayData.region}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Branch</p>
                  <p className="text-sm font-medium text-gray-900">
                    {displayData.branch}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Period</p>
                  <p className="text-sm font-medium text-gray-900">
                    {displayData.period}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">
                  Performance Metrics
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Target",
                      formatCurrencyFull(displayData.target),
                      "target",
                      "number",
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Target
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrencyFull(displayData.target)}
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Collected",
                      formatCurrencyFull(displayData.contributionCollected),
                      "contributionCollected",
                      "number",
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Collected
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrencyFull(displayData.contributionCollected)}
                      </p>
                    </>
                  )}
                </div>

                <div
                  className={`${
                    isTargetMet
                      ? "bg-green-50 border-green-200"
                      : "bg-orange-50 border-orange-200"
                  } p-4 rounded-lg border`}
                >
                  {/* Achievement/Performance Rate is always non-editable (calculated field) */}
                  <p
                    className={`text-xs uppercase mb-1 ${
                      isTargetMet ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    Performance Rate
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isTargetMet ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    {displayData.achievement.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Target Status */}
            {!isTargetMet && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-800">
                  Shortfall: {formatCurrencyFull(shortfall)}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {((shortfall / entry.target) * 100).toFixed(1)}% below target
                </p>
              </div>
            )}

            {/* Employment Metrics */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Employment Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Total Employers",
                      displayData.employersRegistered.toLocaleString(),
                      "employersRegistered",
                      "number",
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Total Employers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {displayData.employersRegistered.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Total Employees",
                      displayData.employees.toLocaleString(),
                      "employees",
                      "number",
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Total Employees
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {displayData.employees.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Financial Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Registration Fees",
                      formatCurrencyFull(displayData.registrationFees),
                      "registrationFees",
                      "number",
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Registration Fees
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {formatCurrencyFull(displayData.registrationFees)}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Certificate Fees",
                      formatCurrencyFull(displayData.certificateFees),
                      "certificateFees",
                      "number",
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Certificate Fees
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {formatCurrencyFull(displayData.certificateFees)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-4">Audit Trail</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">
                    Record Status
                  </p>
                  <Badge
                    className={`mt-1 ${
                      displayData.recordStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : displayData.recordStatus === "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {displayData.recordStatus?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Reviewed By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {displayData.reviewedBy || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Approved By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {displayData.approvedBy || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {/* Dynamic buttons based on record_status */}
            {!isEditMode && (
              <>
                {/* Pending: Show Review button */}
                {displayData?.recordStatus === "pending" &&
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
                {displayData?.recordStatus === "reviewed" && canApprove && (
                  <Button
                    onClick={handleApproveClick}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                {/* Approved: Show approved badge */}
                {displayData?.recordStatus === "approved" && (
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Approved
                  </Badge>
                )}
                {/* Fallback buttons if recordStatus not present */}
                {!displayData?.recordStatus && canReview && (
                  <Button
                    onClick={handleReviewedClick}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                )}
                {!displayData?.recordStatus && canApprove && !canReview && (
                  <Button
                    onClick={handleApproveClick}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
              </>
            )}
            <Button onClick={onClose} variant="outline">
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
                      : "Approve Compliance Record?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this compliance record as reviewed?"
                      : "Are you sure you want to approve this compliance record?"}
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
