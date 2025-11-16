"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Download, Plus, Upload, Search } from "lucide-react";
import * as XLSX from "xlsx";

// Types
import {
  ComplianceEntry,
  DashboardMetrics,
  FilterConfig,
  SortField,
} from "@/lib/types";

// Utils (keep your existing implementations of sortEntries & filterEntries)
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
import { DashboardCards } from "@/parts/admin/compliance/components/dashboard/DashboardCards";
import { FilterPanel } from "@/parts/admin/compliance/components/filters/FilterPanel";
import { ComplianceTable } from "@/parts/admin/compliance/components/tables/ComplianceTable";
import { AddRegionModal } from "@/parts/admin/compliance/components/modals/AddRegionModal";
import { ComplianceUploadModal } from "@/parts/admin/compliance/components/modals/ComplianceUploadModal";
import { NotificationContainer } from "@/parts/admin/compliance/components/notifications/NotificationContainer";

import { ComplianceDetailModal } from "./complianceDetailModal";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";

// Hooks
import { useNotifications } from "@/hooks/compliance/useNotifications";
import { useModalState } from "@/hooks/compliance/useModalState";
import { useSort } from "@/hooks/compliance/useSort";

import { useComplianceMetrics } from "@/hooks/compliance/useComplianceMetrics";

const ComplianceDashboard: React.FC = () => {
  // ============= STATE MANAGEMENT =============
  const [entries, setEntries] = useState<ComplianceEntry[]>([]);
  const [regions, setRegions] = useState<string[]>(DEFAULT_REGIONS);
  const [searchTerm, setSearchTerm] = useState("");

  const { sortConfig, onSort } = useSort(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    regions: [],
    achievementMin: 0,
    achievementMax: 100,
    periodSearch: "",
    branchSearch: "",
  });

  // Modals using shared hook
  const addModal = useModalState(false);
  const uploadModal = useModalState(false);
  const detailModal = useModalState(false);

  // selected entry for detail modal (still local)
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(
    null
  );

  // Notifications hook
  const { notifications, push, remove } = useNotifications();

  // Loading State for local persistence/data load
  const [isLoading, setIsLoading] = useState(true);

  // ============= REMOTE METRICS (API) =============
  // pass filterConfig.periodSearch to the hook (if you store "2025-11" or a compatible value there)
  const { data: apiData, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } =
    useComplianceMetrics(filterConfig.periodSearch);

  // mapped API pieces
  const apiMetrics = apiData?.metric_cards;
  const apiRegionSummary = apiData?.regional_summary ?? [];

  // ============= DATA LOADING (local entries & regions) =============
  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      void saveEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      void saveRegions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, isLoading]);

  const loadData = async () => {
    try {
      // Load entries
      const entriesResult = await storage.get(STORAGE_KEY);
      if (entriesResult?.value) {
        const loadedEntries = JSON.parse(entriesResult.value);

        // ============= DATA MIGRATION =============
        const migratedEntries = (loadedEntries as ComplianceEntry[]).map(
          (entry) => ({
            ...entry,
            registrationFees: entry.registrationFees ?? 0,
            achievement:
              entry.achievement ??
              calculateAchievement(entry.contributionCollected, entry.target),
            createdAt: entry.createdAt ?? new Date().toISOString(),
            updatedAt: entry.updatedAt ?? new Date().toISOString(),
          })
        );

        setEntries(migratedEntries);
      } else {
        setEntries(DUMMY_DATA);
      }

      // Load regions
      const regionsResult = await storage.get(REGIONS_KEY);
      if (regionsResult?.value) {
        setRegions(JSON.parse(regionsResult.value));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load data:", error);
      setEntries(DUMMY_DATA);
      push("error", "Failed to load data. Using sample data.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = async () => {
    try {
      await storage.set(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save entries:", error);
      push("error", "Failed to save data");
    }
  };

  const saveRegions = async () => {
    try {
      await storage.set(REGIONS_KEY, JSON.stringify(regions));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save regions:", error);
    }
  };

  // ============= METRICS CALCULATION =============
  // local fallback metrics (calculated from entries)
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

    return {
      totalActualContributions,
      contributionsTarget,
      performanceRate,
      totalEmployers,
      totalEmployees,
    };
  }, [entries]);

  const localMetrics = calculateMetrics();

  // Final metrics used for display: prefer API metrics when available
  const displayMetrics: DashboardMetrics = {
    totalActualContributions:
      apiMetrics?.total_contributions ?? localMetrics.totalActualContributions,
    contributionsTarget:
      apiMetrics?.total_target ?? localMetrics.contributionsTarget,
    performanceRate: apiMetrics?.performance_rate ?? localMetrics.performanceRate,
    totalEmployers: apiMetrics?.total_employers ?? localMetrics.totalEmployers,
    totalEmployees: apiMetrics?.total_employees ?? localMetrics.totalEmployees,
  };

  // ============= SORTING & FILTERING =============
  const handleSort = useCallback(
    (field: SortField) => {
      onSort(field);
    },
    [onSort]
  );

  const filteredAndSortedEntries = React.useMemo(() => {
    const filtered = filterEntries(entries, filterConfig, searchTerm);
    return sortEntries(filtered, sortConfig);
  }, [entries, filterConfig, searchTerm, sortConfig]);

  // ============= REGION MANAGEMENT =============
  const handleAddRegion = useCallback(
    (name: string) => {
      if (regions.includes(name)) {
        push("error", "Region already exists");
        return;
      }
      setRegions((prev) => [...prev, name]);
      push("success", `${name} added to regions`);
    },
    [regions, push]
  );

  const handleDeleteRegion = useCallback(
    (name: string) => {
      if (entries.some((e) => e.region === name)) {
        push("error", "Cannot delete - region is in use");
        return;
      }

      if (window.confirm(`Delete region '${name}'? This cannot be undone.`)) {
        setRegions((prev) => prev.filter((r) => r !== name));
        push("success", `${name} removed`);
      }
    },
    [entries, push]
  );

  // ============= ENTRY MANAGEMENT =============
  const handleAddEntry = useCallback(
    (data: { region: string; branch: string; target: number; period: string }) => {
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
      push("success", "Region created successfully");
    },
    [push]
  );

  const handleUploadSuccess = useCallback(
    (uploadedEntries: ComplianceEntry[]) => {
      setEntries((prev) => [...prev, ...uploadedEntries]);
      push("success", `${uploadedEntries.length} entries uploaded successfully`);
      uploadModal.close();
    },
    [push, uploadModal]
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
      "Registration Fees": e.registrationFees,
      "Certificate Fees": e.certificateFees,
      Period: e.period,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");
    XLSX.writeFile(wb, "compliance_data.xlsx");
    push("success", "Data exported successfully");
  }, [entries, push]);

  // ============= MODALS & DETAILS =============
  const openDetailModal = useCallback(
    (entry: ComplianceEntry) => {
      setSelectedEntry(entry);
      detailModal.open();
    },
    [detailModal]
  );

  // ============= KEYBOARD SHORTCUTS =============
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Add Region
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        addModal.open();
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
  }, [handleExport, addModal]);

  // ============= LOADING STATE =============
  if (isLoading) {
    return <LoadingState message="Loading compliance data..." />;
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
      <NotificationContainer notifications={notifications} onClose={remove} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <PageHeader
          title="Compliance View"
          description="Track contributions, targets, and employer registration"
        />

        {/* Dashboard Cards (prefer API metrics if available, else local) */}
        <DashboardCards metrics={displayMetrics} />

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
              onClick={() => uploadModal.open()}
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
              onClick={() => addModal.open()}
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
  entries={entries}
  onViewDetails={(entry: ComplianceEntry) => {
    setSelectedEntry(entry);
    detailModal.open();
  }}
  sortConfig={sortConfig}
  onSort={onSort}
/>

        </main>

        {/* Bulk Upload Instructions */}
        <div className="mt-6 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-2">Bulk Upload Instructions</h3>
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
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onAddEntry={handleAddEntry}
        regions={regions}
        onAddRegion={handleAddRegion}
        onDeleteRegion={handleDeleteRegion}
      />

      <ComplianceUploadModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.close}
        onUploadSuccess={handleUploadSuccess}
        regions={regions}
      />

      <ComplianceDetailModal
        entry={selectedEntry}
        isOpen={detailModal.isOpen}
        onClose={() => {
          detailModal.close();
          setSelectedEntry(null);
        }}
      />
    </div>
  );
};

export default ComplianceDashboard;
