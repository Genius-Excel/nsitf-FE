"use client";
import React, { useEffect, useRef } from "react";
import { X, FileText, Download } from "lucide-react";
import { LegalCase } from "@/lib/types";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface LegalDetailModalProps {
  legalCase: LegalCase | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalDetailModal: React.FC<LegalDetailModalProps> = ({
  legalCase,
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

  if (!isOpen || !legalCase) return null;

  const handleDownload = () => {
    const content = `
LEGAL CASE DETAILS
==================
Case ID: ${legalCase.id}
Title: ${legalCase.title}
Status: ${getStatusLabel(legalCase.status)}

CASE INFORMATION
================
Description: ${legalCase.description}
Created: ${legalCase.created}
Filed: ${legalCase.filed}
Amount Claimed: ${legalCase.amountClaimed}
${legalCase.nextHearing ? `Next Hearing: ${legalCase.nextHearing}` : ""}

${legalCase.outcome ? `OUTCOME\n=======\n${legalCase.outcome}` : ""}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal-case-${legalCase.id.replace(/\s+/g, "-")}.txt`;
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
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
                <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Legal Case Details
                </h2>
                <p id="modal-description" className="text-xs sm:text-sm text-gray-600 truncate">
                  {legalCase.id} - {legalCase.title}
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
            {/* Status Badge */}
            <section aria-labelledby="status-heading">
              <h3 id="status-heading" className="sr-only">Case Status</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                    legalCase.status
                  )}`}
                >
                  {getStatusLabel(legalCase.status)}
                </span>
              </div>
            </section>

            {/* Case Information */}
            <section aria-labelledby="case-info-heading">
              <h3 id="case-info-heading" className="text-sm font-semibold text-gray-900 mb-3">
                Case Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-900">{legalCase.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">Created</p>
                    <p className="text-sm font-medium text-gray-900">{legalCase.created}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">Case Instituted</p>
                    <p className="text-sm font-medium text-gray-900">{legalCase.filed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">Amount Claimed</p>
                    <p className="text-sm font-medium text-gray-900">{legalCase.amountClaimed}</p>
                  </div>
                  {legalCase.nextHearing && (
                    <div>
                      <p className="text-xs text-gray-600 uppercase mb-1">Next Hearing</p>
                      <p className="text-sm font-medium text-gray-900">{legalCase.nextHearing}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Outcome */}
            {legalCase.outcome && (
              <section aria-labelledby="outcome-heading">
                <h3 id="outcome-heading" className="text-sm font-semibold text-gray-900 mb-3">
                  Outcome
                </h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-900">{legalCase.outcome}</p>
                </div>
              </section>
            )}
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
