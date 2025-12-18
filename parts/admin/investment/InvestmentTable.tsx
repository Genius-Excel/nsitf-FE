// ============================================================================
// Investment Records Table Component
// ============================================================================
// Displays investment records with bulk actions and status badges
// ============================================================================

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant } from "@/components/design-system/StatusBadge";
import type { InvestmentRecord } from "@/lib/types/investment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvestmentTableProps {
  records: InvestmentRecord[];
  selectedRecords: Set<string>;
  onSelectAll: () => void;
  onSelectRecord: (recordId: string) => void;
  onBulkReview: () => void;
  onBulkApprove: () => void;
  isHQUser: boolean;
  actionLoading: boolean;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  records,
  selectedRecords,
  onSelectAll,
  onSelectRecord,
  onBulkReview,
  onBulkApprove,
  isHQUser,
  actionLoading,
}) => {
  const [confirmAction, setConfirmAction] = useState<"review" | "approve" | null>(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<InvestmentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${(value / 1000000).toFixed(2)}M`;
  };

  // Format period
  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const handleConfirmReview = () => {
    onBulkReview();
    setConfirmAction(null);
  };

  const handleConfirmApprove = () => {
    onBulkApprove();
    setConfirmAction(null);
  };

  const allSelected = records.length > 0 && selectedRecords.size === records.length;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Table Header with Bulk Actions */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Investment Records</h2>
          {selectedRecords.size > 0 && isHQUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedRecords.size} record{selectedRecords.size > 1 ? "s" : ""} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction("review")}
                disabled={actionLoading}
              >
                Mark as Reviewed
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setConfirmAction("approve")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark as Approved
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectRecord("")}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {isHQUser && (
                  <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-left whitespace-nowrap">
                  Month
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  Private Sector
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  Public (Treasury)
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  Public (Non-Treasury)
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  Informal Economy
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  Rental Fees
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  ECS Reg. Fees
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  ECS Cert. Fees
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-right whitespace-nowrap">
                  Debt Recovered
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center whitespace-nowrap">
                  Period
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center whitespace-nowrap">
                  Status
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {records.length > 0 ? (
                records.map((record) => {
                  const isSelected = selectedRecords.has(record.id);
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-green-50" : ""
                      }`}
                    >
                      {isHQUser && (
                        <td className="px-2 py-1.5 text-xs text-center whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelectRecord(record.id)}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            aria-label={`Select row ${record.id}`}
                          />
                        </td>
                      )}
                      <td className="px-2 py-1.5 text-xs text-gray-900 whitespace-nowrap">
                        {record.month}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.contributionsPrivateSector)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.contributionsPublicTreasury)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.contributionsPublicNonTreasury)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.contributionsInformalEconomy)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.rentalFees)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.ecsRegistrationFees)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.ecsCertificateFees)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(record.debtRecovered)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-center whitespace-nowrap">
                        {formatPeriod(record.period)}
                      </td>
                      <td className="px-2 py-1.5 text-center whitespace-nowrap">
                        <StatusBadge
                          variant={getStatusVariant(record.recordStatus)}
                          size="sm"
                        >
                          {record.recordStatus.charAt(0).toUpperCase() +
                            record.recordStatus.slice(1)}
                        </StatusBadge>
                      </td>
                      <td className="px-2 py-1.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedRecordDetail(record);
                            setIsDetailModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center p-1 text-gray-600 hover:text-green-600 transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isHQUser ? 13 : 12}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No investment records found. Adjust filters or upload data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Confirmation Dialog */}
      <AlertDialog
        open={confirmAction === "review"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Review</AlertDialogTitle>
            <AlertDialogDescription>
              Mark {selectedRecords.size} record{selectedRecords.size > 1 ? "s" : ""} as reviewed?
              <br />
              <br />
              This action will update the record status and notify relevant stakeholders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReview}>
              Confirm Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Confirmation Dialog */}
      <AlertDialog
        open={confirmAction === "approve"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Approve {selectedRecords.size} record{selectedRecords.size > 1 ? "s" : ""}?
              <br />
              <br />
              ⚠️ This action is final and cannot be reversed. Ensure all data is validated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
