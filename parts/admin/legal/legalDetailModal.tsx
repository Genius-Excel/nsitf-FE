"use client";
import React, { useEffect, useRef } from "react";
import { X, FileText, Download } from "lucide-react";
import { LegalActivityRecord } from "@/lib/types";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";

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

  if (!isOpen || !activity) return null;

  const handleDownload = () => {
    const content = `
LEGAL ACTIVITY DETAILS
======================
Region: ${activity.region}
Branch: ${activity.branch}
Period: ${activity.activitiesPeriod}

EMPLOYER METRICS
================
Recalcitrant Employers: ${activity.recalcitrantEmployers}
Defaulting Employers: ${activity.defaultingEmployers}
ECS Number: ${activity.ecsNo}

LEGAL ACTIONS
=============
Plan Issued: ${activity.planIssued}
Alternate Dispute Resolution (ADR): ${activity.adr}
Cases Instituted in Court: ${activity.casesInstituted}

SECTORS
=======
${activity.sectors}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal-activity-${activity.region}-${activity.branch}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText
                  className="w-5 h-5 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <h2
                  id="modal-title"
                  className="text-lg sm:text-xl font-bold text-gray-900 truncate"
                >
                  Legal Activity Details
                </h2>
                <p
                  id="modal-description"
                  className="text-xs sm:text-sm text-gray-600 truncate"
                >
                  {activity.region} - {activity.branch}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Location Information */}
            <section aria-labelledby="location-heading">
              <h3
                id="location-heading"
                className="text-sm font-semibold text-gray-900 mb-3"
              >
                Location Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Region
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Branch
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.branch}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">
                      Period
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.activitiesPeriod}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Employer Metrics */}
            <section aria-labelledby="employer-heading">
              <h3
                id="employer-heading"
                className="text-sm font-semibold text-gray-900 mb-3"
              >
                Employer Metrics
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-orange-600 uppercase mb-1">
                      Recalcitrant Employers
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {activity.recalcitrantEmployers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 uppercase mb-1">
                      Defaulting Employers
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {activity.defaultingEmployers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 uppercase mb-1">
                      ECS Number
                    </p>
                    <p className="text-sm font-medium text-orange-900">
                      {activity.ecsNo}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Actions */}
            <section aria-labelledby="actions-heading">
              <h3
                id="actions-heading"
                className="text-sm font-semibold text-gray-900 mb-3"
              >
                Legal Actions Taken
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-blue-600 uppercase mb-1">
                      Plan Issued
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {activity.planIssued}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 uppercase mb-1">ADR</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {activity.adr}
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
                      {activity.casesInstituted}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">In Court</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sectors */}
            <section aria-labelledby="sectors-heading">
              <h3
                id="sectors-heading"
                className="text-sm font-semibold text-gray-900 mb-3"
              >
                Sectors Covered
              </h3>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex flex-wrap gap-2">
                  {activity.sectors.split(", ").map((sector, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
