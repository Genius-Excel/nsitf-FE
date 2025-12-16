"use client";
import { useState, useEffect } from "react";
import {
  X,
  Edit,
  FileText,
  Calendar,
  User,
  Building2,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusBadgeColor, getTypeTextColor } from "@/lib/utils";
import { ClaimDetail, useBulkClaimActions } from "@/hooks/claims";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

interface ClaimDetailModalProps {
  claimDetail: ClaimDetail | null;
  claimId?: string; // UUID for API calls
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * Claim Detail Modal - Refactored Version
 *
 * Changes from original:
 * - Now uses ClaimDetail type (with financial, timeline, classification objects)
 * - No client-side calculations (API provides difference, percentage, processing time)
 * - Added loading state for detail fetch
 * - Uses camelCase field names (transformed by hook)
 * - Role-based action buttons (Edit, Reviewed, Approve)
 * - Integrated with bulk actions API
 */
export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claimDetail,
  claimId,
  isOpen,
  onClose,
  loading = false,
  onRefresh,
}) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ClaimDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the bulk actions hook for single claim updates and detail updates
  const {
    updateSingleClaim,
    updateClaimDetails,
    loading: apiLoading,
  } = useBulkClaimActions();

  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  useEffect(() => {
    if (claimDetail && isOpen) {
      setEditedData(claimDetail);
      setIsEditMode(false);
    }
  }, [claimDetail, isOpen]);

  if (!isOpen) return null;

  // Check if user can edit (Regional Officer, Admin, HQ, HOD)
  const normalizedRole = userRole?.toLowerCase();
  const canEdit =
    normalizedRole &&
    ["regional_manager", "regional officer", "admin", "manager"].includes(
      normalizedRole
    );

  // Check if user can review (Regional Officer only)
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer";

  // Check if user can approve (Admin, HQ, HOD)
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedData(claimDetail);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!editedData || !claimId) return;

    setIsSubmitting(true);
    try {
      // Build API payload (snake_case) from editedData
      const payload: Record<string, any> = {};

      // Employer
      if (editedData.employer) payload.employer = editedData.employer;

      // Beneficiary / claimant
      if (editedData.claimant) payload.beneficiary = editedData.claimant;

      // Financials
      if (editedData.financial) {
        payload.amount_requested = editedData.financial.amountRequested;
        payload.amount_paid = editedData.financial.amountPaid;
      }

      // Classification
      if (editedData.classification) {
        payload.claim_class =
          editedData.classification.class ?? editedData.classification.class;
        payload.sector = editedData.classification.sector;
        payload.period = editedData.classification.paymentPeriod;
      }

      // Type/status
      if (editedData.type) payload.claim_type = editedData.type;
      if (editedData.status) payload.claim_status = editedData.status;

      // Optional gender
      // @ts-ignore
      if ((editedData as any).gender)
        payload.gender = (editedData as any).gender;

      const success = await updateClaimDetails(claimId, payload);

      if (success) {
        toast.success("Claim updated successfully");
        setIsEditMode(false);
        if (onRefresh) onRefresh();
      } else {
        toast.error("Failed to update claim");
      }
    } catch (error) {
      toast.error("Failed to update claim");
      console.error("Error updating claim:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return;

    // Handle nested fields
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedData({
        ...editedData,
        [parent]: {
          ...(editedData[parent as keyof ClaimDetail] as any),
          [child]: value,
        },
      });
    } else {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
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
    if (!claimId || !confirmAction) return;

    const success = await updateSingleClaim(claimId, confirmAction);

    if (success) {
      toast.success(
        confirmAction === "reviewed"
          ? "Claim marked as reviewed successfully"
          : "Claim approved successfully"
      );

      setShowConfirmDialog(false);
      setConfirmAction(null);

      if (onRefresh) {
        onRefresh();
      }

      onClose();
    } else {
      toast.error("Failed to update claim status");
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

  const displayData = editedData || claimDetail;

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
                  Claim Details
                </h2>
                {claimDetail && (
                  <p className="text-sm text-gray-600">{claimDetail.claimId}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {claimDetail && canEdit && !isEditMode && (
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
                    disabled={apiLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={apiLoading}
                  >
                    {apiLoading ? (
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
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading claim details...</p>
              </div>
            ) : !claimDetail ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No claim details available</p>
              </div>
            ) : (
              <>
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={`${getStatusBadgeColor(
                      claimDetail.status
                    )} font-medium text-sm px-4 py-2`}
                  >
                    {claimDetail.status}
                  </Badge>
                  <span
                    className={`font-semibold text-sm ${getTypeTextColor(
                      claimDetail.type
                    )}`}
                  >
                    {claimDetail.type}
                  </span>
                </div>

                {/* Parties Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Employer Information
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {renderField(
                        "Company Name",
                        displayData?.employer,
                        "employer"
                      )}
                      {renderField(
                        "Sector",
                        displayData?.classification.sector || "—",
                        "classification.sector"
                      )}
                      {renderField(
                        "Class",
                        displayData?.classification.class || "—",
                        "classification.class"
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Claimant Information
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {renderField(
                        "Full Name",
                        displayData?.claimant,
                        "claimant"
                      )}
                      <div>
                        <p className="text-xs text-gray-600 uppercase">
                          Claim Type
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {claimDetail.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">
                          Payment Period
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {claimDetail.classification.paymentPeriod || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-green-700" />
                    <h3 className="font-semibold text-gray-900">
                      Financial Summary
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      {isEditMode ? (
                        renderField(
                          "Amount Requested",
                          formatCurrency(
                            displayData?.financial.amountRequested || 0
                          ),
                          "financial.amountRequested",
                          "number"
                        )
                      ) : (
                        <>
                          <p className="text-xs text-gray-600 uppercase mb-1">
                            Amount Requested
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(
                              claimDetail.financial.amountRequested
                            )}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      {isEditMode ? (
                        renderField(
                          "Amount Paid",
                          formatCurrency(
                            displayData?.financial.amountPaid || 0
                          ),
                          "financial.amountPaid",
                          "number"
                        )
                      ) : (
                        <>
                          <p className="text-xs text-gray-600 uppercase mb-1">
                            Amount Paid
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(claimDetail.financial.amountPaid)}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Difference
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          claimDetail.financial.difference > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {claimDetail.financial.difference > 0 ? "-" : "+"}
                        {formatCurrency(
                          Math.abs(claimDetail.financial.difference)
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {claimDetail.financial.difference > 0 ? "-" : "+"}
                        {Math.abs(claimDetail.financial.differencePercent)}% of
                        requested
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Timeline</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Date Processed
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(claimDetail.timeline.dateProcessed)}
                        </p>
                      </div>
                    </div>

                    {claimDetail.timeline.datePaid && (
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Date Paid
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(claimDetail.timeline.datePaid)}
                          </p>
                        </div>
                      </div>
                    )}

                    {claimDetail.timeline.processingTimeDays > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">
                            Processing Time:
                          </span>{" "}
                          {claimDetail.timeline.processingTimeDays} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">
                        Claim ID
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {claimDetail.claimId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claimDetail.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {claimDetail.type}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {/* Admin Buttons: Edit (in header), Approve, Cancel */}
            {normalizedRole === "admin" || normalizedRole === "manager" ? (
              <>
                {claimDetail && canApprove && (
                  <Button
                    onClick={handleApproveClick}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              // Regional Officer Buttons: Edit (in header), Review, Cancel
              <>
                {claimDetail && canReview && (
                  <Button
                    onClick={handleReviewedClick}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                )}
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </>
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
                      : "Approve Claim?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this claim as reviewed?"
                      : "Are you sure you want to approve this claim?"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={handleCancelConfirm}
                  variant="outline"
                  disabled={apiLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={apiLoading}
                  className={
                    confirmAction === "reviewed"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
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
                        ? "Mark as Reviewed"
                        : "Approve"}
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
