import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, AlertCircle } from "lucide-react";
import type { ComplianceEntry } from "@/lib/types";

export const AddRegionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (data: { region: string; branch: string; target: number; period: string; }) => void;
  regions: string[];
  onAddRegion: (name: string) => void;
  onDeleteRegion: (name: string) => void;
}> = ({ isOpen, onClose, onAddEntry, regions, onAddRegion, onDeleteRegion }) => {
  const [formData, setFormData] = useState({ region: "", branch: "", target: 0, period: "" });
  const [newRegionName, setNewRegionName] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleClose = () => {
    setFormData({ region: "", branch: "", target: 0, period: "" });
    setNewRegionName("");
    setFormErrors([]);
    onClose();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const errors: string[] = [];
    if (!formData.region.trim()) errors.push("Region is required");
    if (!formData.target || formData.target <= 0) errors.push("Target must be greater than 0");

    setFormErrors(errors);
    if (errors.length === 0) {
      onAddEntry(formData);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Region</h2>
              <p className="text-sm text-gray-600">Add a new region target</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {formErrors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Manage Regions</h3>
              <p className="text-sm text-gray-600 mb-3">Add new regions or remove unused ones.</p>

              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="New region name" value={newRegionName} onChange={(e) => setNewRegionName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" aria-label="plus" onClick={() => { if (newRegionName.trim()) { onAddRegion(newRegionName.trim()); setNewRegionName(""); }}} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <div key={region} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <span className="text-sm font-medium">{region}</span>
                    <button type="button" onClick={() => onDeleteRegion(region)} className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" aria-label={`Delete ${region}`}>
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Region Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region <span className="text-red-500">*</span>
                    <select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                      <option value="">Select region</option>
                      {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target (₦) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={formData.target || ""} onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="20000000" required />
                </div>
              </div>
            </div>
          </form>

          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button type="button" onClick={handleClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">Cancel</button>
            <button type="button" onClick={handleSubmit} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">Save Entry</button>
          </div>
        </div>
      </div>
    </>
  );
};
