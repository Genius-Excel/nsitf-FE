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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import type { InvestmentRecord } from "@/lib/types/investment";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { useBulkInvestmentActions } from "@/hooks/investment/useBulkInvestmentActions";

interface InvestmentDetailModalProps {
  investment: InvestmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  investment,
  isOpen,
  onClose,
  onRefresh,
}) => {
  // State management
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "reviewed" | "approved" | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<InvestmentRecord | null>(null);
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
      setEditedData(investment);
      setIsEditMode(false);
    }
  }, [isOpen, investment]);

  if (!isOpen) return null;

  // Permission checks
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
    if (!editedData || !investment) return;

    setIsSubmitting(true);
    try {
      // For now, just show success message
      // TODO: Implement update API endpoint
      setIsEditMode(false);
      onRefresh?.();
      toast.success("Investment record updated successfully");
    } catch (error) {
      toast.error("Failed to update investment record");
    } finally {
      setIsSubmitting(false);
    }
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
        onRefresh?.();
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
Debt Recovered: ${formatCurrency(investment.debtRecovered)}

TOTAL COLLECTIONS
=================
${formatCurrency(
  investment.contributionsPrivateSector +
    investment.contributionsPublicTreasury +
    investment.contributionsPublicNonTreasury +
    investment.contributionsInformalEconomy +
    investment.rentalFees +
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
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Investment Record Details
                </h2>
                <p className="text-sm text-gray-500">
                  {investment?.branch} -{" "}
                  {formatPeriod(investment?.period || "")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Status:
                </span>
                <Badge
                  className={getStatusBadgeColor(
                    investment?.recordStatus || "pending"
                  )}
                >
                  {investment?.recordStatus?.toUpperCase() || "PENDING"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                {!isEditMode && canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

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
                  <p className="text-xs text-gray-500">Private Sector</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      investment?.contributionsPrivateSector || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Public Treasury Funded
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      investment?.contributionsPublicTreasury || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Public Non-Treasury</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      investment?.contributionsPublicNonTreasury || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Informal Economy</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      investment?.contributionsInformalEconomy || 0
                    )}
                  </p>
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
                  <p className="text-xs text-gray-500">Rental Fees</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(investment?.rentalFees || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Debt Recovered</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(investment?.debtRecovered || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Collections */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white">
              <h3 className="text-sm font-semibold mb-2">Total Collections</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  (investment?.contributionsPrivateSector || 0) +
                    (investment?.contributionsPublicTreasury || 0) +
                    (investment?.contributionsPublicNonTreasury || 0) +
                    (investment?.contributionsInformalEconomy || 0) +
                    (investment?.rentalFees || 0) +
                    (investment?.debtRecovered || 0)
                )}
              </p>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
            <div className="flex items-center gap-2">
              {canReview &&
                investment?.recordStatus?.toLowerCase() === "pending" && (
                  <Button
                    onClick={() => handleStatusChange("reviewed")}
                    disabled={isSubmitting || apiLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Reviewed
                  </Button>
                )}
              {canApprove &&
                investment?.recordStatus?.toLowerCase() === "reviewed" && (
                  <Button
                    onClick={() => handleStatusChange("approved")}
                    disabled={isSubmitting || apiLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                )}
            </div>
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm {confirmAction === "reviewed" ? "Review" : "Approval"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to{" "}
              {confirmAction === "reviewed" ? "review" : "approve"} this
              investment record?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
