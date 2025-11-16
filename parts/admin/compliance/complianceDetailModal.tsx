"use client";
import React, { useEffect, useState, useRef } from "react";
import { X, FileText, Download } from "lucide-react";
import HttpService from "@/services/httpServices"; 
import { formatCurrencyFull } from "@/lib/utils";

interface ComplianceDetailModalProps {
  data: { region_id: string; period: string; region_name: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BranchSummary {
  branch: string;
  collected: number;
  target: number;
  performance_rate: number;
  employers: number;
  employees: number;
  registration_fees: number;
  certificate_fees: number;
}

interface ComplianceDetailResponse {
  metric_cards: {
    total_contributions: number;
    total_target: number;
    performance_rate: number;
    total_employers: number;
    total_employees: number;
  };
  branch_summary: BranchSummary[];
}

export const ComplianceDetailModal: React.FC<ComplianceDetailModalProps> = ({ data, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ComplianceDetailResponse | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && data) {
      fetchDetail();
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, data]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const http = new HttpService();
      const res = await http.getData(
        `/api/dashboard/compliance?region_id=${data?.region_id}&period=${data?.period}`
      );

      setDetail(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load compliance data.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-green-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {data?.region_name} Region — {data?.period}
                </h2>
              </div>
            </div>
            <button ref={closeButtonRef} onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" aria-label="Close modal">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {detail && (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 uppercase mb-1">Target</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">{formatCurrencyFull(detail.metric_cards.total_target)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 uppercase mb-1">Collected</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">{formatCurrencyFull(detail.metric_cards.total_contributions)}</p>
                  </div>
                  <div className="bg-orange-50 border-orange-200 p-4 rounded-lg border">
                    <p className="text-xs text-gray-600 uppercase mb-1">Performance Rate</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-700">{detail.metric_cards.performance_rate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Branch Summary */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Branch Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 border-b">Branch</th>
                          <th className="px-3 py-2 border-b">Collected</th>
                          <th className="px-3 py-2 border-b">Target</th>
                          <th className="px-3 py-2 border-b">Performance Rate</th>
                          <th className="px-3 py-2 border-b">Employers</th>
                          <th className="px-3 py-2 border-b">Employees</th>
                          <th className="px-3 py-2 border-b">Registration Fees</th>
                          <th className="px-3 py-2 border-b">Certificate Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.branch_summary.map((branch) => (
                          <tr key={branch.branch} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{branch.branch}</td>
                            <td className="px-3 py-2">{formatCurrencyFull(branch.collected)}</td>
                            <td className="px-3 py-2">{formatCurrencyFull(branch.target)}</td>
                            <td className="px-3 py-2">{branch.performance_rate.toFixed(1)}%</td>
                            <td className="px-3 py-2">{branch.employers}</td>
                            <td className="px-3 py-2">{branch.employees}</td>
                            <td className="px-3 py-2">{formatCurrencyFull(branch.registration_fees)}</td>
                            <td className="px-3 py-2">{formatCurrencyFull(branch.certificate_fees)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
