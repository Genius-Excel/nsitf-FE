"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Download, Plus, Upload, Search } from "lucide-react";
import * as XLSX from "xlsx";

import {
  ComplianceEntry,
  DashboardMetrics,
  FilterConfig,
  SortConfig,
  SortField,
  NotificationType,
  ComplianceDashboardApiResponse,
} from "@/lib/types/compliance";

import {
  sortEntries,
  filterEntries,
  calculateAchievement,
  generateId,
} from "@/lib/utils";
import HttpService from "@/services/httpServices";
import { routes } from "@/services/apiRoutes";
import DashboardCards from "./components/DashboardCards";

import {
  NotificationContainer,
  FilterPanel,
  ComplianceTable,
  AddRegionModal,
  ComplianceUploadModal,
} from "./complianceDesign";
import { ComplianceDetailModal } from "./complianceDetailModal";

const http = new HttpService();
const ZERO_METRICS: DashboardMetrics = {
  totalActualContributions: 0,
  contributionsTarget: 0,
  performanceRate: 0,
  totalEmployers: 0,
  totalEmployees: 0,
};

const ComplianceDashboard: React.FC = () => {

  // ============= STATE MANAGEMENT =============
  const [entries, setEntries] = useState<ComplianceEntry[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
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
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(null);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>(ZERO_METRICS);

  // Notifications
  
  const showNotification = useCallback((type: NotificationType["type"], message: string) => {
    const n: NotificationType = { type, message, id: generateId() };
    setNotifications((prev) => [...prev, n]);
  }, []);

  const closeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Fetch dashboard data
const loadData = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await http.getData("/api/dashboard/compliance"); // real backend
    const data: ComplianceDashboardApiResponse = response.data;

    // Metrics
    setMetrics({
      totalActualContributions: Number(data.metric_cards.total_contributions ?? 0),
      contributionsTarget: Number(data.metric_cards.total_target ?? 0),
      performanceRate: Number(data.metric_cards.performance_rate ?? 0),
      totalEmployers: Number(data.metric_cards.total_employers ?? 0),
      totalEmployees: Number(data.metric_cards.total_employees ?? 0),
    });

    // Map entries
    const apiEntries = (data.regional_summary ?? []).map((item) => ({
      id: item.region_id ?? generateId(),
      region: item.region ?? "",
      branch: item.branch ?? "",
      contributionCollected: Number(item.collected ?? 0),
      target: Number(item.target ?? 0),
      achievement:
        item.performance_rate != null
          ? Number(item.performance_rate)
          : Number(calculateAchievement(item.collected ?? 0, item.target ?? 0)),
      employersRegistered: Number(item.employers ?? 0),
      employees: Number(item.employees ?? 0),
      registrationFees: Number(item.registration_fees ?? 0),
      certificateFees: Number(item.certificate_fees ?? 0),
      period: item.period ?? (data.filters?.as_of ?? ""),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setEntries(apiEntries);

    // Regions (unique)
    const regionNames = Array.from(new Set(apiEntries.map((e) => e.region).filter(Boolean)));
    setRegions(regionNames);
  } catch (err) {
    console.error("Failed to load compliance dashboard:", err);
    showNotification("error", `Failed to load dashboard: ${err instanceof Error ? err.message : "Unknown error"}`);
    setEntries([]);
    setRegions([]);
    setMetrics(ZERO_METRICS);
  } finally {
    setIsLoading(false);
  }
}, [showNotification]);


  useEffect(() => { loadData(); }, [loadData]);

  // Sorting
  const handleSort = useCallback((field: SortField) => {
    setSortConfig((current) => {
      if (current?.field === field) {
        return { field, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  }, []);

  // Filtered & sorted
  const filteredAndSortedEntries = React.useMemo(() => {
    return sortEntries(filterEntries(entries, filterConfig, searchTerm), sortConfig);
  }, [entries, filterConfig, searchTerm, sortConfig]);

  // Region management
  const handleAddRegion = useCallback((name: string) => {
    if (regions.includes(name)) return showNotification("error", "Region already exists");
    setRegions((prev) => [...prev, name]);
    showNotification("success", `${name} added to regions`);
  }, [regions, showNotification]);

  const handleDeleteRegion = useCallback((name: string) => {
    if (entries.some((e) => e.region === name)) return showNotification("error", "Cannot delete - region is in use");
    if (window.confirm(`Delete region '${name}'? This cannot be undone.`)) {
      setRegions((prev) => prev.filter((r) => r !== name));
      showNotification("success", `${name} removed`);
    }
  }, [entries, showNotification]);

  // Entry management
  const handleAddEntry = useCallback((data: { region: string; branch: string; target: number; period: string }) => {
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
  }, [showNotification]);

  const handleUploadSuccess = useCallback((uploadedEntries: ComplianceEntry[]) => {
    setEntries((prev) => [...prev, ...uploadedEntries]);
    showNotification("success", `${uploadedEntries.length} entries uploaded successfully`);
  }, [showNotification]);

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
    showNotification("success", "Data exported successfully");
  }, [entries, showNotification]);

  const openDetailModal = useCallback((entry: ComplianceEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationContainer notifications={notifications} onClose={closeNotification} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Compliance View</h1>
          <p className="text-sm sm:text-base text-gray-600">Track contributions, targets, and employer registration</p>
        </header>

        <DashboardCards metrics={metrics} />

       {/* Action Bar */} <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"> {/* Search */} <div className="flex-1 relative"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} aria-hidden="true" /> <input id="global-search" type="text" placeholder="Search by region, branch, or period..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" aria-label="Search compliance entries" /> </div> {/* Action Buttons */} <div className="flex flex-wrap gap-2 sm:gap-3"> <button onClick={() => setIsUploadModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium" aria-label="Upload regional data" > <Upload size={18} aria-hidden="true" /> <span>Upload Regional Data</span> </button> <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium" aria-label="Export data to Excel" title="Keyboard shortcut: Ctrl+E" > <Download size={18} aria-hidden="true" /> <span>Export</span> </button> <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium" aria-label="Create new region" title="Keyboard shortcut: Ctrl+N" > <Plus size={18} aria-hidden="true" /> <span>Create Region</span> </button> </div> </div> {/* Filter Panel */} <FilterPanel filterConfig={filterConfig} onFilterChange={setFilterConfig} availableRegions={regions} totalEntries={entries.length} filteredCount={filteredAndSortedEntries.length} /> {/* Main Content */} <main id="main-content"> <ComplianceTable entries={filteredAndSortedEntries} onViewDetails={openDetailModal} sortConfig={sortConfig} onSort={handleSort} /> </main> {/* Bulk Upload Instructions */} <div className="mt-6 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200"> <h3 className="font-medium text-gray-900 mb-2"> Bulk Upload Instructions </h3> <p className="text-sm text-gray-600 mb-4"> Upload compliance data in bulk using Excel or CSV format. Click the Upload button above to get started and download a template for your selected region. </p> <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside"> <li>Select a region before uploading</li> <li>Download the region-specific template</li> <li>Fill in all required fields</li> <li>Upload the completed file for validation</li> </ul> </div> </div> {/* Modals */} <AddRegionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddEntry={handleAddEntry} regions={regions} onAddRegion={handleAddRegion} onDeleteRegion={handleDeleteRegion} /> <ComplianceUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} regions={regions} /> <ComplianceDetailModal entry={selectedEntry} isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedEntry(null); }} />

      </div>
    </div>
  );
};

export default ComplianceDashboard;
