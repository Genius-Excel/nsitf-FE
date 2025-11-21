// ============================================================================
// InspectionDetailModal - Refactored
// ============================================================================
// NOW ACTUALLY USES THE DETAIL API ENDPOINT
// Fetches detailed inspection data when modal opens
// Shows: branch info, performance metrics, inspection activity, financial summary
// ============================================================================

"use client";

import {
  X,
  Download,
  Printer,
  FileText,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { useInspectionDetail } from "@/hooks/inspection/useInspectionDetail";
import type { InspectionRecord } from "@/lib/types/inspection";
import {
  formatInspectionCurrency,
  getInspectionPerformanceBadge,
  calculateRecoveryRate,
} from "@/lib/types/inspection";

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

  if (!isOpen) return null;

  // ============= HANDLERS =============
  const handlePrint = () => {
    window.print();
  };

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
                  {detailData.branchInformation.branchName} -{" "}
                  {detailData.branchInformation.period}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Download inspection details"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Print inspection details"
              >
                <Printer className="w-5 h-5" />
              </button>
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
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Region</p>
                    <p className="text-sm font-medium text-gray-900">
                      {detailData.branchInformation.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Branch</p>
                    <p className="text-sm font-medium text-gray-900">
                      {detailData.branchInformation.branchName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {detailData.branchInformation.period}
                    </p>
                  </div>
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
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Inspections Conducted
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {detailData.inspectionActivity.inspectionsConducted.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Demand Notices Issued
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {detailData.inspectionActivity.demandNoticesIssued.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Notice Percentage
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {detailData.inspectionActivity.demandNoticesPercent}%
                  </p>
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
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Debt Established
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatInspectionCurrency(
                      detailData.financialSummary.debtEstablished
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
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
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
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
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Average per Inspection
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatInspectionCurrency(
                      detailData.financialSummary.averageDebtPerInspection
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
