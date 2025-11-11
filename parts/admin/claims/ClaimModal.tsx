"use client";
import { X, Download, Printer, FileText, Calendar, User, Building2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor, getTypeTextColor } from "@/lib/utils";
import { Claim } from "@/lib/types";

interface ClaimDetailModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !claim) return null;

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

  // Calculate difference and processing time
  const difference = claim.amountRequested - claim.amountPaid;
  const differencePercentage = ((difference / claim.amountRequested) * 100).toFixed(1);
  
  const processingTime = claim.dateProcessed && claim.datePaid 
    ? Math.ceil((new Date(claim.datePaid).getTime() - new Date(claim.dateProcessed).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text file with claim details
    const content = `
CLAIM DETAILS
=============

Claim ID: ${claim.claimId}
Employer: ${claim.employer}
Claimant: ${claim.claimant}
Type: ${claim.type}
Status: ${claim.status}

FINANCIAL INFORMATION
=====================
Amount Requested: ${formatCurrency(claim.amountRequested)}
Amount Paid: ${formatCurrency(claim.amountPaid)}
Difference: ${formatCurrency(difference)} (${differencePercentage}%)

TIMELINE
========
Date Processed: ${formatDate(claim.dateProcessed)}
Date Paid: ${formatDate(claim.datePaid)}
Processing Time: ${processingTime ? `${processingTime} days` : 'N/A'}

CLASSIFICATION
==============
Sector: ${claim.sector || 'N/A'}
Class: ${claim.class || 'N/A'}
Payment Period: ${claim.date || 'N/A'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claim-${claim.claimId}.txt`;
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
                <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
                <p className="text-sm text-gray-600">{claim.claimId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusBadgeColor(claim.status)} font-medium text-sm px-4 py-2`}>
                {claim.status}
              </Badge>
              <span className={`font-semibold text-sm ${getTypeTextColor(claim.type)}`}>
                {claim.type}
              </span>
            </div>

            {/* Parties Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Employer Information</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Company Name</p>
                    <p className="text-sm font-medium text-gray-900">{claim.employer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Sector</p>
                    <p className="text-sm font-medium text-gray-900">{claim.sector || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Class</p>
                    <p className="text-sm font-medium text-gray-900">{claim.class || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Claimant Information</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{claim.claimant}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Claim Type</p>
                    <p className="text-sm font-medium text-gray-900">{claim.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Payment Period</p>
                    <p className="text-sm font-medium text-gray-900">{claim.date || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-700" />
                <h3 className="font-semibold text-gray-900">Financial Summary</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Amount Requested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(claim.amountRequested)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(claim.amountPaid)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Difference</p>
                  <p className={`text-2xl font-bold ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {difference > 0 ? '-' : '+'}{formatCurrency(Math.abs(difference))}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {difference > 0 ? '-' : '+'}{Math.abs(Number(differencePercentage))}% of requested
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
                    <p className="text-sm font-medium text-gray-900">Date Processed</p>
                    <p className="text-sm text-gray-600">{formatDate(claim.dateProcessed)}</p>
                  </div>
                </div>

                {claim.datePaid && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Date Paid</p>
                      <p className="text-sm text-gray-600">{formatDate(claim.datePaid)}</p>
                    </div>
                  </div>
                )}

                {processingTime && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Processing Time:</span> {processingTime} days
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Claim ID</p>
                  <p className="text-sm font-medium text-gray-900">{claim.claimId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Status</p>
                  <p className="text-sm font-medium text-gray-900">{claim.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Type</p>
                  <p className="text-sm font-medium text-gray-900">{claim.type}</p>
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};