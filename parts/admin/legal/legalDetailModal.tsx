// ============================================================================
// LegalDetailModal - Refactored
// ============================================================================
// NOW ACTUALLY USES THE DETAIL API ENDPOINT
// Fetches detailed legal activity data when modal opens
// ============================================================================

"use client";

import { X, FileText, Download } from "lucide-react";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { useLegalDetail } from "@/hooks/legal/useLegalDetail";
import type { LegalActivityRecord } from "@/lib/types/legal";
import { formatLegalDate, formatSectors } from "@/lib/types/legal";

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
                  {detailData.region} - {detailData.branch}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
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
                      {detailData.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Branch
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {detailData.branch}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Period
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatLegalDate(detailData.period)}
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
                  <div>
                    <p className="text-xs text-orange-600 uppercase mb-1">
                      Recalcitrant Employers
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {detailData.metrics.recalcitrantEmployers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 uppercase mb-1">
                      Defaulting Employers
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {detailData.metrics.defaultingEmployers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 uppercase mb-1">
                      ECS Number
                    </p>
                    <p className="text-sm font-medium text-orange-900">
                      {detailData.metrics.ecsNumber}
                    </p>
                  </div>
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
                  <div>
                    <p className="text-xs text-blue-600 uppercase mb-1">
                      Plan Issued
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {detailData.legalActions.planIssued}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 uppercase mb-1">ADR</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {detailData.legalActions.adr}
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
                      {detailData.legalActions.casesInstituted}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">In Court</p>
                  </div>
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
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
