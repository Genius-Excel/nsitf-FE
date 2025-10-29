"use client";
import React from "react";
import { Eye, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HSEActivity, HSEFormData, StatCard } from "@/lib/types";
import { getActivityStatusColor } from "@/lib/utils";
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

export const StatisticsCards: React.FC<{ stats: StatCard[] }> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"></div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            </div>
            <div style={{ color: stat.bgColor }} className="text-2xl">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">No activities found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent HSE Activities
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === activity.id ? null : activity.id)
              }
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1 text-xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-600 mt-1">
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
  <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
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
            value={formData.type}
            onValueChange={(value) =>
              onFormChange({ ...formData, type: value })
            }
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letter issued">Letter Issued</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="incident report">Incident Report</SelectItem>
              <SelectItem value="compliance notice">Compliance Notice</SelectItem>
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
            value={formData.organization}
            onChange={(e) =>
              onFormChange({ ...formData, organization: e.target.value })
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
            value={formData.date}
            onChange={(e) =>
              onFormChange({ ...formData, date: e.target.value })
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
