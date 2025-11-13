"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HSEActivity, HSEFormData, HSERecordDetail } from "@/lib/types/hse";
import { getActivityStatusColor } from "@/lib/utils";

// ================= HSE FORM MODAL =================
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
          <select
            value={formData.type}
            onChange={(e) => onFormChange({ ...formData, type: e.target.value })}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          >
            <option value="">Select a type</option>
            <option value="letter issued">Letter Issued</option>
            <option value="inspection">Inspection</option>
            <option value="incident report">Incident Report</option>
            <option value="compliance notice">Compliance Notice</option>
          </select>
        </div>

        {/* Organization */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Employer/Organization <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Enter employer name"
            value={formData.organization}
            onChange={(e) => onFormChange({ ...formData, organization: e.target.value })}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onFormChange({ ...formData, date: e.target.value })}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => onFormChange({ ...formData, status: e.target.value })}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          >
            <option value="">Select status</option>
            <option value="Completed">Completed</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Follow-up Required">Follow-up Required</option>
          </select>
        </div>

        {/* Safety Compliance Rate */}
        <div>
          <label className="text-xs font-semibold text-gray-900">Safety Compliance Rate (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 95"
            value={formData.safetyComplianceRate || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (/^\d{0,3}$/.test(val) && parseInt(val) <= 100)) {
                onFormChange({ ...formData, safetyComplianceRate: val });
              }
            }}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Optional. Enter a value between 0 and 100.</p>
        </div>

        {/* Details */}
        <div>
          <label className="text-xs font-semibold text-gray-900">
            Details <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter detailed description of the HSE activity or incident"
            value={formData.details}
            onChange={(e) => onFormChange({ ...formData, details: e.target.value })}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2 min-h-[80px] resize-none"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="text-xs font-semibold text-gray-900">Recommendations/Actions</label>
          <textarea
            placeholder="Enter recommendations or corrective actions"
            value={formData.recommendations}
            onChange={(e) => onFormChange({ ...formData, recommendations: e.target.value })}
            className="mt-1 w-full border-gray-200 text-sm rounded-md p-2 min-h-[80px] resize-none"
          />
        </div>
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 text-sm text-white rounded-md"
          style={{ backgroundColor: "#00a63e" }}
        >
          {isEditing ? "Save Changes" : "Save Record"}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ================= VIEW FULL DETAILS MODAL =================
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
              <DialogTitle className="text-xl font-bold">{activity.type}</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{activity.organization} • {activity.date}</p>
            </div>
            <Badge className={`${getActivityStatusColor(activity.status)} font-medium text-xs`}>
              {activity.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {activity.details && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Details:</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{activity.details}</p>
            </div>
          )}
          {activity.recommendations && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommendations/Actions:</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{activity.recommendations}</p>
            </div>
          )}
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

// ================= TABLE DETAIL MODAL =================
export const HSETableDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  record: HSERecordDetail | null;
}> = ({ isOpen, onClose, record }) => {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">HSE Record Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Region</p>
              <p className="text-sm font-medium text-gray-900">{record.location.region}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Branch</p>
              <p className="text-sm font-medium text-gray-900">{record.location.branch}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Period</p>
              <p className="text-sm font-medium text-gray-900">{record.location.period}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Total Activities</p>
              <p className="text-sm font-medium text-gray-900">{record.activityBreakdown.totalActivities}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Performance Rate</p>
              <p className="text-sm font-medium text-gray-900">{record.performanceMetrics.performanceRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Achievement Rate</p>
              <p className="text-sm font-medium text-gray-900">{record.performanceMetrics.achievementRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">OSH Enlightenment</p>
              <p className="text-sm font-medium text-gray-900">{record.activityBreakdown.oshEnlightenment} ({record.activityBreakdown.oshEnlightenmentPct}%)</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">OSH Audits</p>
              <p className="text-sm font-medium text-gray-900">{record.activityBreakdown.oshAudit} ({record.activityBreakdown.oshAuditPct}%)</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Accident Investigations</p>
              <p className="text-sm font-medium text-gray-900">{record.activityBreakdown.accidentInvestigation} ({record.activityBreakdown.accidentInvestigationPct}%)</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
