"use client";
import {
  X,
  Download,
  Printer,
  FileText,
  Calendar,
  User,
  Building2,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor, getTypeTextColor } from "@/lib/utils";
import { ClaimDetail } from "@/hooks/claims";

interface ClaimDetailModalProps {
  claimDetail: ClaimDetail | null;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
}

/**
 * Claim Detail Modal - Refactored Version
 *
 * Changes from original:
 * - Now uses ClaimDetail type (with financial, timeline, classification objects)
 * - No client-side calculations (API provides difference, percentage, processing time)
 * - Added loading state for detail fetch
 * - Uses camelCase field names (transformed by hook)
 */
export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claimDetail,
  isOpen,
  onClose,
  loading = false,
}) => {
  if (!isOpen) return null;

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!claimDetail) return;

    const content = `
CLAIM DETAILS
=============

Claim ID: ${claimDetail.claimId}
Employer: ${claimDetail.employer}
Claimant: ${claimDetail.claimant}
Type: ${claimDetail.type}
Status: ${claimDetail.status}

FINANCIAL INFORMATION
=====================
Amount Requested: ${formatCurrency(claimDetail.financial.amountRequested)}
Amount Paid: ${formatCurrency(claimDetail.financial.amountPaid)}
Difference: ${formatCurrency(claimDetail.financial.difference)} (${
      claimDetail.financial.differencePercent
    }%)

TIMELINE
========
Date Processed: ${formatDate(claimDetail.timeline.dateProcessed)}
Date Paid: ${formatDate(claimDetail.timeline.datePaid)}
Processing Time: ${claimDetail.timeline.processingTimeDays} days

CLASSIFICATION
==============
Sector: ${claimDetail.classification.sector || "N/A"}
Class: ${claimDetail.classification.class || "N/A"}
Payment Period: ${claimDetail.classification.paymentPeriod || "N/A"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim-${claimDetail.claimId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                  Claim Details
                </h2>
                {claimDetail && (
                  <p className="text-sm text-gray-600">{claimDetail.claimId}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {claimDetail && (
                <>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                    title="Download claim details"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                    title="Print claim details"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
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
                      <div>
                        <p className="text-xs text-gray-600 uppercase">
                          Company Name
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {claimDetail.employer}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">
                          Sector
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {claimDetail.classification.sector || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Class</p>
                        <p className="text-sm font-medium text-gray-900">
                          {claimDetail.classification.class || "—"}
                        </p>
                      </div>
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
                      <div>
                        <p className="text-xs text-gray-600 uppercase">
                          Full Name
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {claimDetail.claimant}
                        </p>
                      </div>
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
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Amount Requested
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(claimDetail.financial.amountRequested)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 uppercase mb-1">
                        Amount Paid
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(claimDetail.financial.amountPaid)}
                      </p>
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
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {claimDetail && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Download Report
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
