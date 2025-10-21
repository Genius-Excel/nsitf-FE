import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";

interface ScheduleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScheduleForm {
  employer: string;
  location: string;
  date: string;
  inspector: string;
  type: string;
}

export default function ScheduleInspectionModal({
  isOpen,
  onClose,
}: ScheduleInspectionModalProps) {
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    employer: "",
    location: "",
    date: "",
    inspector: "",
    type: "routine",
  });

  const handleScheduleInspection = () => {
    if (
      scheduleForm.employer &&
      scheduleForm.location &&
      scheduleForm.date &&
      scheduleForm.inspector
    ) {
      alert(
        `Inspection scheduled for ${scheduleForm.employer} on ${scheduleForm.date}`
      );
      setScheduleForm({
        employer: "",
        location: "",
        date: "",
        inspector: "",
        type: "routine",
      });
      onClose();
    } else {
      alert("Please fill in all required fields");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Schedule New Inspection
          </h2>
          <button
            onClick={onClose}
            aria-label="close modal"
            className="text-gray-400 hover:text-gray-600 ar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Name *
            </label>
            <input
              type="text"
              value={scheduleForm.employer}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, employer: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter employer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={scheduleForm.location}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="City, Area"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Date *
              <input
                type="date"
                value={scheduleForm.date}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspector *
              <select
                value={scheduleForm.inspector}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    inspector: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select inspector</option>
                <option value="Ibrahim Musa">Ibrahim Musa</option>
                <option value="Chioma Okonkwo">Chioma Okonkwo</option>
                <option value="Adewale Johnson">Adewale Johnson</option>
                <option value="Ngozi Eze">Ngozi Eze</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Type
              <select
                value={scheduleForm.type}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="routine">Routine Inspection</option>
                <option value="follow-up">Follow-up Inspection</option>
                <option value="complaint">Complaint Investigation</option>
                <option value="compliance">Compliance Check</option>
              </select>
            </label>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm"
          >
            Cancel
          </Button>
          <button
            onClick={handleScheduleInspection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Schedule Inspection
          </button>
        </DialogFooter>
      </div>
    </div>
  );
}
