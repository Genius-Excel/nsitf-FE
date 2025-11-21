import React from "react";
import { X, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CircleCheck } from "lucide-react";
import type { UpcomingInspection } from "@/lib/types/inspection";

interface ViewAllInspectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspections: UpcomingInspection[];
}

export default function ViewAllInspectionsModal({
  isOpen,
  onClose,
  inspections,
}: ViewAllInspectionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              All Upcoming Inspections
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete list of scheduled inspections
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="close modal"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="flex justify-between items-center border py-3 px-4 rounded-md hover:bg-gray-50"
            >
              <div className="flex gap-4 items-center flex-1">
                <div className="bg-blue-100 rounded-sm p-2">
                  <CircleCheck className="text-blue-600 h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {inspection.employer}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {inspection.location}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-600">{inspection.date}</p>
                <p className="text-gray-500 text-xs flex items-center gap-1 justify-end mt-1">
                  <User className="w-3 h-3" />
                  {inspection.inspector}
                </p>
              </div>
              <Badge
                className={
                  inspection.status === "Scheduled"
                    ? "bg-green-100 text-green-700 font-medium text-sm ml-4"
                    : "bg-yellow-100 text-yellow-700 font-medium text-sm ml-4"
                }
              >
                {inspection.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
