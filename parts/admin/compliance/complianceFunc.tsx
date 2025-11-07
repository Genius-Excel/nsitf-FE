"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Download, Plus, Upload, Search } from "lucide-react";
import * as XLSX from "xlsx";

// Types
import {
  ComplianceEntry,
  DashboardMetrics,
  FilterConfig,
  SortConfig,
  SortField,
  Notification as NotificationType,
} from "@/lib/types";

// Utils
import {
  formatCurrency,
  sortEntries,
  filterEntries,
  calculateAchievement,
  generateId,
} from "@/lib/utils";

// Storage
import { storage } from "@/lib/storage";

// Constants
import {
  STORAGE_KEY,
  REGIONS_KEY,
  DEFAULT_REGIONS,
  DUMMY_DATA,
} from "@/lib/Constants";

// Components
import {
  NotificationContainer,
  DashboardCards,
  FilterPanel,
  ComplianceTable,
  AddRegionModal,
  ComplianceUploadModal,
} from "./complianceDesign";
import { ComplianceDetailModal } from "./complianceDetailModal";

const ComplianceDashboard: React.FC = () => {
  // ============= STATE MANAGEMENT =============
  const [entries, setEntries] = useState<ComplianceEntry[]>([]);
  const [regions, setRegions] = useState<string[]>(DEFAULT_REGIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    regions: [],
    achievementMin: 0,
    achievementMax: 100,
    periodSearch: "",
    branchSearch: "",
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(
    null
  );

  // Notifications
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // ============= DATA LOADING =============

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && entries.length > 0) {
      saveEntries();
    }
  }, [entries, isLoading]);

  useEffect(() => {
    if (!isLoading && regions.length > 0) {
      saveRegions();
    }
  }, [regions, isLoading]);

  const loadData = async () => {
    try {
      // Load entries
      const entriesResult = await storage.get(STORAGE_KEY);
      if (entriesResult?.value) {
        setEntries(JSON.parse(entriesResult.value));
      } else {
        setEntries(DUMMY_DATA);
      }

      // Load regions
      const regionsResult = await storage.get(REGIONS_KEY);
      if (regionsResult?.value) {
        setRegions(JSON.parse(regionsResult.value));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setEntries(DUMMY_DATA);
      showNotification("error", "Failed to load data. Using sample data.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = async () => {
    try {
      await storage.set(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save entries:", error);
      showNotification("error", "Failed to save data");
    }
  };

  const saveRegions = async () => {
    try {
      await storage.set(REGIONS_KEY, JSON.stringify(regions));
    } catch (error) {
      console.error("Failed to save regions:", error);
    }
  };

  // ============= NOTIFICATIONS =============

  const showNotification = useCallback(
    (type: NotificationType["type"], message: string) => {
      const notification: NotificationType = {
        type,
        message,
        id: generateId(),
      };
      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const closeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ============= METRICS CALCULATION =============

  const calculateMetrics = useCallback((): DashboardMetrics => {
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
      // totalCertificateFees,
    };
  }, [entries]);

  const metrics = calculateMetrics();

  // ============= SORTING & FILTERING =============

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((current) => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "asc" };
    });
  }, []);

  const filteredAndSortedEntries = React.useMemo(() => {
    const filtered = filterEntries(entries, filterConfig, searchTerm);
    return sortEntries(filtered, sortConfig);
  }, [entries, filterConfig, searchTerm, sortConfig]);

  // ============= REGION MANAGEMENT =============

  const handleAddRegion = useCallback(
    (name: string) => {
      if (regions.includes(name)) {
        showNotification("error", "Region already exists");
        return;
      }
      setRegions((prev) => [...prev, name]);
      showNotification("success", `${name} added to regions`);
    },
    [regions, showNotification]
  );

  const handleDeleteRegion = useCallback(
    (name: string) => {
      if (entries.some((e) => e.region === name)) {
        showNotification("error", "Cannot delete - region is in use");
        return;
      }

      if (window.confirm(`Delete region '${name}'? This cannot be undone.`)) {
        setRegions((prev) => prev.filter((r) => r !== name));
        showNotification("success", `${name} removed`);
      }
    },
    [entries, showNotification]
  );

  // ============= ENTRY MANAGEMENT =============

  const handleAddEntry = useCallback(
    (data: {
      region: string;
      branch: string;
      target: number;
      period: string;
    }) => {
      const newEntry: ComplianceEntry = {
        id: generateId(),
        region: data.region,
        branch: data.branch,
        contributionCollected: 0,
        target: data.target,
        achievement: 0,
        employersRegistered: 0,
        employees: 0,
        registrationFees: 0,
        certificateFees: 0,
        period: data.period,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEntries((prev) => [...prev, newEntry]);
      showNotification("success", "Region created successfully");
    },
    [showNotification]
  );

  const handleUploadSuccess = useCallback(
    (uploadedEntries: ComplianceEntry[]) => {
      setEntries((prev) => [...prev, ...uploadedEntries]);
      showNotification(
        "success",
        `${uploadedEntries.length} entries uploaded successfully`
      );
    },
    [showNotification]
  );

  // ============= EXPORT =============

  const handleExport = useCallback(() => {
    const exportData = entries.map((e) => ({
      Region: e.region,
      Branch: e.branch,
      "Contribution Collected": e.contributionCollected,
      Target: e.target,
      Achievement: `${e.achievement.toFixed(1)}%`,
      "Employers Registered": e.employersRegistered,
      Employees: e.employees,
      "Registeration Fees": e.registrationFees,
      "Certificate Fees": e.certificateFees,
      Period: e.period,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");
    XLSX.writeFile(wb, "compliance_data.xlsx");
    showNotification("success", "Data exported successfully");
  }, [entries, showNotification]);

  // ============= MODALS =============

  const openDetailModal = useCallback((entry: ComplianceEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  }, []);

  // ============= KEYBOARD SHORTCUTS =============

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Add Region
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setIsAddModalOpen(true);
      }

      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        handleExport();
      }

      // Ctrl/Cmd + F: Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleExport]);

  // ============= LOADING STATE =============

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  // ============= RENDER =============

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onClose={closeNotification}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Compliance Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track contributions, targets, and employer registration
          </p>
        </header>

        {/* Dashboard Cards */}
        <DashboardCards metrics={metrics} />

        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="text"
              placeholder="Search by region, branch, or period..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              aria-label="Search compliance entries"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
              aria-label="Upload regional data"
            >
              <Upload size={18} aria-hidden="true" />
              <span>Upload Regional Data</span>
            </button>
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
              aria-label="Export data to Excel"
              title="Keyboard shortcut: Ctrl+E"
            >
              <Download size={18} aria-hidden="true" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
              aria-label="Create new region"
              title="Keyboard shortcut: Ctrl+N"
            >
              <Plus size={18} aria-hidden="true" />
              <span>Create Region</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filterConfig={filterConfig}
          onFilterChange={setFilterConfig}
          availableRegions={regions}
          totalEntries={entries.length}
          filteredCount={filteredAndSortedEntries.length}
        />

        {/* Main Content */}
        <main id="main-content">
          <ComplianceTable
            entries={filteredAndSortedEntries}
            onViewDetails={openDetailModal}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </main>

        {/* Bulk Upload Instructions */}
        <div className="mt-6 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-2">
            Bulk Upload Instructions
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload compliance data in bulk using Excel or CSV format. Click the
            Upload button above to get started and download a template for your
            selected region.
          </p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Select a region before uploading</li>
            <li>Download the region-specific template</li>
            <li>Fill in all required fields</li>
            <li>Upload the completed file for validation</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <AddRegionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEntry={handleAddEntry}
        regions={regions}
        onAddRegion={handleAddRegion}
        onDeleteRegion={handleDeleteRegion}
      />

      <ComplianceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        regions={regions}
      />

      <ComplianceDetailModal
        entry={selectedEntry}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
};

export default ComplianceDashboard;