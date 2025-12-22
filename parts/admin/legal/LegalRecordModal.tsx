"use client";
import { useState, useEffect } from "react";
import {
  X,
  Edit,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { useBulkLegalActions } from "@/hooks/legal/useBulkLegalActions";
import type { LegalRecord } from "@/lib/types/legal-new";
import { transformLegalRecordToAPI } from "@/lib/types/legal-new";

interface LegalRecordModalProps {
  record: LegalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const LegalRecordModal: React.FC<LegalRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approve" | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<LegalRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    updateSingleLegal,
    updateLegalDetails,
    loading: apiLoading,
  } = useBulkLegalActions();

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

  const displayData = editedData || record;

  // Permission checks
  const normalizedRole = userRole?.toLowerCase();
  const isApproved = displayData?.recordStatus?.toLowerCase() === "approved";
  const canEdit =
    normalizedRole &&
    ["regional_manager", "regional officer", "admin", "manager"].includes(
      normalizedRole
    ) &&
    !isApproved; // Disable editing for approved records
  const canReview =
    normalizedRole === "regional_manager" ||
    normalizedRole === "regional officer" ||
    normalizedRole === "admin" ||
    normalizedRole === "manager";
  const canApprove =
    normalizedRole && ["admin", "manager"].includes(normalizedRole);

  const handleEdit = () => {
    setIsEditMode(true);
    toast.info("You can now edit the legal record");
  };

  const handleCancelEdit = () => {
    setEditedData(record);
    setIsEditMode(false);
    toast.info("Changes discarded");
  };

  const handleSaveEdit = async () => {
    if (!record?.id || !editedData) {
      toast.error("Record ID or data not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = transformLegalRecordToAPI(editedData);
      const success = await updateLegalDetails(record.id, payload);

      if (success) {
        toast.success("Legal record updated successfully");
        setIsEditMode(false);
        if (onRefresh) onRefresh();
      } else {
        toast.error("Failed to update legal record");
      }
    } catch (error) {
      toast.error("Failed to update legal record");
      console.error("Error updating legal record:", error);
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

  const handleReviewClick = () => {
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
    if (!record?.id || !confirmAction) return;

    try {
      const success = await updateSingleLegal(
        record.id,
        confirmAction === "reviewed" ? "reviewed" : "approved"
      );

      if (success) {
        toast.success(
          confirmAction === "reviewed"
            ? "Legal record marked as reviewed successfully"
            : "Legal record approved successfully"
        );
        setShowConfirmDialog(false);
        setConfirmAction(null);
        if (onRefresh) onRefresh();
      } else {
        toast.error("Failed to update legal record status");
      }
    } catch (error) {
      console.error("Error in handleConfirmAction:", error);
      toast.error("Failed to update legal record status");
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
          <label className="block text-xs text-gray-600 uppercase mb-1">
            {label}
          </label>
          <input
            type={type}
            value={value ?? ""}
            onChange={(e) =>
              handleFieldChange(
                field,
                type === "number" ? Number(e.target.value) : e.target.value
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={label}
            aria-label={label}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => !isEditMode && onClose()}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Legal Record Details
                  </h2>
                  {displayData.recordStatus && (
                    <Badge
                      className={
                        displayData.recordStatus.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : displayData.recordStatus.toLowerCase() ===
                            "reviewed"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-green-100 text-green-800 border-green-300"
                      }
                    >
                      {displayData.recordStatus}
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
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Employers Metrics */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Employer Compliance Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Recalcitrant Employers",
                      displayData.recalcitrantEmployers,
                      "recalcitrantEmployers",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Recalcitrant Employers
                      </p>
                      <p className="text-2xl font-bold text-red-700">
                        {record.recalcitrantEmployers.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Defaulting Employers",
                      displayData.defaultingEmployers,
                      "defaultingEmployers",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Defaulting Employers
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {record.defaultingEmployers.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ECS and Sector */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Registration Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "ECS Number",
                      displayData.ecsNumber,
                      "ecsNumber",
                      "text"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        ECS Number
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {record.ecsNumber}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Sectors
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {record.sector.map((s, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Actions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Legal Actions Taken
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Plan Issued",
                      displayData.planIssued,
                      "planIssued",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Plan Issued
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {record.planIssued.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Alternate Dispute Resolution",
                      displayData.alternateDisputeResolution,
                      "alternateDisputeResolution",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Alternate Dispute Resolution
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">
                        {record.alternateDisputeResolution.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Court Cases */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Court Proceedings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Cases Instituted in Court",
                      displayData.casesInstitutedInCourt,
                      "casesInstitutedInCourt",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Cases Instituted in Court
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {record.casesInstitutedInCourt.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isEditMode ? (
                    renderField(
                      "Cases Won",
                      displayData.casesWon,
                      "casesWon",
                      "number"
                    )
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Cases Won
                      </p>
                      <p className="text-2xl font-bold text-teal-700">
                        {record.casesWon.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            {displayData.recordStatus && (
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
                        displayData.recordStatus.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-800"
                          : displayData.recordStatus.toLowerCase() ===
                            "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {displayData.recordStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Reviewed By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayData.reviewedBy || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Approved By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayData.approvedBy || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {!isEditMode &&
              displayData.recordStatus?.toLowerCase() === "pending" &&
              canReview && (
                <Button
                  onClick={handleReviewClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Review
                </Button>
              )}
            {!isEditMode &&
              displayData.recordStatus?.toLowerCase() === "reviewed" &&
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
              displayData.recordStatus?.toLowerCase() === "approved" && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
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
                    Confirm{" "}
                    {confirmAction === "reviewed" ? "Review" : "Approval"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to{" "}
                    {confirmAction === "reviewed" ? "review" : "approve"} this
                    legal record? This action will update the record status.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={handleCancelConfirm}
                      variant="outline"
                      size="sm"
                      disabled={apiLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmAction}
                      size="sm"
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
                          Confirm{" "}
                          {confirmAction === "reviewed" ? "Review" : "Approval"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
