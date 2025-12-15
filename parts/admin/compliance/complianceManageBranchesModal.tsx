"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useBranches } from "@/hooks/users";
import type { Region } from "@/hooks/compliance";

interface ManageBranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  regions: Region[];
  onAddBranch: (name: string, regionId: string, code?: string) => void;
  onDeleteBranch: (branchId: string, branchName: string) => void;
}

export const ManageBranchesModal: React.FC<ManageBranchesModalProps> = ({
  isOpen,
  onClose,
  regions,
  onAddBranch,
  onDeleteBranch,
}) => {
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [selectedRegionForBranch, setSelectedRegionForBranch] = useState("");

  // Fetch branches for the selected region
  const { data: branches, fetchBranches, clearBranches } = useBranches();

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
    setNewBranchName("");
    setNewBranchCode("");
    setSelectedRegionForBranch("");
    onClose();
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
        aria-labelledby="manage-branches-modal-title"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2
                id="manage-branches-modal-title"
                className="text-lg sm:text-xl font-bold text-gray-900"
              >
                Manage Branches
              </h2>
              <p className="text-sm text-gray-600">
                Create and manage branches for each region
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Manage Branches */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Branch Management
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="New branch code"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      disabled={!newBranchName.trim()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="p-1 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-4 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
