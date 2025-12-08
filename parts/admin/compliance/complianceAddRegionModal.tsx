"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import { useBranches } from "@/hooks/users";
import type { Region } from "@/hooks/compliance";

interface AddRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (data: {
    region: string;
    branch: string;
    target: number;
    period: string;
  }) => void;
  regions: Region[];
  regionNames: string[];
  onAddRegion: (name: string) => void;
  onDeleteRegion: (name: string) => void;
  onAddBranch: (name: string, regionId: string, code?: string) => void;
  onDeleteBranch: (branchId: string, branchName: string) => void;
}

export const AddRegionModal: React.FC<AddRegionModalProps> = ({
  isOpen,
  onClose,
  onAddEntry,
  regions,
  regionNames,
  onAddRegion,
  onDeleteRegion,
  onAddBranch,
  onDeleteBranch,
}) => {
  const [formData, setFormData] = useState({
    region: "",
    branch: "",
    target: 0,
    period: "",
  });

  const [newRegionName, setNewRegionName] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [selectedRegionForBranch, setSelectedRegionForBranch] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Fetch branches for the selected region
  const { data: branches, fetchBranches, clearBranches } = useBranches();

  const modalRef = useRef<HTMLDivElement>(null);
  const regionSelectRef = useRef<HTMLSelectElement>(null);

  // Fetch branches when region is selected for branch management
  useEffect(() => {
    if (selectedRegionForBranch) {
      fetchBranches(selectedRegionForBranch);
    } else {
      clearBranches();
    }
  }, [selectedRegionForBranch, fetchBranches, clearBranches]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      regionSelectRef.current?.focus();

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setFormData({
      region: "",
      branch: "",
      target: 0,
      period: "",
    });
    setNewRegionName("");
    setNewBranchName("");
    setNewBranchCode("");
    setSelectedRegionForBranch("");
    setFormErrors([]);
    onClose();
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.region.trim()) {
      errors.push("Region is required");
    }

    if (!formData.target || formData.target <= 0) {
      errors.push("Target must be greater than 0");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onAddEntry(formData);
      handleClose();
    }
  };

  const handleAddRegion = () => {
    const name = newRegionName.trim();
    if (!name) {
      return;
    }

    onAddRegion(name);
    setNewRegionName("");
  };

  const handleAddBranch = () => {
    const name = newBranchName.trim();
    if (!name || !selectedRegionForBranch) {
      return;
    }

    const code = newBranchCode.trim() || undefined;
    onAddBranch(name, selectedRegionForBranch, code);
    setNewBranchName("");
    setNewBranchCode("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-region-modal-title"
      >
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2
                id="add-region-modal-title"
                className="text-lg sm:text-xl font-bold text-gray-900"
              >
                Create Region
              </h2>
              <p className="text-sm text-gray-600">Add a new region target</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Validation Errors */}
            {formErrors.length > 0 && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-4"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">
                      Please fix the following errors:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Region Details */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Region Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="region-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Region{" "}
                    <span className="text-red-500" aria-label="required">
                      *
                    </span>
                  </label>
                  <select
                    id="region-select"
                    ref={regionSelectRef}
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    aria-required="true"
                    aria-describedby="region-help"
                  >
                    <option value="">Select region</option>
                    {regionNames.map((regionName) => (
                      <option key={regionName} value={regionName}>
                        {regionName}
                      </option>
                    ))}
                  </select>
                  <p id="region-help" className="sr-only">
                    Select the region for this entry
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="target-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Target (₦){" "}
                    <span className="text-red-500" aria-label="required">
                      *
                    </span>
                  </label>
                  <input
                    id="target-input"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.target || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="20000000"
                    required
                    aria-required="true"
                    aria-describedby="target-help"
                  />
                  <p id="target-help" className="text-xs text-gray-500 mt-1">
                    Enter the target amount in Naira
                  </p>
                </div>

                <div>
                  {/* <label
                    htmlFor="branch-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Branch
                  </label>
                  <input
                    id="branch-input"
                    type="text"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Optional"
                    aria-describedby="branch-help"
                  />
                  <p id="branch-help" className="sr-only">
                    Optional branch name
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="period-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Period
                  </label>
                  <input
                    id="period-input"
                    type="text"
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., June 2025"
                    aria-describedby="period-help"
                  />
                  <p id="period-help" className="text-xs text-gray-500 mt-1">
                    Reporting period (e.g., June 2025)
                  </p>*/}
                </div>
              </div>
            </div>

            {/* Manage Regions */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Manage Regions
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Add new regions or remove unused ones. Regions in use cannot be
                deleted.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="New region name"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRegion();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="New region name"
                />
                <button
                  type="button"
                  onClick={handleAddRegion}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  aria-label="Add new region"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label="Available regions"
              >
                {regionNames.map((regionName) => (
                  <div
                    key={regionName}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full"
                    role="listitem"
                  >
                    <span className="text-sm font-medium">{regionName}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteRegion(regionName)}
                      className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      aria-label={`Delete ${regionName} region`}
                      title={`Delete ${regionName}`}
                    >
                      <Trash2
                        className="w-4 h-4 text-gray-600"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Branches */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Manage Branches
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Create branches for a specific region. Select a region first, then add branches.
              </p>

              <div className="space-y-3">
                {/* Region Selector for Branches */}
                <div>
                  <label
                    htmlFor="branch-region-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Region
                  </label>
                  <select
                    id="branch-region-select"
                    value={selectedRegionForBranch}
                    onChange={(e) => setSelectedRegionForBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Name and Code Inputs */}
                {selectedRegionForBranch && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Branch name"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddBranch();
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        aria-label="New branch name"
                      />
                      <input
                        type="text"
                        placeholder="Branch code (optional)"
                        value={newBranchCode}
                        onChange={(e) => setNewBranchCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddBranch();
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        aria-label="New branch code"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      disabled={!newBranchName.trim()}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Add new branch"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        <span>Add Branch</span>
                      </div>
                    </button>

                    {/* Display Branches for Selected Region */}
                    {branches && branches.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Branches in {regions.find((r) => r.id === selectedRegionForBranch)?.name}:
                        </p>
                        <div
                          className="flex flex-wrap gap-2"
                          role="list"
                          aria-label="Available branches"
                        >
                          {branches.map((branch) => (
                            <div
                              key={branch.id}
                              className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full"
                              role="listitem"
                            >
                              <span className="text-sm font-medium">
                                {branch.name}
                                {branch.code && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({branch.code})
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => onDeleteBranch(branch.id, branch.name)}
                                className="p-1 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                aria-label={`Delete ${branch.name} branch`}
                                title={`Delete ${branch.name}`}
                              >
                                <Trash2
                                  className="w-4 h-4 text-gray-600"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
