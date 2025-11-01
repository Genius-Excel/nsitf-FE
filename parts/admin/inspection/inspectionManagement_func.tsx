"use client";
import { PermissionGuard } from "@/components/permission-guard";
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ScheduleInspectionModal from "@/components/shedule-inspection";
import ViewAllInspectionsModal from "@/components/view-all-inspection";
import {
  InspectionStatisticsCards,
  InspectionBarChart,
  UpcomingInspectionCard,
  SearchAndFilters,
  InspectionsTable,
} from "./inspectionDesign";
import { InspectionDetailModal } from "./inspectionModal";
import { InspectionRecord, InspectionStatCard, UpcomingInspection, MonthlyChartData } from "@/lib/types";

// ============= MOCK DATA =============
const mockInspectionRecords: InspectionRecord[] = [
  {
    id: "1",
    branch: "Lagos - Ikeja",
    inspectionsConducted: 156,
    debtEstablished: 45000000,
    debtRecovered: 38250000,
    performanceRate: 85,
    demandNotice: 42,
    period: "Q3 2024",
  },
  {
    id: "2",
    branch: "Abuja - Wuse",
    inspectionsConducted: 134,
    debtEstablished: 38000000,
    debtRecovered: 30400000,
    performanceRate: 80,
    demandNotice: 38,
    period: "Q3 2024",
  },
  {
    id: "3",
    branch: "Port Harcourt - GRA",
    inspectionsConducted: 98,
    debtEstablished: 28000000,
    debtRecovered: 18200000,
    performanceRate: 65,
    demandNotice: 29,
    period: "Q3 2024",
  },
  {
    id: "4",
    branch: "Kano - Industrial",
    inspectionsConducted: 87,
    debtEstablished: 22000000,
    debtRecovered: 13200000,
    performanceRate: 60,
    demandNotice: 25,
    period: "Q3 2024",
  },
  {
    id: "5",
    branch: "Ibadan - Bodija",
    inspectionsConducted: 63,
    debtEstablished: 15000000,
    debtRecovered: 7500000,
    performanceRate: 50,
    demandNotice: 18,
    period: "Q3 2024",
  },
];

const chartData: MonthlyChartData[] = [
  { month: "Jan", debtsEstablished: 45, debtsRecovered: 42 },
  { month: "Feb", debtsEstablished: 48, debtsRecovered: 44 },
  { month: "Mar", debtsEstablished: 43, debtsRecovered: 46 },
  { month: "Apr", debtsEstablished: 60, debtsRecovered: 50 },
  { month: "May", debtsEstablished: 55, debtsRecovered: 48 },
  { month: "Jun", debtsEstablished: 57, debtsRecovered: 46 },
  { month: "Jul", debtsEstablished: 62, debtsRecovered: 59 },
  { month: "Aug", debtsEstablished: 55, debtsRecovered: 52 },
  { month: "Sep", debtsEstablished: 60, debtsRecovered: 53 },
];

const upcomingInspections: UpcomingInspection[] = [
  {
    id: 1,
    employer: "Delta Manufacturing Ltd",
    location: "Lagos, Ikeja",
    date: "2025-10-05",
    inspector: "Ibrahim Musa",
    status: "Scheduled",
  },
  {
    id: 2,
    employer: "Sunrise Textiles",
    location: "Kano, Industrial Area",
    date: "2025-10-08",
    inspector: "Chioma Okonkwo",
    status: "Scheduled",
  },
  {
    id: 3,
    employer: "Tech Park Solutions",
    location: "Abuja, Wuse",
    date: "2025-10-10",
    inspector: "Adewale Johnson",
    status: "Pending",
  },
  {
    id: 4,
    employer: "Coastal Logistics",
    location: "Port Harcourt, GRA",
    date: "2025-10-12",
    inspector: "Ngozi Eze",
    status: "Scheduled",
  },
];

