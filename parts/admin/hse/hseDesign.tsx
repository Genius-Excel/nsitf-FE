"use client";
import React, { useState, useEffect } from "react";
import { Eye, ChevronDown, CheckCircle, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserFromStorage, type UserRole } from "@/lib/auth";
import { toast } from "sonner";
import type {
  HSERecord,
  HSEActivity,
  HSEFormData,
  HSEStatCard,
} from "@/lib/types/hse";
import { getActivityStatusColor } from "@/lib/utils";
import { getHSEStatusColor } from "@/lib/types/hse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";

export const StatisticsCards: React.FC<{ stats: HSEStatCard[] }> = ({
  stats,
}) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <MetricsGrid columns={6}>
      {stats.map((stat, idx) => (
        <MetricCard
          key={idx}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          colorScheme="green"
        />
      ))}
    </MetricsGrid>
  );
};

export const RecentHSEActivities: React.FC<{
  activities: HSEActivity[];
  onViewDetails: (activity: HSEActivity) => void;
  onEdit: (activity: HSEActivity) => void;
}> = ({ activities, onViewDetails, onEdit }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-muted-foreground">No activities found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Recent HSE Activities
        </h2>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-6 hover:bg-muted/50 transition-colors"
          >
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === activity.id ? null : activity.id)
              }
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 text-xl text-primary">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {activity.type}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.organization} • {activity.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${getActivityStatusColor(
                    activity.status
                  )} font-medium text-xs`}
                >
                  {activity.status}
                </Badge>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedId === activity.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {expandedId === activity.id && activity.details && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Details:</span>
                </p>
                <p className="text-sm text-gray-700">{activity.details}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onViewDetails(activity)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Full Report
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(activity)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonthlySummary: React.FC<{
  data: { label: string; value: number }[];
}> = ({ data }) => (
  <div className="bg-green-50 rounded-lg border border-green-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Monthly HSE Summary
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((item, idx) => (
        <div key={idx}>
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ComplianceRate: React.FC<{
  percentage: number;
  change: string;
}> = ({ percentage, change }) => (
  <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Safety Compliance Rate
    </h2>
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-600 mt-1">Overall HSE</p>
        </div>
      </div>
    </div>
    <p className="text-center text-sm text-gray-600 mt-4">{change}</p>
  </div>
);

// ============== ADD/EDIT HSE MODAL ==============
export const HSEFormModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  formData: HSEFormData;
  onFormChange: (data: HSEFormData) => void;
  isEditing: boolean;
}> = ({ isOpen, onOpenChange, onSave, formData, onFormChange, isEditing }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditing ? "Edit HSE Record" : "Add New HSE Record"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Record Type */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Record Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.recordType}
            onValueChange={(value) =>
              onFormChange({ ...formData, recordType: value })
            }
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letter issued">Letter Issued</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="incident report">Incident Report</SelectItem>
              <SelectItem value="compliance notice">
                Compliance Notice
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employer */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Employer/Organization <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter employer name"
            value={formData.employer}
            onChange={(e) =>
              onFormChange({ ...formData, employer: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.dateLogged}
            onChange={(e) =>
              onFormChange({ ...formData, dateLogged: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              onFormChange({ ...formData, status: value })
            }
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Under Investigation">
                Under Investigation
              </SelectItem>
              <SelectItem value="Follow-up Required">
                Follow-up Required
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Safety Compliance Rate */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Safety Compliance Rate (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 95"
            value={formData.safetyComplianceRate || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (
                val === "" ||
                (/^\d{0,3}$/.test(val) && parseInt(val) <= 100)
              ) {
                onFormChange({ ...formData, safetyComplianceRate: val });
              }
            }}
            className="mt-1 border-gray-200 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Enter a value between 0 and 100.
          </p>
        </div>

        {/* Details */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Details <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter detailed description of the HSE activity or incident"
            value={formData.details}
            onChange={(e) =>
              onFormChange({ ...formData, details: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm w-full p-2 border rounded-md min-h-[80px] resize-none"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Recommendations/Actions
          </label>
          <textarea
            placeholder="Enter recommendations or corrective actions"
            value={formData.recommendations}
            onChange={(e) =>
              onFormChange({ ...formData, recommendations: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm w-full p-2 border rounded-md min-h-[80px] resize-none"
          />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          style={{ backgroundColor: "#00a63e" }}
          className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
        >
          {isEditing ? "Save Changes" : "Save Record"}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ============== VIEW FULL DETAILS MODAL ==============
export const ViewDetailsModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activity: HSEActivity | null;
}> = ({ isOpen, onOpenChange, activity }) => {
  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">
                {activity.type}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {activity.organization} • {activity.date}
              </p>
            </div>
            <Badge
              className={`${getActivityStatusColor(
                activity.status
              )} font-medium text-xs`}
            >
              {activity.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Details:
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {activity.details}
            </p>
          </div>

          {activity.recommendations && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Recommendations/Actions:
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {activity.recommendations}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Record Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Organization</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.organization}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activity.date}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============== HSE RECORDS TABLE ==============
export const HSERecordsTable: React.FC<{
  records: HSERecord[];
  onViewDetails: (record: HSERecord) => void;
}> = ({ records, onViewDetails }) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const canReview = userRole === "regional_manager";
  const canApprove = userRole && ["admin", "manager"].includes(userRole);

  const handleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map(r => r.id)));
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleBulkReview = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk review HSE records
      // const response = await fetch('/api/hse/bulk-review', {
      //   method: 'POST',
      //   body: JSON.stringify({ recordIds: Array.from(selectedRecords) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedRecords.size} record(s) marked as reviewed`);
      setSelectedRecords(new Set());
    } catch (error) {
      toast.error("Failed to review records");
      console.error("Bulk review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to bulk approve HSE records
      // const response = await fetch('/api/hse/bulk-approve', {
      //   method: 'POST',
      //   body: JSON.stringify({ recordIds: Array.from(selectedRecords) })
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`${selectedRecords.size} record(s) approved successfully`);
      setSelectedRecords(new Set());
    } catch (error) {
      toast.error("Failed to approve records");
      console.error("Bulk approve error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No HSE records found</p>
      </div>
    );
  }

  // Helper to get compliance rate badge color
  const getComplianceBadge = (rate: number): string => {
    if (rate >= 80) return "bg-green-100 text-green-700";
    if (rate >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {(canReview || canApprove) && selectedRecords.size > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedRecords.size} record(s) selected
          </span>
          <div className="flex gap-2">
            {canReview && (
              <Button
                onClick={handleBulkReview}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Mark as Reviewed"}
              </Button>
            )}
            {canApprove && (
              <Button
                onClick={handleBulkApprove}
                disabled={isSubmitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Approve Selected"}
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {(canReview || canApprove) && (
                <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === records.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    aria-label="Select all records"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Record Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Employer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Date Logged
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Safety Compliance (%)
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {(canReview || canApprove) && (
                  <td className="px-2 py-1.5 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={() => handleSelectRecord(record.id)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label={`Select record for ${record.employer}`}
                    />
                  </td>
                )}
                <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {record.recordType}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {record.employer}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {new Date(record.dateLogged).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                  <Badge
                    className={`${getComplianceBadge(
                      record.safetyComplianceRate
                    )} font-semibold`}
                  >
                    {record.safetyComplianceRate}%
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                  <Badge
                    className={`${getHSEStatusColor(
                      record.status
                    )} font-medium`}
                  >
                    {record.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => onViewDetails(record)}
                    title={`View details for ${record.employer}`}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900 inline-flex items-center justify-center"
                    aria-label={`View details for ${record.employer}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
