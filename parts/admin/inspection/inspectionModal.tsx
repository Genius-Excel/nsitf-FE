// ============================================================================
// InspectionDetailModal - Refactored
// ============================================================================
// NOW ACTUALLY USES THE DETAIL API ENDPOINT
// Fetches detailed inspection data when modal opens
// Shows: branch info, performance metrics, inspection activity, financial summary
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
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { useInspectionDetail } from "@/hooks/inspection/useInspectionDetail";
import type { InspectionRecord } from "@/lib/types/inspection";
import {
  formatInspectionCurrency,
  getInspectionPerformanceBadge,
  calculateRecoveryRate,
} from "@/lib/types/inspection";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

interface InspectionDetailModalProps {
  inspection: InspectionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({
  inspection,
  isOpen,
  onClose,
}) => {
  // ============= FETCH DETAIL DATA =============
  // This is the critical fix - actually fetch detail from API
  const {
    data: detailData,
    loading,
    error,
  } = useInspectionDetail(inspection?.id);

  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"reviewed" | "approve" | null>(null);
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
    if (isOpen && detailData) {
      setEditedData(detailData);
      setIsEditMode(false);
    }
  }, [isOpen, detailData]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!inspection || !detailData) return;

    const content = `
INSPECTION RECORD DETAILS
========================

Branch: ${detailData.branchInformation.branchName}
Region: ${detailData.branchInformation.region}
Period: ${detailData.branchInformation.period}

PERFORMANCE METRICS
==================
Performance Rate: ${detailData.performanceMetrics.performanceRate}%
Recovery Rate: ${detailData.performanceMetrics.recoveryRate}%

INSPECTION ACTIVITY
==================
Inspections Conducted: ${detailData.inspectionActivity.inspectionsConducted.toLocaleString()}
Demand Notices Issued: ${detailData.inspectionActivity.demandNoticesIssued.toLocaleString()}
Demand Notices Percentage: ${
      detailData.inspectionActivity.demandNoticesPercent
    }%

FINANCIAL SUMMARY
=================
Debt Established: ${formatInspectionCurrency(
      detailData.financialSummary.debtEstablished
    )}
Debt Recovered: ${formatInspectionCurrency(
      detailData.financialSummary.debtRecovered
    )}
Outstanding Debt: ${formatInspectionCurrency(
      detailData.financialSummary.outstandingDebt
    )}
Average Debt per Inspection: ${formatInspectionCurrency(
      detailData.financialSummary.averageDebtPerInspection
    )}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inspection-${inspection.branch.replace(/\s+/g, "-")}-${
      inspection.period
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Permission checks
  const canEdit = userRole && ["regional_manager", "admin", "manager"].includes(userRole);
  const canReview = userRole === "regional_manager";
  const canApprove = userRole && ["admin", "manager"].includes(userRole);

  // Use edited data or original data
  const displayData = editedData || detailData;

  // Handle edit mode
  const handleEdit = () => {
    setIsEditMode(true);
    toast.info("You can now edit the inspection record");
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

      toast.success("Inspection record updated successfully");
      setIsEditMode(false);
      // Optionally refresh data here
    } catch (error) {
      toast.error("Failed to update inspection record");
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
      if (field.includes('.')) {
        const keys = field.split('.');
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

      const message = confirmAction === "reviewed"
        ? "Inspection record marked as reviewed"
        : "Inspection record approved successfully";

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
    type: "text" | "number" = "text"
  ) => {
    if (isEditMode && editedData) {
      const fieldValue = field.includes('.')
        ? field.split('.').reduce((obj, key) => obj?.[key], editedData as any)
        : (editedData as any)[field];

      return (
        <div>
          <p className="text-xs text-gray-600 uppercase mb-1">{label}</p>
          <input
            id={field}
            type={type}
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
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
            <LoadingState message="Loading inspection details..." />
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
  if (!inspection || !detailData) {
    return null;
  }

  // ============= RENDER FULL DETAIL =============
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Inspection Details
                </h2>
                <p className="text-sm text-gray-600">
                  {displayData?.branchInformation?.branchName} -{" "}
                  {displayData?.branchInformation?.period}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && !isEditMode && (
                <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {isEditMode && (
                <>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
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
            {/* Branch and Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Branch Information
                  </h3>
                </div>
                <div className="space-y-2">
                  {renderField("Region", displayData?.branchInformation?.region, "branchInformation.region")}
                  {renderField("Branch", displayData?.branchInformation?.branchName, "branchInformation.branchName")}
                  {renderField("Period", displayData?.branchInformation?.period, "branchInformation.period")}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Performance Metrics
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Performance Rate
                    </p>
                    <Badge
                      className={`${getInspectionPerformanceBadge(
                        detailData.performanceMetrics.performanceRate
                      )} font-semibold text-lg px-3 py-1 border`}
                    >
                      {detailData.performanceMetrics.performanceRate}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Recovery Rate
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {detailData.performanceMetrics.recoveryRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Activity */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Inspection Activity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Inspections Conducted",
                      displayData?.inspectionActivity?.inspectionsConducted,
                      "inspectionActivity.inspectionsConducted",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Inspections Conducted
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {detailData.inspectionActivity.inspectionsConducted.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Demand Notices Issued",
                      displayData?.inspectionActivity?.demandNoticesIssued,
                      "inspectionActivity.demandNoticesIssued",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Demand Notices Issued
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {detailData.inspectionActivity.demandNoticesIssued.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Notice Percentage",
                      displayData?.inspectionActivity?.demandNoticesPercent,
                      "inspectionActivity.demandNoticesPercent",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Notice Percentage
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {detailData.inspectionActivity.demandNoticesPercent}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Financial Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Debt Established",
                      displayData?.financialSummary?.debtEstablished,
                      "financialSummary.debtEstablished",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Debt Established
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatInspectionCurrency(
                          detailData.financialSummary.debtEstablished
                        )}
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Debt Recovered",
                      displayData?.financialSummary?.debtRecovered,
                      "financialSummary.debtRecovered",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Debt Recovered
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatInspectionCurrency(
                          detailData.financialSummary.debtRecovered
                        )}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {detailData.performanceMetrics.recoveryRate}% recovered
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Outstanding Debt",
                      displayData?.financialSummary?.outstandingDebt,
                      "financialSummary.outstandingDebt",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Outstanding Debt
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          detailData.financialSummary.outstandingDebt < 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatInspectionCurrency(
                          detailData.financialSummary.outstandingDebt
                        )}
                      </p>
                      {detailData.financialSummary.outstandingDebt < 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Over-recovered
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Average per Inspection",
                      displayData?.financialSummary?.averageDebtPerInspection,
                      "financialSummary.averageDebtPerInspection",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Average per Inspection
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatInspectionCurrency(
                          detailData.financialSummary.averageDebtPerInspection
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            {canReview && (
              <Button type="button" onClick={handleReviewedClick} className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Reviewed
              </Button>
            )}
            {canApprove && (
              <Button type="button" onClick={handleApproveClick} className="bg-green-600 hover:bg-green-700">
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
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[60]" onClick={handleCancelConfirm} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmAction === "reviewed" ? "bg-blue-100" : "bg-green-100"
                }`}>
                  <AlertCircle className={`w-6 h-6 ${
                    confirmAction === "reviewed" ? "text-blue-600" : "text-green-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {confirmAction === "reviewed" ? "Mark as Reviewed?" : "Approve Inspection Record?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this inspection record as reviewed? This action will update the record status."
                      : "Are you sure you want to approve this inspection record? This action will finalize the approval."}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" onClick={handleCancelConfirm} variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={confirmAction === "reviewed" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {confirmAction === "reviewed" ? "Yes, Mark as Reviewed" : "Yes, Approve"}
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
