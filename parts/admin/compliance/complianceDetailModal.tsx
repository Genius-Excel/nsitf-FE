"use client";
import React, { useEffect, useRef } from "react";
import { X, FileText, Download } from "lucide-react";
import { ComplianceEntry } from "@/lib/types";
import { formatCurrencyFull } from "@/lib/utils";

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
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
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
                  <p className="text-xs text-gray-600 uppercase mb-1">Target</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-700">
                    {formatCurrencyFull(entry.target)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Collected
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    {formatCurrencyFull(entry.contributionCollected)}
                  </p>
                </div>
                <div
                  className={`${
                    isTargetMet
                      ? "bg-green-50 border-green-200"
                      : "bg-orange-50 border-orange-200"
                  } p-4 rounded-lg border`}
                >
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Performance Rate
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${
                      isTargetMet ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    {entry.achievement.toFixed(1)}%
                  </p>
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
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Total Employers
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {entry.employersRegistered.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Total Employees
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {entry.employees.toLocaleString()}
                  </p>
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
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Certificate Fees:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrencyFull(entry.certificateFees)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Region:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {entry.region}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Branch:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {entry.branch || "Main Branch"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Period:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {entry.period}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
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
