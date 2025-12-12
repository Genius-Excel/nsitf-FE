"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  X,
  FileText,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ComplianceEntry } from "@/lib/types";
import { formatCurrencyFull } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

interface ComplianceDetailModalProps {
  entry: ComplianceEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceDetailModal: React.FC<ComplianceDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"reviewed" | "approve" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ComplianceEntry | null>(null);

  // Get user role
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  // Initialize edited data when modal opens
  useEffect(() => {
    if (isOpen && entry) {
      setEditedData(entry);
      setIsEditMode(false);
    }
  }, [isOpen, entry]);

  useEffect(() => {
    if (isOpen) {
      // Focus on close button when modal opens
      closeButtonRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const shortfall = entry.target - entry.contributionCollected;
  const isTargetMet = entry.contributionCollected >= entry.target;

  // Permission checks
  const canEdit = userRole && ["regional_manager", "admin", "manager"].includes(userRole);
  const canReview = userRole === "regional_manager";
  const canApprove = userRole && ["admin", "manager"].includes(userRole);

  // Use edited data or original data
  const displayData = editedData || entry;

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
    setIsSubmitting(true);
    try {
      // TODO: Call API to save edited data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Compliance record updated successfully");
      setIsEditMode(false);
      // Optionally refresh data here
    } catch (error) {
      toast.error("Failed to update compliance record");
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return;

    setEditedData((prev) => {
      if (!prev) return prev;

      // Handle nested fields (e.g., "financial.amountRequested")
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
        ? "Compliance record marked as reviewed"
        : "Compliance record approved successfully";

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
    type: "text" | "number" | "date" = "text"
  ) => {
    if (isEditMode && editedData) {
      const fieldValue = field.includes('.')
        ? field.split('.').reduce((obj, key) => obj?.[key], editedData as any)
        : (editedData as any)[field];

      return (
        <div>
          <label htmlFor={field} className="text-xs text-gray-600 uppercase block mb-1">
            {label}
          </label>
          <input
            id={field}
            type={type}
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
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

  const handleDownload = () => {
    const content = `
COMPLIANCE RECORD DETAILS
=========================
Region: ${entry.region}
Branch: ${entry.branch || "N/A"}
Period: ${entry.period}

CONTRIBUTION SUMMARY
====================
Target: ${formatCurrencyFull(entry.target)}
Collected: ${formatCurrencyFull(entry.contributionCollected)}
Achievement: ${entry.achievement.toFixed(1)}%
${!isTargetMet ? `Shortfall: ${formatCurrencyFull(shortfall)}` : "✓ Target Met"}

EMPLOYER DATA
=============
Employers: ${entry.employersRegistered.toLocaleString()}
Employees: ${entry.employees.toLocaleString()}
Certificate Fees: ${formatCurrencyFull(entry.certificateFees)}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${entry.region.replace(
      /\s+/g,
      "-"
    )}-${entry.period.replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trap focus within modal
  const handleTabKey = (e: React.KeyboardEvent) => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

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
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onKeyDown={handleTabKey}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText
                  className="w-5 h-5 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <h2
                  id="modal-title"
                  className="text-lg sm:text-xl font-bold text-gray-900 truncate"
                >
                  Compliance Record
                </h2>
                <p
                  id="modal-description"
                  className="text-xs sm:text-sm text-gray-600 truncate"
                >
                  {entry.region} - {entry.branch || "Main"} - {entry.period}
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
                  <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
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
                ref={closeButtonRef}
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Main Metrics */}
            <section aria-labelledby="metrics-heading">
              <h3 id="metrics-heading" className="sr-only">
                Financial Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {isEditMode ? (
                    renderField("Target", formatCurrencyFull(displayData.target), "target", "number")
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">Target</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-700">
                        {formatCurrencyFull(displayData.target)}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  {isEditMode ? (
                    renderField("Collected", formatCurrencyFull(displayData.contributionCollected), "contributionCollected", "number")
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Collected
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-green-700">
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
                  {isEditMode ? (
                    renderField("Performance Rate", displayData.achievement.toFixed(1), "achievement", "number")
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Performance Rate
                      </p>
                      <p
                        className={`text-xl sm:text-2xl font-bold ${
                          isTargetMet ? "text-green-700" : "text-orange-700"
                        }`}
                      >
                        {displayData.achievement.toFixed(1)}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Target Status */}
            {!isTargetMet && (
              <div
                className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                role="status"
              >
                <p className="text-sm font-medium text-orange-800">
                  Shortfall: {formatCurrencyFull(shortfall)}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {((shortfall / entry.target) * 100).toFixed(1)}% below target
                </p>
              </div>
            )}

            {/* Employment Metrics */}
            <section aria-labelledby="employment-heading">
              <h3
                id="employment-heading"
                className="text-sm font-semibold text-gray-900 mb-3"
              >
                Employment Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {isEditMode ? (
                    renderField("Total Employers", displayData.employersRegistered.toLocaleString(), "employersRegistered", "number")
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Total Employers
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {displayData.employersRegistered.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {isEditMode ? (
                    renderField("Total Employees", displayData.employees.toLocaleString(), "employees", "number")
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Total Employees
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {displayData.employees.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section aria-labelledby="additional-heading">
              <h3
                id="additional-heading"
                className="text-sm font-semibold text-gray-900 mb-3"
              >
                Additional Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className={isEditMode ? "" : "flex justify-between items-center"}>
                  {isEditMode ? (
                    renderField("Certificate Fees", formatCurrencyFull(displayData.certificateFees), "certificateFees", "number")
                  ) : (
                    <>
                      <span className="text-sm text-gray-600">Certificate Fees:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrencyFull(displayData.certificateFees)}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Region:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {displayData.region}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Branch:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {displayData.branch || "Main Branch"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Period:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {displayData.period}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
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
                    {confirmAction === "reviewed" ? "Mark as Reviewed?" : "Approve Compliance Record?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this compliance record as reviewed? This action will update the record status."
                      : "Are you sure you want to approve this compliance record? This action will finalize the approval."}
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
