// ============================================================================
// InvestmentDetailModal - Detail View for Investment Records
// ============================================================================
// Shows detailed information about an investment record
// Includes financial data, branch info, and status management
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import {
  X,
  Edit,
  FileText,
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import type { InvestmentRecord } from "@/lib/types/investment";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { useBulkInvestmentActions } from "@/hooks/investment/useBulkInvestmentActions";
import { useSingleInvestment } from "@/hooks/investment/useSingleInvestment";
import { updateInvestmentRecord } from "@/services/investment";

interface InvestmentDetailModalProps {
  investment: InvestmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  investment: initialInvestment,
  isOpen,
  onClose,
  onRefresh,
}) => {
  // Fetch detailed investment data
  const {
    investment: detailData,
    loading,
    error,
    refetch,
  } = useSingleInvestment(isOpen ? initialInvestment?.id || null : null);

  // Use the fetched detail data if available, otherwise use initial investment
  const investment = detailData || initialInvestment;

  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approved" | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<InvestmentRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use bulk actions hook
  const {
    bulkReview,
    bulkApprove,
    loading: apiLoading,
  } = useBulkInvestmentActions();

  // Get user role
  useEffect(() => {
    const user = getUserFromStorage();
    setUserRole(user?.role || null);
  }, []);

  // Initialize edited data
  useEffect(() => {
    if (isOpen && investment) {
      setEditedData({});
      setIsEditMode(false);
    }
  }, [isOpen, investment]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <LoadingState message="Loading investment details..." />
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <ErrorState
            title="Failed to load investment details"
            message={error?.message || "Investment record not found"}
            onRetry={refetch}
          />
          <Button onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Permission checks
  const normalizedRole = userRole?.toLowerCase();
  const isApproved = investment?.recordStatus?.toLowerCase() === "approved";
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

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format period
  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedData(investment);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!investment || Object.keys(editedData).length === 0) return;

    setIsSubmitting(true);
    try {
      await updateInvestmentRecord(investment.id, editedData);
      setIsEditMode(false);
      setEditedData({});
      await refetch();
      onRefresh?.();
      toast.success("Investment record updated successfully");
    } catch (error) {
      console.error("Error updating investment:", error);
      toast.error("Failed to update investment record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (
    field: keyof InvestmentRecord,
    value: number | string
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatusChange = (newStatus: "reviewed" | "approved") => {
    setConfirmAction(newStatus);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!investment || !confirmAction) return;

    setIsSubmitting(true);
    try {
      // Use the appropriate bulk action based on status
      const success =
        confirmAction === "reviewed"
          ? await bulkReview([investment.id])
          : await bulkApprove([investment.id]);

      if (success) {
        toast.success(
          `Investment record ${
            confirmAction === "reviewed" ? "reviewed" : "approved"
          } successfully`
        );
        setShowConfirmDialog(false);
        setConfirmAction(null);
        await refetch(); // Refresh the modal data
        onRefresh?.(); // Refresh the table
      }
    } catch (error) {
      toast.error(`Failed to ${confirmAction} investment record`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!investment) return;

    const content = `
INVESTMENT RECORD DETAILS
=========================

Branch: ${investment.branch}
Region: ${investment.region}
Period: ${formatPeriod(investment.period)}

CONTRIBUTION COLLECTIONS
========================
Private Sector: ${formatCurrency(investment.contributionsPrivateSector)}
Public Treasury Funded: ${formatCurrency(
      investment.contributionsPublicTreasury
    )}
Public Non-Treasury: ${formatCurrency(
      investment.contributionsPublicNonTreasury
    )}
Informal Economy: ${formatCurrency(investment.contributionsInformalEconomy)}

OTHER REVENUE
=============
Rental Fees: ${formatCurrency(investment.rentalFees)}
ECS Registration Fees: ${formatCurrency(investment.ecsRegistrationFees || 0)}
ECS Certificate Fees: ${formatCurrency(investment.ecsCertificateFees || 0)}
Debt Recovered: ${formatCurrency(investment.debtRecovered)}

TOTAL COLLECTIONS
=================
${formatCurrency(
  investment.contributionsPrivateSector +
    investment.contributionsPublicTreasury +
    investment.contributionsPublicNonTreasury +
    investment.contributionsInformalEconomy +
    investment.rentalFees +
    (investment.ecsRegistrationFees || 0) +
    (investment.ecsCertificateFees || 0) +
    investment.debtRecovered
)}

Status: ${investment.recordStatus || "Pending"}
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investment-${(investment.branch || "record").replace(
      /\s+/g,
      "-"
    )}-${investment.period}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "reviewed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
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
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Investment Record Details
                </h2>
                <p className="text-sm text-gray-600">
                  {investment?.branch} -{" "}
                  {formatPeriod(investment?.period || "")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditMode && canEdit && (
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Branch Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="text-sm font-medium text-gray-900">
                    {investment?.branch}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="text-sm font-medium text-gray-900">
                    {investment?.region}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Period</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPeriod(investment?.period || "")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contribution Collections */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Contribution Collections
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Private Sector</p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.contributionsPrivateSector ??
                        investment?.contributionsPrivateSector ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "contributionsPrivateSector",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        investment?.contributionsPrivateSector || 0
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Public Treasury Funded
                  </p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.contributionsPublicTreasury ??
                        investment?.contributionsPublicTreasury ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "contributionsPublicTreasury",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        investment?.contributionsPublicTreasury || 0
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Public Non-Treasury
                  </p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.contributionsPublicNonTreasury ??
                        investment?.contributionsPublicNonTreasury ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "contributionsPublicNonTreasury",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        investment?.contributionsPublicNonTreasury || 0
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Informal Economy</p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.contributionsInformalEconomy ??
                        investment?.contributionsInformalEconomy ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "contributionsInformalEconomy",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        investment?.contributionsInformalEconomy || 0
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Other Revenue */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Other Revenue
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rental Fees</p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.rentalFees ?? investment?.rentalFees ?? 0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "rentalFees",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(investment?.rentalFees || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    ECS Registration Fees
                  </p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.ecsRegistrationFees ??
                        investment?.ecsRegistrationFees ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "ecsRegistrationFees",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(investment?.ecsRegistrationFees || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    ECS Certificate Fees
                  </p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.ecsCertificateFees ??
                        investment?.ecsCertificateFees ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "ecsCertificateFees",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(investment?.ecsCertificateFees || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Debt Recovered</p>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={
                        editedData.debtRecovered ??
                        investment?.debtRecovered ??
                        0
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          "debtRecovered",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(investment?.debtRecovered || 0)}
                    </p>
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
                    className={`mt-1 ${getStatusBadgeColor(
                      investment?.recordStatus || "pending"
                    )}`}
                  >
                    {investment?.recordStatus?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Reviewed By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {investment?.reviewedBy || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Approved By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {investment?.approvedBy || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Collections */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white">
              <h3 className="text-sm font-semibold mb-2">Total Collections</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  (editedData.contributionsPrivateSector ??
                    (investment?.contributionsPrivateSector || 0)) +
                    (editedData.contributionsPublicTreasury ??
                      (investment?.contributionsPublicTreasury || 0)) +
                    (editedData.contributionsPublicNonTreasury ??
                      (investment?.contributionsPublicNonTreasury || 0)) +
                    (editedData.contributionsInformalEconomy ??
                      (investment?.contributionsInformalEconomy || 0)) +
                    (editedData.rentalFees ?? (investment?.rentalFees || 0)) +
                    (editedData.ecsRegistrationFees ??
                      (investment?.ecsRegistrationFees || 0)) +
                    (editedData.ecsCertificateFees ??
                      (investment?.ecsCertificateFees || 0)) +
                    (editedData.debtRecovered ??
                      (investment?.debtRecovered || 0))
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {/* Dynamic buttons based on record_status */}
            {!isEditMode && (
              <>
                {/* Pending records: Show Review button */}
                {investment?.recordStatus?.toLowerCase() === "pending" &&
                  (canReview || canApprove) && (
                    <Button
                      onClick={() => handleStatusChange("reviewed")}
                      disabled={isSubmitting || apiLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  )}
                {/* Reviewed records: Show Approve button (only Admin can approve) */}
                {investment?.recordStatus?.toLowerCase() === "reviewed" &&
                  canApprove && (
                    <Button
                      onClick={() => handleStatusChange("approved")}
                      disabled={isSubmitting || apiLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                {/* Approved records: Show approved badge */}
                {investment?.recordStatus?.toLowerCase() === "approved" && (
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Approved
                  </Badge>
                )}
              </>
            )}
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[60]"
            onClick={() => {
              setShowConfirmDialog(false);
              setConfirmAction(null);
            }}
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
                      : "Approve Investment Record?"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmAction === "reviewed"
                      ? "Are you sure you want to mark this investment record as reviewed?"
                      : "Are you sure you want to approve this investment record?"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmStatusChange}
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
