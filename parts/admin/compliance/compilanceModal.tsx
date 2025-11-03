"use client";
import { X, Download, Printer, FileText, TrendingUp, Building2, Users, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComplianceEntry {
  id: string;
  region: string;
  branch: string;
  contributionCollected: number;
  target: number;
  achievement: number;
  employersRegistered: number;
  employees: number;
  certificateFees: number;
  period: string;
}

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
  if (!isOpen || !entry) return null;

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate metrics
  const shortfall = entry.target - entry.contributionCollected;
  const isTargetMet = entry.contributionCollected >= entry.target;
  const employeePerEmployer = entry.employersRegistered > 0
    ? (entry.employees / entry.employersRegistered).toFixed(1)
    : "0";
  const contributionPerEmployee = entry.employees > 0
    ? entry.contributionCollected / entry.employees
    : 0;

  // Helper to get performance badge color
  const getPerformanceBadge = (rate: number): string => {
    if (rate >= 90) return "bg-green-100 text-green-700 border-green-300";
    if (rate >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (rate >= 50) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
COMPLIANCE RECORD DETAILS
=========================

Region: ${entry.region}
Branch: ${entry.branch}
Period: ${entry.period}

CONTRIBUTION SUMMARY
====================
Target: ${formatCurrency(entry.target)}
Contribution Collected: ${formatCurrency(entry.contributionCollected)}
Achievement Rate: ${entry.achievement.toFixed(1)}%
${isTargetMet ? 'Status: TARGET MET ✓' : `Shortfall: ${formatCurrency(shortfall)}`}

EMPLOYER & EMPLOYEE DATA
========================
Employers Registered: ${entry.employersRegistered.toLocaleString()}
Total Employees: ${entry.employees.toLocaleString()}
Average Employees per Employer: ${employeePerEmployer}
Contribution per Employee: ${formatCurrency(contributionPerEmployee)}

CERTIFICATE FEES
================
Total Certificate Fees: ${formatCurrency(entry.certificateFees)}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-${entry.region.replace(/\s+/g, '-')}-${entry.period.replace(/\s+/g, '-')}.txt`;
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
                <h2 className="text-xl font-bold text-gray-900">Compliance Record</h2>
                <p className="text-sm text-gray-600">{entry.region} {entry.branch && `- ${entry.branch}`} - {entry.period}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Download compliance details"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Print compliance details"
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
            {/* Region and Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Location Information</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Region</p>
                    <p className="text-sm font-medium text-gray-900">{entry.region}</p>
                  </div>
                  {entry.branch && (
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Branch</p>
                      <p className="text-sm font-medium text-gray-900">{entry.branch}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Period</p>
                    <p className="text-sm font-medium text-gray-900">{entry.period}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Achievement Rate</p>
                    <Badge className={`${getPerformanceBadge(entry.achievement)} font-semibold text-lg px-3 py-1 border`}>
                      {entry.achievement.toFixed(1)}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Status</p>
                    <p className={`text-xl font-bold ${isTargetMet ? 'text-green-700' : 'text-orange-700'}`}>
                      {isTargetMet ? 'Target Met ✓' : 'In Progress'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution Summary */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">Contribution Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Target</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(entry.target)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Collected</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(entry.contributionCollected)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {entry.achievement.toFixed(1)}% of target
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">{isTargetMet ? 'Excess' : 'Shortfall'}</p>
                  <p className={`text-2xl font-bold ${isTargetMet ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(Math.abs(shortfall))}
                  </p>
                  <p className={`text-xs mt-1 ${isTargetMet ? 'text-green-600' : 'text-orange-600'}`}>
                    {Math.abs((shortfall / entry.target) * 100).toFixed(1)}% {isTargetMet ? 'above' : 'below'} target
                  </p>
                </div>
              </div>
            </div>

            {/* Employer & Employee Statistics */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Employer & Employee Statistics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Employers Registered</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {entry.employersRegistered.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {entry.employees.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Avg Employees per Employer</p>
                  <p className="text-xl font-bold text-gray-900">
                    {employeePerEmployer}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Contribution per Employee</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(contributionPerEmployee)}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Fees */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Certificate Fees</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase mb-1">Total Certificate Fees Collected</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {formatCurrency(entry.certificateFees)}
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Metrics Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Region</p>
                  <p className="text-sm font-medium text-gray-900">{entry.region}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Branch</p>
                  <p className="text-sm font-medium text-gray-900">{entry.branch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Period</p>
                  <p className="text-sm font-medium text-gray-900">{entry.period}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Achievement</p>
                  <p className="text-sm font-medium text-gray-900">{entry.achievement.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Employers</p>
                  <p className="text-sm font-medium text-gray-900">{entry.employersRegistered.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Employees</p>
                  <p className="text-sm font-medium text-gray-900">{entry.employees.toLocaleString()}</p>
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