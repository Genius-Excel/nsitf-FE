"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  Filter,
  Search,
  Plus,
  Trash2,
  FileText,
  Edit2,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

// Types
interface ComplianceEntry {
  id: string;
  region: string;
  branch: string;
  contributionCollected: number;
  target: number;
  achievement: number;
  employersRegistered: number;
  employees: number;
  certificateFees: number;
  period: string;
}

// Constants
const STORAGE_KEY = "compliance_entries";
const REGIONS = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu"];

const DUMMY_DATA: ComplianceEntry[] = [
  {
    id: "1",
    region: "Lagos",
    branch: "Ikeja",
    contributionCollected: 15000000,
    target: 20000000,
    achievement: 75,
    employersRegistered: 450,
    employees: 5600,
    certificateFees: 5000000,
    period: "June 2025",
  },
  {
    id: "2",
    region: "Abuja",
    branch: "Wuse",
    contributionCollected: 12000000,
    target: 15000000,
    achievement: 80,
    employersRegistered: 380,
    employees: 4200,
    certificateFees: 4200000,
    period: "June 2025",
  },
];

// Compliance Detail Modal Component
const ComplianceDetailModal: React.FC<{
  entry: ComplianceEntry | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ entry, isOpen, onClose }) => {
  if (!isOpen || !entry) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const shortfall = entry.target - entry.contributionCollected;
  const isTargetMet = entry.contributionCollected >= entry.target;

  const handleDownload = () => {
    const content = `
COMPLIANCE RECORD DETAILS
=========================
Region: ${entry.region}
Branch: ${entry.branch}
Period: ${entry.period}

CONTRIBUTION SUMMARY
====================
Target: ${formatCurrency(entry.target)}
Collected: ${formatCurrency(entry.contributionCollected)}
Achievement: ${entry.achievement.toFixed(1)}%

EMPLOYER DATA
=============
Employers: ${entry.employersRegistered.toLocaleString()}
Employees: ${entry.employees.toLocaleString()}
Certificate Fees: ${formatCurrency(entry.certificateFees)}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${entry.region.replace(
      /\s+/g,
      "-"
    )}-${entry.period.replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Compliance Record</h2>
                <p className="text-sm text-gray-600">
                  {entry.region} - {entry.branch} - {entry.period}
                </p>
              </div>
            </div>
            <button
              title="Close details"
              aria-label="Close details"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Target</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(entry.target)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Collected</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(entry.contributionCollected)}
                </p>
              </div>
              <div
                className={`${
                  isTargetMet ? "bg-green-50" : "bg-orange-50"
                } p-4 rounded-lg`}
              >
                <p className="text-xs text-gray-600 uppercase">Achievement</p>
                <p
                  className={`text-2xl font-bold ${
                    isTargetMet ? "text-green-700" : "text-orange-700"
                  }`}
                >
                  {entry.achievement.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Total Employers</p>
                <p className="text-2xl font-bold">
                  {entry.employersRegistered.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">Total Employees</p>
                <p className="text-2xl font-bold">
                  {entry.employees.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Dashboard Component
const ComplianceDashboard: React.FC = () => {
  const [entries, setEntries] = useState<ComplianceEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    region: "",
    branch: "",
    contributionCollected: 0,
    target: 0,
    employersRegistered: 0,
    employees: 0,
    certificateFees: 0,
    period: "",
  });

  const [regionsList, setRegionsList] = useState<string[]>(REGIONS);
  const [newRegionName, setNewRegionName] = useState("");

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

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  const loadFromStorage = async () => {
    try {
      const result = await window.storage.get(STORAGE_KEY);
      if (result?.value) {
        setEntries(JSON.parse(result.value));
      } else {
        // Load dummy data if no storage data exists
        setEntries(DUMMY_DATA);
      }
    } catch (error) {
      console.log("No existing data found, using dummy data");
      setEntries(DUMMY_DATA);
    }
  };

  const saveToStorage = async () => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save data:", error);
      showNotification("error", "Failed to save data");
    }
  };

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
    const totalCertificateFees = entries.reduce(
      (sum, e) => sum + e.certificateFees,
      0
    );

    return {
      totalActualContributions,
      contributionsTarget,
      performanceRate,
      totalEmployers,
      totalEmployees,
      totalCertificateFees,
    };
  };

  const metrics = calculateMetrics();

  const addRegion = () => {
    const name = newRegionName.trim();
    if (!name) {
      showNotification("error", "Enter a region name");
      return;
    }
    if (regionsList.includes(name)) {
      showNotification("error", "Region already exists");
      return;
    }
    setRegionsList((r) => [...r, name]);
    setNewRegionName("");
    showNotification("success", `${name} added to regions`);
  };

  const deleteRegion = (name: string) => {
    if (entries.some((e) => e.region === name)) {
      showNotification("error", "Cannot delete - region is in use");
      return;
    }

    if (window.confirm(`Delete region '${name}'? This cannot be undone.`)) {
      setRegionsList((r) => r.filter((x) => x !== name));
      if (formData.region === name) {
        setFormData({ ...formData, region: "" });
      }
      showNotification("success", `${name} removed`);
    }
  };

  const handleAddEntry = () => {
    if (!formData.region || !formData.target) {
      showNotification("error", "Please fill region and target fields");
      return;
    }

    const newEntry: ComplianceEntry = {
      id: Date.now().toString(),
      region: formData.region,
      branch: formData.branch,
      contributionCollected: 0,
      target: formData.target,
      achievement: 0,
      employersRegistered: 0,
      employees: 0,
      certificateFees: 0,
      period: formData.period,
    };

    setEntries([...entries, newEntry]);
    setIsAddModalOpen(false);
    resetForm();
    showNotification("success", "Region created successfully");
  };

  const handleEditEntry = () => {
    if (!selectedEntry) return;

    const achievement =
      formData.target > 0
        ? (formData.contributionCollected / formData.target) * 100
        : 0;

    const updatedEntries = entries.map((entry) =>
      entry.id === selectedEntry.id
        ? {
            ...entry,
            branch: formData.branch,
            contributionCollected: formData.contributionCollected,
            target: formData.target,
            employersRegistered: formData.employersRegistered,
            employees: formData.employees,
            period: formData.period,
            certificateFees: formData.certificateFees,
            achievement,
          }
        : entry
    );

    setEntries(updatedEntries);
    setIsEditModalOpen(false);
    setSelectedEntry(null);
    resetForm();
    showNotification("success", "Entry updated successfully");
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Delete this entry? This cannot be undone.")) {
      setEntries(entries.filter((e) => e.id !== id));
      showNotification("success", "Entry deleted successfully");
    }
  };

  const resetForm = () => {
    setFormData({
      region: "",
      branch: "",
      contributionCollected: 0,
      target: 0,
      employersRegistered: 0,
      employees: 0,
      certificateFees: 0,
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
      certificateFees: entry.certificateFees,
      period: entry.period,
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = (entry: ComplianceEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
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

      const newEntries: ComplianceEntry[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index: number) => {
        if (
          !row.Region ||
          !row.Branch ||
          row["Contribution Collected"] === undefined ||
          !row.Target ||
          row["Employers Registered"] === undefined ||
          row.Employees === undefined ||
          row.CertificateFees === undefined ||
          !row.Period
        ) {
          errors.push(`Row ${index + 2}: Missing required fields`);
          return;
        }

        const contributionCollected = Number(row["Contribution Collected"]);
        const target = Number(row.Target);
        const achievement =
          target > 0 ? (contributionCollected / target) * 100 : 0;

        newEntries.push({
          id: `${Date.now()}-${index}`,
          region: row.Region,
          branch: row.Branch,
          contributionCollected,
          target,
          achievement,
          employersRegistered: Number(row["Employers Registered"]),
          employees: Number(row.Employees),
          certificateFees: Number(row.CertificateFees),
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
        showNotification(
          "success",
          `${newEntries.length} entries uploaded successfully`
        );
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
      "Certificate Fees": e.certificateFees,
      Period: e.period,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");
    XLSX.writeFile(wb, "compliance_data.xlsx");
    showNotification("success", "Data exported successfully");
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
        CertificateFees: 5000000,
        Period: "June 2025",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "compliance_template.xlsx");
    showNotification("success", "Template downloaded");
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`w-5 h-5 ${
                  notification.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Contributions</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">
              {formatCurrency(metrics.totalActualContributions)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Target</p>
            <p className="text-xl md:text-2xl font-bold text-blue-700">
              {formatCurrency(metrics.contributionsTarget)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Performance</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">
              {metrics.performanceRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Employers</p>
            <p className="text-xl md:text-2xl font-bold text-blue-700">
              {metrics.totalEmployers.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Employees</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">
              {metrics.totalEmployees.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6 justify-end">
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <Upload size={18} />
            <span>Upload</span>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Create Region
          </button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
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

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by region, branch, or period..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Collected
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Achievement
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Employers
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Employees
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Cert. Fees
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{entry.region}</td>
                  <td className="px-4 py-3 text-sm">{entry.branch || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(entry.contributionCollected)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(entry.target)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-medium ${
                        entry.achievement >= 90
                          ? "text-green-600"
                          : entry.achievement >= 70
                          ? "text-yellow-600"
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
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(entry.certificateFees)}
                  </td>
                  <td className="px-4 py-3 text-sm">{entry.period}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailModal(entry)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View details"
                      >
                        <FileText size={16} className="text-blue-600" />
                      </button>
                      {/* <button
                        onClick={() => openEditModal(entry)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit entry"
                      >
                        <Edit2 size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete entry"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No entries found. Create a region to get started.
            </p>
          </div>
        )}

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
            >
              <Download size={18} />
              Download Template
            </button>
          </div>
        </div>

        {/* Add Entry Modal */}
        {isAddModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsAddModalOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold">Create Region</h2>
                    <p className="text-sm text-gray-600">
                      Add a new region target
                    </p>
                  </div>
                  <button
                    aria-label="cancel"
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Region Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Region *
                        </label>
                        <select
                          value={formData.region}
                          onChange={(e) =>
                            setFormData({ ...formData, region: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          aria-label="Select region"
                        >
                          <option value="">Select region</option>
                          {regionsList.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target (₦) *
                        </label>
                        <input
                          type="number"
                          value={formData.target}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              target: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="20000000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch
                        </label>
                        <input
                          type="text"
                          value={formData.branch}
                          onChange={(e) =>
                            setFormData({ ...formData, branch: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Period
                        </label>
                        <input
                          type="text"
                          value={formData.period}
                          onChange={(e) =>
                            setFormData({ ...formData, period: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., June 2025"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Manage Regions
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Add new regions or remove unused ones. Regions in use
                      cannot be deleted.
                    </p>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="New region name"
                        value={newRegionName}
                        onChange={(e) => setNewRegionName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        aria-label="add"
                        type="button"
                        onClick={addRegion}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {regionsList.map((r) => (
                        <div
                          key={r}
                          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm font-medium">{r}</span>
                          <button
                            type="button"
                            onClick={() => deleteRegion(r)}
                            title={`Delete ${r}`}
                            className="p-1 rounded-md hover:bg-gray-200"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Entry Modal */}
        {isEditModalOpen && selectedEntry && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsEditModalOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Edit Compliance Entry
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedEntry.region} — {selectedEntry.period}
                      </p>
                    </div>
                  </div>
                  <button
                    aria-label="cancle"
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region
                        <input
                          type="text"
                          value={formData.region}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) =>
                          setFormData({ ...formData, branch: e.target.value })
                        }
                        placeholder="Enter branch name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contribution Collected (₦)
                      </label>
                      <input
                        type="number"
                        value={formData.contributionCollected}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contributionCollected: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="15000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target (₦)
                      </label>
                      <input
                        type="number"
                        value={formData.target}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            target: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="20000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employers Registered
                      </label>
                      <input
                        type="number"
                        value={formData.employersRegistered}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employersRegistered: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="450"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employees
                      </label>
                      <input
                        type="number"
                        value={formData.employees}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employees: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="5600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Fees (₦)
                      </label>
                      <input
                        type="number"
                        value={formData.certificateFees}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            certificateFees: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="5000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Period
                      </label>
                      <input
                        type="text"
                        value={formData.period}
                        onChange={(e) =>
                          setFormData({ ...formData, period: e.target.value })
                        }
                        placeholder="e.g., June 2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Achievement rate will be automatically calculated based on
                      collected amount and target.
                    </p>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditEntry}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detail Modal */}
        <ComplianceDetailModal
          entry={selectedEntry}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedEntry(null);
          }}
        />
      </div>
    </div>
  );
};

export default ComplianceDashboard;
