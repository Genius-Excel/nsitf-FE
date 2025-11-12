"use client";
import React, { useState, useMemo, useCallback } from "react";
import { FileText, Activity, DollarSign, BarChart3 } from "lucide-react";
import {
  StatisticsCards,
  ClaimsProcessingChart,
  ClaimTypeCards,
  SearchAndFilters,
  ClaimsTable,
} from "./ClaimsDesign";
import { ClaimDetailModal } from "./ClaimModal";
import { Claim, StatCard } from "../../../lib/types";
import { chartData, mockClaims } from "@/lib/Constants";

export default function ClaimsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize filtered claims to avoid unnecessary recalculations
  const filteredClaims = useMemo(() => {
    if (!searchTerm) return mockClaims;

    const lowerSearch = searchTerm.toLowerCase();
    return mockClaims.filter(
      (claim) =>
        claim.claimId.toLowerCase().includes(lowerSearch) ||
        claim.employer.toLowerCase().includes(lowerSearch) ||
        claim.claimant.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm]);

  // Memoize statistics to avoid recalculation on every render
  const statistics = useMemo(() => {
    const totalClaims = mockClaims.length;
    const medicalRefunds = mockClaims.filter(
      (c) => c.type === "Medical Refund"
    ).length;
    const disabilityClaims = mockClaims.filter(
      (c) => c.type === "Disability"
    ).length;
    const deathClaims = mockClaims.filter(
      (c) => c.type === "Death Claim"
    ).length;
    const retireeBenefit = mockClaims.filter(
      (c) => c.type === "Loss of Productivity"
    ).length;

    // Mock calculation - replace with actual logic
    const lastMonthClaims = totalClaims > 0 ? totalClaims - 1 : 0;
    const changePercent =
      lastMonthClaims > 0
        ? (((totalClaims - lastMonthClaims) / lastMonthClaims) * 100).toFixed(1)
        : "0.0";

    const paidAmount = mockClaims
      .filter((c) => c.status === "Paid")
      .reduce((sum, c) => sum + c.amountPaid, 0);

    const pendingAmount = mockClaims
      .filter((c) => c.status === "Pending" || c.status === "Under Review")
      .reduce((sum, c) => sum + c.amountPaid, 0);

    return {
      totalClaims,
      medicalRefunds,
      disabilityClaims,
      deathClaims,
      retireeBenefit,
      changePercent,
      paidAmount,
      pendingAmount,
    };
  }, []);

  // Memoize stats cards configuration
  const stats: StatCard[] = useMemo(
    () => [
      {
        title: "Total Claims Paid",
        value: statistics.totalClaims,
        description: "",
        change: `${Number(statistics.changePercent) > 0 ? "+" : ""}${
          statistics.changePercent
        }% from last month`,
        icon: <FileText />,
        bgColor: "#00a63e",
      },
      {
        title: "Beneficiaries Rehabilitated",
        description: "",
        value: statistics.medicalRefunds,
        change: `${Number(statistics.changePercent) > 0 ? "+" : ""}${
          statistics.changePercent
        }% from last month`,
        icon: <Activity />,
        bgColor: "#00a63e",
      },
      {
        title: "NOK Beneficiaries",
        description: "",
        change: `${Number(statistics.changePercent) > 0 ? "+" : ""}${
          statistics.changePercent
        }% from last month`,
        value: statistics.disabilityClaims,
        icon: <DollarSign />,
        bgColor: "#3b82f6",
      },
      {
        title: "Disabilities Beneficiaries",
        description: "",
        value: statistics.deathClaims,
        change: `${Number(statistics.changePercent) > 0 ? "+" : ""}${
          statistics.changePercent
        }% from last month`,
        icon: <BarChart3 />,
        bgColor: "#a855f7",
      },
      {
        title: "Retiree Benefit Beneficiaries",
        description: "",
        value: statistics.retireeBenefit,
        change: `${Number(statistics.changePercent) > 0 ? "+" : ""}${
          statistics.changePercent
        }% from last month`,
        icon: <BarChart3 />,
        bgColor: "#f59e0b",
      },
    ],
    [statistics]
  );

  // Memoize claim type cards configuration
  const claimTypes = useMemo(
    () => [
      {
        type: "Medical Refunds",
        count: statistics.medicalRefunds,
        color: "bg-green-50 border-l-4 border-green-500",
      },
      {
        type: "Disability Claims",
        count: statistics.disabilityClaims,
        color: "bg-blue-50 border-l-4 border-blue-500",
      },
      {
        type: "Death Claims",
        count: statistics.deathClaims,
        color: "bg-purple-50 border-l-4 border-purple-500",
      },
      {
        type: "Retiree Benefit Beneficiaries",
        count: statistics.retireeBenefit,
        color: "bg-yellow-50 border-l-4 border-yellow-500",
      },
    ],
    [statistics]
  );

  // Handler for viewing claim details
  const handleViewClaim = useCallback((claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  }, []);

  // Handler for closing modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  }, []);

  // Handler for filter click
  const handleFilterClick = useCallback(() => {
    console.log("Filter clicked");
    // TODO: Implement filter functionality
  }, []);

  // Handler for export
  const handleExport = useCallback(() => {
    // Create CSV content
    const headers = [
      "Claim ID",
      "Employer",
      "Claimant",
      "Type",
      "Amount Requested",
      "Amount Paid",
      "Status",
      "Date Processed",
      "Date Paid",
      "Sector",
      "Class",
      "Payment Period",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredClaims.map((claim) =>
        [
          claim.claimId,
          `"${claim.employer}"`,
          `"${claim.claimant}"`,
          claim.type,
          claim.amountRequested,
          claim.amountPaid,
          claim.status,
          claim.dateProcessed,
          claim.datePaid || "",
          claim.sector || "",
          claim.class || "",
          claim.date || "",
        ].join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `claims-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredClaims]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Claims and Compensation View
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and process employee compensation claims
          </p>
        </header>

        {/* Statistics Cards */}
        <StatisticsCards stats={stats} />

        {/* Claims Processing Chart */}
        <ClaimsProcessingChart data={chartData} />

        {/* Claim Type Cards */}
        <ClaimTypeCards claimTypes={claimTypes} />

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterClick={handleFilterClick}
          onExport={handleExport}
        />

        {/* Claims Table */}
        <ClaimsTable claims={filteredClaims} onView={handleViewClaim} />

        {/* Claim Detail Modal */}
        <ClaimDetailModal
          claim={selectedClaim}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
