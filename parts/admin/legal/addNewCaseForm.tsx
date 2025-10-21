import React, { useState } from "react";
import { X, Upload, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddNewCaseFormProps {
  onClose: () => void;
  onSubmit: (data: NewCaseData) => void;
}

interface NewCaseData {
  caseId: string;
  caseTitle: string;
  defendantCompany: string;
  defendantContact: string;
  defendantEmail: string;
  defendantPhone: string;
  caseType: string;
  amountClaimed: string;
  caseDescription: string;
  dateCreated: string;
  dateFiled: string;
  courtName: string;
  courtLocation: string;
  assignedLawyer: string;
  nextHearingDate: string;
  status: "pending" | "closed" | "assigned-obtained";
  attachments: File[];
}

const AddNewCaseForm: React.FC<AddNewCaseFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<NewCaseData>({
    caseId: `LEG-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    caseTitle: "",
    defendantCompany: "",
    defendantContact: "",
    defendantEmail: "",
    defendantPhone: "",
    caseType: "",
    amountClaimed: "",
    caseDescription: "",
    dateCreated: new Date().toISOString().split("T")[0],
    dateFiled: "",
    courtName: "",
    courtLocation: "",
    assignedLawyer: "",
    nextHearingDate: "",
    status: "pending",
    attachments: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof NewCaseData, string>>
  >({});

  const caseTypes = [
    "Breach of Contract",
    "Labor Dispute",
    "Intellectual Property",
    "Payment Dispute",
    "Contract Cancellation",
    "Compensation Dispute",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof NewCaseData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files)],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewCaseData, string>> = {};

    if (!formData.caseTitle) newErrors.caseTitle = "Case title is required";
    if (!formData.defendantCompany)
      newErrors.defendantCompany = "Defendant company is required";
    if (!formData.caseType) newErrors.caseType = "Case type is required";
    if (!formData.amountClaimed)
      newErrors.amountClaimed = "Amount claimed is required";
    if (!formData.caseDescription)
      newErrors.caseDescription = "Case description is required";
    if (!formData.courtName) newErrors.courtName = "Court name is required";

    if (
      formData.defendantEmail &&
      !/\S+@\S+\.\S+/.test(formData.defendantEmail)
    ) {
      newErrors.defendantEmail = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New Legal Case
          </h2>
          <Button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Case Information */}
            {/* (Your earlier sections remain unchanged; skipping for brevity) */}

            {/* Attachments Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
                Attachments
              </h3>

              <label
                htmlFor="case-file-upload"
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, or Image files (max 10MB each)
                </p>
                <input
                  type="file"
                  id="case-file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {formData.attachments.length > 0 && (
                <ul className="mt-4 divide-y divide-gray-200 border rounded-md">
                  {formData.attachments.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center px-3 py-2 text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip size={16} className="text-gray-400" />
                        <span className="truncate max-w-[220px] text-gray-700">
                          {file.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end items-center border-t border-gray-200 mt-6 pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Save Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewCaseForm;
