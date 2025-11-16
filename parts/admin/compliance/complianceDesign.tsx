// import React, { useMemo, useState } from "react";
// import { DashboardCards } from "@/parts/admin/compliance/components/dashboard/DashboardCards";
// import { FilterPanel } from "@/parts/admin/compliance/components/filters/FilterPanel";
// import { ComplianceTable } from "@/parts/admin/compliance/components/tables/ComplianceTable";
// import { AddRegionModal } from "@/parts/admin/compliance/components/modals/AddRegionModal";
// import { ComplianceUploadModal } from "@/parts/admin/compliance/components/modals/ComplianceUploadModal";
// import { NotificationContainer } from "@/parts/admin/compliance/components/notifications/NotificationContainer";
// import { useNotifications } from "@/hooks/compliance/useNotifications";
// import { useModalState } from "@/hooks/compliance/useModalState";
// import { useSort } from "@/hooks/compliance/useSort";
// import type { ComplianceEntry, DashboardMetrics, FilterConfig } from "@/lib/types";
// import { generateId } from "@/lib/utils";

// export default function CompliaanceDesign() {
//   // sample state - wire up to real data as needed
//   const [entries, setEntries] = useState<ComplianceEntry[]>([]);
//   const [regions, setRegions] = useState<string[]>(["Ikeja", "Eti-Osa", "Surulere"]);
//   const [metrics, setMetrics] = useState<DashboardMetrics>({
//     totalActualContributions: 12000000,
//     contributionsTarget: 20000000,
//     performanceRate: 60,
//     totalEmployers: 120,
//     totalEmployees: 4500,
//   });

//   const [filterConfig, setFilterConfig] = useState<FilterConfig>({
//     regions: [],
//     achievementMin: 0,
//     achievementMax: 100,
//     periodSearch: "",
//     branchSearch: "",
//   });

//   const { notifications, push, remove } = useNotifications();
//   const uploadModal = useModalState(false);
//   const addRegionModal = useModalState(false);
//   const { sortConfig, onSort } = useSort();

//   const filteredEntries = useMemo(() => {
//     return entries.filter((e) => {
//       if (filterConfig.regions.length && !filterConfig.regions.includes(e.region)) return false;
//       if (e.achievement < filterConfig.achievementMin || e.achievement > filterConfig.achievementMax) return false;
//       if (filterConfig.periodSearch && !e.period.toLowerCase().includes(filterConfig.periodSearch.toLowerCase())) return false;
//       if (filterConfig.branchSearch && !e.branch?.toLowerCase().includes(filterConfig.branchSearch.toLowerCase())) return false;
//       return true;
//     });
//   }, [entries, filterConfig]);

//   const handleAddEntry = (data: { region: string; branch: string; target: number; period: string }) => {
//     // simplistic addition: create a new entry with zeroed numeric fields
//     const newEntry: ComplianceEntry = {
//       id: generateId(),
//       region: data.region,
//       branch: data.branch,
//       contributionCollected: 0,
//       target: data.target,
//       achievement: 0,
//       employersRegistered: 0,
//       employees: 0,
//       registrationFees: 0,
//       certificateFees: 0,
//       period: data.period,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     setEntries((s) => [newEntry, ...s]);
//     push("success", "New region entry created.");
//   };

//   const handleUploadSuccess = (rows: ComplianceEntry[]) => {
//     setEntries((s) => [...rows, ...s]);
//     push("success", `Uploaded ${rows.length} rows.`);
//   };

//   const onAddRegion = (name: string) => {
//     setRegions((s) => (s.includes(name) ? s : [...s, name]));
//     push("success", `Region ${name} added.`);
//   };
//   const onDeleteRegion = (name: string) => {
//     setRegions((s) => s.filter((r) => r !== name));
//     push("info", `Region ${name} removed.`);
//   };

//   return (
//     <div className="p-4">
//       <NotificationContainer notifications={notifications} onClose={remove} />

//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
//         <div className="flex gap-2">
//           <button onClick={uploadModal.open} className="px-4 py-2 bg-green-600 text-white rounded">Upload</button>
//           <button onClick={addRegionModal.open} className="px-4 py-2 bg-white border rounded">Create Region</button>
//         </div>
//       </div>

//       <DashboardCards metrics={metrics} />

//       <FilterPanel filterConfig={filterConfig} onFilterChange={setFilterConfig} availableRegions={regions} totalEntries={entries.length} filteredCount={filteredEntries.length} />

//       <div className="mb-6">
//         <ComplianceTable entries={filteredEntries} onViewDetails={(e)=>push("info", `Viewing ${e.region} (${e.period})`)} sortConfig={sortConfig} onSort={onSort} />
//       </div>

//       <AddRegionModal isOpen={addRegionModal.isOpen} onClose={addRegionModal.close} onAddEntry={handleAddEntry} regions={regions} onAddRegion={onAddRegion} onDeleteRegion={onDeleteRegion} />

//       <ComplianceUploadModal isOpen={uploadModal.isOpen} onClose={uploadModal.close} onUploadSuccess={handleUploadSuccess} regions={regions} />
//     </div>
//   );
// }