const InspectionManagement = () => {
  // ============= STATE =============
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInspection, setSelectedInspection] = useState<InspectionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ============= FILTERED DATA =============
  const filteredInspections = useMemo(() => {
    if (!searchTerm) return mockInspectionRecords;

    const lowerSearch = searchTerm.toLowerCase();
    return mockInspectionRecords.filter(
      (inspection) =>
        inspection.branch.toLowerCase().includes(lowerSearch) ||
        inspection.period.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm]);

  // ============= STATISTICS =============
  const statistics = useMemo(() => {
    const totalInspections = mockInspectionRecords.reduce(
      (sum, record) => sum + record.inspectionsConducted,
      0
    );
    const totalDebtEstablished = mockInspectionRecords.reduce(
      (sum, record) => sum + record.debtEstablished,
      0
    );
    const totalDebtRecovered = mockInspectionRecords.reduce(
      (sum, record) => sum + record.debtRecovered,
      0
    );
    const totalDemandNotice = mockInspectionRecords.reduce(
      (sum, record) => sum + record.demandNotice,
      0
    );
    const avgPerformanceRate = (
      mockInspectionRecords.reduce((sum, record) => sum + record.performanceRate, 0) /
      mockInspectionRecords.length
    ).toFixed(1);

    return {
      totalInspections,
      totalDebtEstablished,
      totalDebtRecovered,
      totalDemandNotice,
      avgPerformanceRate,
    };
  }, []);

  // ============= STATS CARDS =============
  const stats: InspectionStatCard[] = useMemo(
    () => [
      {
        title: "Total Inspections",
        value: statistics.totalInspections,
        bgColor: "#3b82f6",
      },
      {
        title: "Demand Notice",
        value: statistics.totalDemandNotice,
        bgColor: "#22c55e",
      },
      {
        title: "Total Debt Established",
        value: `₦${(statistics.totalDebtEstablished / 1000000).toFixed(1)}M`,
        bgColor: "#f59e0b",
      },
      {
        title: "Debt Recovered",
        value: `₦${(statistics.totalDebtRecovered / 1000000).toFixed(1)}M`,
        bgColor: "#22c55e",
      },
      {
        title: "Performance Rate",
        value: `${statistics.avgPerformanceRate}%`,
        bgColor: "#3b82f6",
      },
    ],
    [statistics]
  );

  // ============= HANDLERS =============
  const handleViewInspection = useCallback((inspection: InspectionRecord) => {
    setSelectedInspection(inspection);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedInspection(null);
  }, []);

  const handleFilterClick = useCallback(() => {
    console.log("Filter clicked");
    // TODO: Implement filter functionality
  }, []);

  const handleExport = useCallback(() => {
    // Create CSV content
    const headers = [
      "Branch",
      "Inspections Conducted",
      "Debt Established (₦)",
      "Debt Recovered (₦)",
      "Performance Rate (%)",
      "Demand Notice",
      "Period",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredInspections.map((inspection) =>
        [
          `"${inspection.branch}"`,
          inspection.inspectionsConducted,
          inspection.debtEstablished,
          inspection.debtRecovered,
          inspection.performanceRate,
          inspection.demandNotice,
          inspection.period,
        ].join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inspection-records-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredInspections]);

  // ============= RENDER =============
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Inspection Management</h1>
          <p className="text-muted-foreground">
            Track and manage employer inspections, letters and debt recovery.
          </p>
        </div>
        <PermissionGuard permission="manage_compliance" fallback={null}>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Schedule Inspection
          </button>
        </PermissionGuard>
      </div>

      {/* Statistics Cards */}
      <InspectionStatisticsCards stats={stats} />

      {/* Bar Chart */}
      <InspectionBarChart data={chartData} />


      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={handleFilterClick}
        onExport={handleExport}
      />

      {/* Inspections Table */}
      <InspectionsTable
        inspections={filteredInspections}
        onView={handleViewInspection}
      />

      {/* Modals */}
      <ScheduleInspectionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <ViewAllInspectionsModal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        inspections={upcomingInspections}
      />

      <InspectionDetailModal
        inspection={selectedInspection}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      {/* Upcoming Inspections Card */}
      <Card>
        <CardHeader className="flex justify-between items-center flex-row">
          <h2 className="text-xl font-semibold">Upcoming Inspections</h2>
          <Button variant="outline" onClick={() => setIsViewAllModalOpen(true)}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingInspections.slice(0, 4).map((inspection) => (
            <UpcomingInspectionCard
              key={inspection.id}
              companyName={inspection.employer}
              date={inspection.date}
              inspectorName={inspection.inspector}
              location={inspection.location}
              status={inspection.status}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
  
};

export default InspectionManagement;