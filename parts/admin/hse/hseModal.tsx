"use client";
import { X, Download, Printer, FileText, TrendingUp, Building2, Target, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HSERecord } from "@/lib/types";

interface HSETableDetailModalProps {
  record: HSERecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HSETableDetailModal: React.FC<HSETableDetailModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  // Calculate metrics
  const achievementRate = record.targetOSH > 0
    ? ((record.totalActualOSH / record.targetOSH) * 100).toFixed(1)
    : "0";
  
  const variance = record.totalActualOSH - record.targetOSH;
  const totalActivities = record.oshEnlightenment + record.oshInspectionAudit + record.accidentInvestigation;
  
  // Activity breakdown percentages
  const enlightenmentPercentage = totalActivities > 0 
    ? ((record.oshEnlightenment / totalActivities) * 100).toFixed(1)
    : "0";
  const auditPercentage = totalActivities > 0
    ? ((record.oshInspectionAudit / totalActivities) * 100).toFixed(1)
    : "0";
  const investigationPercentage = totalActivities > 0
    ? ((record.accidentInvestigation / totalActivities) * 100).toFixed(1)
    : "0";

  // Helper to get performance badge color
  const getPerformanceBadge = (rate: number): string => {
    if (rate >= 80) return "bg-green-100 text-green-700 border-green-300";
    if (rate >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  // Helper to get achievement status
  const getAchievementColor = (variance: number): string => {
    if (variance >= 0) return "text-green-700";
    return "text-red-700";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
HSE RECORD DETAILS
==================

Region: ${record.region}
Branch: ${record.branch}
Period: ${record.activitiesPeriod}

ACTIVITY SUMMARY
================
Total Actual OSH Activities: ${record.totalActualOSH.toLocaleString()}
Target OSH Activities: ${record.targetOSH.toLocaleString()}
Achievement Rate: ${achievementRate}%
Variance: ${variance >= 0 ? '+' : ''}${variance}
Performance Rate: ${record.performanceRate}%

ACTIVITY BREAKDOWN
==================
OSH Enlightenment & Awareness: ${record.oshEnlightenment} (${enlightenmentPercentage}%)
OSH Inspection & Audit: ${record.oshInspectionAudit} (${auditPercentage}%)
Accident Investigation: ${record.accidentInvestigation} (${investigationPercentage}%)

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hse-record-${record.branch.replace(/\s+/g, '-')}-${record.activitiesPeriod}.txt`;
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
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">HSE Activity Record</h2>
                <p className="text-sm text-gray-600">{record.branch} - {record.activitiesPeriod}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Download HSE details"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                title="Print HSE details"
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
            {/* Region and Branch Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Location Information</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Region</p>
                    <p className="text-sm font-medium text-gray-900">{record.region}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Branch</p>
                    <p className="text-sm font-medium text-gray-900">{record.branch}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Period</p>
                    <p className="text-sm font-medium text-gray-900">{record.activitiesPeriod}</p>
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
                    <p className="text-xs text-gray-600 uppercase">Performance Rate</p>
                    <Badge className={`${getPerformanceBadge(record.performanceRate)} font-semibold text-lg px-3 py-1 border`}>
                      {record.performanceRate}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Achievement Rate</p>
                    <p className={`text-xl font-bold ${Number(achievementRate) >= 100 ? 'text-green-700' : 'text-yellow-700'}`}>
                      {achievementRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Target vs Actual */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Target vs Actual Activities</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Target OSH Activities</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {record.targetOSH.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Actual OSH Activities</p>
                  <p className="text-3xl font-bold text-green-700">
                    {record.totalActualOSH.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {achievementRate}% of target
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase mb-1">Variance</p>
                  <p className={`text-3xl font-bold ${getAchievementColor(variance)}`}>
                    {variance >= 0 ? '+' : ''}{variance}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {variance >= 0 ? 'Above target' : 'Below target'}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <p className="text-xs text-gray-600 uppercase">OSH Enlightenment</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {record.oshEnlightenment}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {enlightenmentPercentage}% of total activities
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p className="text-xs text-gray-600 uppercase">OSH Inspection & Audit</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {record.oshInspectionAudit}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {auditPercentage}% of total activities
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-xs text-gray-600 uppercase">Accident Investigation</p>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {record.accidentInvestigation}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {investigationPercentage}% of total activities
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase mb-1">Total Activities</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalActivities.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Region</p>
                  <p className="text-sm font-medium text-gray-900">{record.region}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Branch</p>
                  <p className="text-sm font-medium text-gray-900">{record.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Period</p>
                  <p className="text-sm font-medium text-gray-900">{record.activitiesPeriod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Performance</p>
                  <p className="text-sm font-medium text-gray-900">{record.performanceRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Achievement</p>
                  <p className="text-sm font-medium text-gray-900">{achievementRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Total Activities</p>
                  <p className="text-sm font-medium text-gray-900">{totalActivities}</p>
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