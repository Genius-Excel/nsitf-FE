"use client";
import { X, Download, Printer, FileText, TrendingUp, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InspectionRecord } from "@/lib/types";

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
  if (!isOpen || !inspection) return null;

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate recovery metrics
  const recoveryRate = inspection.debtEstablished > 0
    ? ((inspection.debtRecovered / inspection.debtEstablished) * 100).toFixed(1)
    : "0";
  
  const outstandingDebt = inspection.debtEstablished - inspection.debtRecovered;
  const averageDebtPerInspection = inspection.inspectionsConducted > 0
    ? inspection.debtEstablished / inspection.inspectionsConducted
    : 0;

  // Helper to get performance badge color
  const getPerformanceBadge = (rate: number): string => {
    if (rate >= 80) return "bg-green-100 text-green-700 border-green-300";
    if (rate >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
INSPECTION RECORD DETAILS
========================

Branch: ${inspection.branch}
Period: ${inspection.period}

INSPECTION SUMMARY
==================
Inspections Conducted: ${inspection.inspectionsConducted.toLocaleString()}
Demand Notices Issued: ${inspection.demandNotice}
Performance Rate: ${inspection.performanceRate}%

FINANCIAL SUMMARY
=================
Debt Established: ${formatCurrency(inspection.debtEstablished)}
Debt Recovered: ${formatCurrency(inspection.debtRecovered)}
Outstanding Debt: ${formatCurrency(outstandingDebt)}
Recovery Rate: ${recoveryRate}%
Average Debt per Inspection: ${formatCurrency(averageDebtPerInspection)}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-${inspection.branch.replace(/\s+/g, '-')}-${inspection.period}.txt`;
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Inspection Record</h2>
                <p className="text-sm text-gray-600">{inspection.branch} - {inspection.period}</p>
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
                  <h3 className="font-semibold text-gray-900">Branch Information</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Branch Name</p>
                    <p className="text-sm font-medium text-gray-900">{inspection.branch}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Period</p>
                    <p className="text-sm font-medium text-gray-900">{inspection.period}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Performance Rate</p>
                    <Badge className={`${getPerformanceBadge(inspection.performanceRate)} font-semibold text-lg px-3 py-1 border`}>
                      {inspection.performanceRate}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Recovery Rate</p>
                    <p className="text-xl font-bold text-green-700">{recoveryRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Activity */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">Inspection Activity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Inspections Conducted</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {inspection.inspectionsConducted.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Demand Notices Issued</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {inspection.demandNotice.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {((inspection.demandNotice / inspection.inspectionsConducted) * 100).toFixed(1)}% of inspections
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">Financial Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Debt Established</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(inspection.debtEstablished)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Debt Recovered</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(inspection.debtRecovered)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {recoveryRate}% of established debt
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Outstanding Debt</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(outstandingDebt)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {(100 - Number(recoveryRate)).toFixed(1)}% remaining
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase mb-1">Average Debt per Inspection</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(averageDebtPerInspection)}
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Branch</p>
                  <p className="text-sm font-medium text-gray-900">{inspection.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Period</p>
                  <p className="text-sm font-medium text-gray-900">{inspection.period}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Performance</p>
                  <p className="text-sm font-medium text-gray-900">{inspection.performanceRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Inspections</p>
                  <p className="text-sm font-medium text-gray-900">{inspection.inspectionsConducted}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Demand Notices</p>
                  <p className="text-sm font-medium text-gray-900">{inspection.demandNotice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Recovery Rate</p>
                  <p className="text-sm font-medium text-gray-900">{recoveryRate}%</p>
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