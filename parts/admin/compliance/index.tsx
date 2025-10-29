import React, { useState, useEffect } from "react";
import { X, Upload, Download, Filter, Search, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { ComplianceEntry } from "@/lib/types";
import { DUMMY_DATA, REGIONS, STORAGE_KEY } from "@/lib/utils";

const ComplianceDashboard: React.FC = () => {
  const [entries, setEntries] = useState<ComplianceEntry[]>(DUMMY_DATA);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    region: "",
    branch: "",
    contributionCollected: 0,
    target: 0,
    employersRegistered: 0,
    employees: 0,
    period: "",
  });

  // Load data from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save to storage whenever entries change
  useEffect(() => {
    if (entries.length > 0) {
      saveToStorage();
    }
  }, [entries]);

  const loadFromStorage = async () => {
    try {
      const result = await window.storage.get(STORAGE_KEY);
      if (result?.value) {
        setEntries(JSON.parse(result.value));
      }
    } catch (error) {
      console.log("No existing data found, using dummy data");
    }
  };

  const saveToStorage = async () => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    const totalActualContributions = entries.reduce(
      (sum, e) => sum + e.contributionCollected,
      0
    );
    const contributionsTarget = entries.reduce((sum, e) => sum + e.target, 0);
    const performanceRate =
      contributionsTarget > 0
        ? (totalActualContributions / contributionsTarget) * 100
        : 0;
    const totalEmployers = entries.reduce(
      (sum, e) => sum + e.employersRegistered,
      0
    );
    const totalEmployees = entries.reduce((sum, e) => sum + e.employees, 0);

    return {
      totalActualContributions,
      contributionsTarget,
      performanceRate,
      totalEmployers,
      totalEmployees,
    };
  };

  const metrics = calculateMetrics();

  const handleAddEntry = () => {
    if (!formData.region || !formData.target) {
      alert("Please fill all required fields");
      return;
    }

    const newEntry: ComplianceEntry = {
      id: Date.now().toString(),
      region: formData.region,
      branch: "",
      contributionCollected: 0,
      target: formData.target,
      achievement: 0,
      employersRegistered: 0,
      employees: 0,
      period: "",
    };

    setEntries([...entries, newEntry]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditEntry = () => {
    if (!selectedEntry) return;

    const achievement =
      selectedEntry.target > 0
        ? (formData.contributionCollected / selectedEntry.target) * 100
        : 0;

    const updatedEntries = entries.map((entry) =>
      entry.id === selectedEntry.id
        ? {
            ...entry,
            branch: formData.branch,
            contributionCollected: formData.contributionCollected,
            employersRegistered: formData.employersRegistered,
            employees: formData.employees,
            period: formData.period,
            achievement,
          }
        : entry
    );

    setEntries(updatedEntries);
    setIsEditModalOpen(false);
    setSelectedEntry(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      region: "",
      branch: "",
      contributionCollected: 0,
      target: 0,
      employersRegistered: 0,
      employees: 0,
      period: "",
    });
  };

  const openEditModal = (entry: ComplianceEntry) => {
    setSelectedEntry(entry);
    setFormData({
      region: entry.region,
      branch: entry.branch,
      contributionCollected: entry.contributionCollected,
      target: entry.target,
      employersRegistered: entry.employersRegistered,
      employees: entry.employees,
      period: entry.period,
    });
    setIsEditModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const data = await file.arrayBuffer();
      setUploadProgress(30);

      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setUploadProgress(60);

      // Validate data
      const newEntries: ComplianceEntry[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index: number) => {
        if (
          !row.Region ||
          !row.Branch ||
          !row["Contribution Collected"] ||
          !row.Target ||
          !row["Employers Registered"] ||
          !row.Employees ||
          !row.Period
        ) {
          errors.push(`Row ${index + 2}: Missing required fields`);
          return;
        }

        const achievement =
          row.Target > 0
            ? (row["Contribution Collected"] / row.Target) * 100
            : 0;

        newEntries.push({
          id: `${Date.now()}-${index}`,
          region: row.Region,
          branch: row.Branch,
          contributionCollected: Number(row["Contribution Collected"]),
          target: Number(row.Target),
          achievement,
          employersRegistered: Number(row["Employers Registered"]),
          employees: Number(row.Employees),
          period: row.Period,
        });
      });

      if (errors.length > 0) {
        setUploadError(`Upload failed:\n${errors.join("\n")}`);
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(90);
      setEntries([...entries, ...newEntries]);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setUploadError("Failed to process file. Please check the format.");
      setIsUploading(false);
      setUploadProgress(0);
    }

    e.target.value = "";
  };

  const handleExport = () => {
    const exportData = entries.map((e) => ({
      Region: e.region,
      Branch: e.branch,
      "Contribution Collected": e.contributionCollected,
      Target: e.target,
      Achievement: `${e.achievement.toFixed(1)}%`,
      "Employers Registered": e.employersRegistered,
      Employees: e.employees,
      Period: e.period,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");
    XLSX.writeFile(wb, "compliance_data.xlsx");
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Region: "Lagos",
        Branch: "Ikeja",
        "Contribution Collected": 15000000,
        Target: 20000000,
        "Employers Registered": 450,
        Employees: 5600,
        Period: "June 2025",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "compliance_template.xlsx");
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Compliance Management
          </h1>
          <p className="text-gray-600">
            Track contributions, targets, and employer registration
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              Total Actual Contributions
            </p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(metrics.totalActualContributions)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Contributions Target</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(metrics.contributionsTarget)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Performance Rate</p>
            <p className="text-2xl font-bold text-green-700">
              {metrics.performanceRate.toFixed(2)}%
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Employers</p>
            <p className="text-2xl font-bold text-blue-700">
              {metrics.totalEmployers.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-green-700">
              {metrics.totalEmployees.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 justify-end">
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <Upload size={18} />
            <span>Upload Excel/CSV</span>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload Excel or CSV file"
            />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            aria-label="Export data to Excel"
          >
            <Download size={18} />
            Export Data
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            aria-label="Add new entry"
          >
            <Plus size={18} />
            Add Entry
          </button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm whitespace-pre-line">
              {uploadError}
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <label htmlFor="search-input" className="sr-only">
              Search by region or branch
            </label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              id="search-input"
              type="text"
              placeholder="Search by region or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              aria-label="Search by region or branch"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            aria-label="Open filters"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Contribution Collected
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Achievement
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Employers Registered
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Employees
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Period
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => openEditModal(entry)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm">{entry.region}</td>
                  <td className="px-4 py-3 text-sm">{entry.branch}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(entry.contributionCollected)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(entry.target)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-medium ${
                        entry.achievement >= 80
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {entry.achievement.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {entry.employersRegistered.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {entry.employees.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{entry.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bulk Upload Instructions */}
        <div className="mt-6 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">
            Bulk Upload Instructions
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload compliance data in bulk using Excel or CSV format. Download
            the template to ensure correct formatting.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label="Download Excel template"
            >
              <Download size={18} />
              Download Template
            </button>
          </div>
        </div>

        {/* Add Entry Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add Compliance Data Entry</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="region-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Region
                  </label>
                  <select
                    id="region-select"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    aria-label="Select region"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="target-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Target (₦)
                  </label>
                  <input
                    id="target-input"
                    type="number"
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    aria-label="Enter target amount"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Entry Modal */}
        {isEditModalOpen && selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  Edit Compliance Data Entry
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-region"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Region
                  </label>
                  <input
                    id="edit-region"
                    type="text"
                    value={formData.region}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    aria-label="Region (read-only)"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-branch"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Branch
                  </label>
                  <input
                    id="edit-branch"
                    type="text"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    placeholder="Enter branch name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    aria-label="Enter branch name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-contribution"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contribution Collected (₦)
                  </label>
                  <input
                    id="edit-contribution"
                    type="number"
                    value={formData.contributionCollected}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contributionCollected: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    aria-label="Enter contribution collected"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-target"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Target (₦)
                  </label>
                  <input
                    id="edit-target"
                    type="number"
                    value={formData.target}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    aria-label="Target (read-only)"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-employers"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Employers Registered
                  </label>
                  <input
                    id="edit-employers"
                    type="number"
                    value={formData.employersRegistered}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employersRegistered: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                    aria-label="Enter number of employers registered"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-employees"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Employees
                  </label>
                  <input
                    id="edit-employees"
                    type="number"
                    value={formData.employees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employees: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                    aria-label="Enter number of employees"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="edit-period"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Month/Period
                  </label>
                  <input
                    id="edit-period"
                    type="text"
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                    placeholder="e.g., June 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    aria-label="Enter month or period"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditEntry}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboard;
