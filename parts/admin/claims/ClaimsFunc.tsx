"use client";
import React, { useState, useEffect } from "react";
import { FileText, Activity, DollarSign, BarChart3 } from "lucide-react";
import {
  StatisticsCards,
  ClaimsProcessingChart,
  ClaimTypeCards,
  SearchAndFilters,
  ClaimsTable,
} from "./ClaimsDesign";
import { Claim, StatCard, ChartDataPoint } from "../../../lib/types";
import { chartData, mockClaims } from "@/lib/Constants";

export default function ClaimsManagement() {
  // ============== STATE ==============
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ============== INITIALIZATION ==============
  useEffect(() => {
    console.log("mockClaims:", mockClaims);
    console.log("chartData:", chartData);
    setClaims(mockClaims);
    setFilteredClaims(mockClaims);
  }, []);

  // ============== EFFECTS ==============
  useEffect(() => {
    if (claims && claims.length > 0) {
      filterClaims();
    }
  }, [searchTerm, claims]);
  // ============== HANDLERS ==============
  const filterClaims = () => {
    // Add guard clause
    if (!claims || claims.length === 0) {
      setFilteredClaims([]);
      return;
    }

    if (!searchTerm) {
      setFilteredClaims(claims);
      return;
    }

    const filtered = claims.filter(
      (claim) =>
        claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimant.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredClaims(filtered);
  };
  const handleViewClaim = (claim: Claim) => {
    console.log("Viewing claim:", claim);
    // TODO: Implement view claim modal or navigate to detail page
  };

  // ============== CALCULATIONS ==============
  //   const totalClaims = claims.length;
  //   const medicalRefunds = claims.filter(
  //     (c) => c.type === "Medical Refund"
  //   ).length;
  //   const disabilityClaims = claims.filter((c) => c.type === "Disability").length;
  //   const deathClaims = claims.filter((c) => c.type === "Death Claim").length;
  //   const lossOfProductivity = claims.filter(
  //     (c) => c.type === "Loss of Productivity"
  //   ).length;

  //   const lastMonthClaims = claims.length - 1; // Mock calculation
  //   const changePercent = (
  //     ((totalClaims - lastMonthClaims) / lastMonthClaims) *
  //     100
  //   ).toFixed(1);

  //   const paidAmount = claims
  //     .filter((c) => c.status === "Paid")
  //     .reduce((sum, c) => sum + c.amount, 0);

  //   const pendingAmount = claims
  //     .filter((c) => c.status === "Pending" || c.status === "Under Review")
  //     .reduce((sum, c) => sum + c.amount, 0);

  const totalClaims = claims?.length || 0;
  const medicalRefunds =
    claims?.filter((c) => c.type === "Medical Refund").length || 0;
  const disabilityClaims =
    claims?.filter((c) => c.type === "Disability").length || 0;
  const deathClaims =
    claims?.filter((c) => c.type === "Death Claim").length || 0;
  const lossOfProductivity =
    claims?.filter((c) => c.type === "Loss of Productivity").length || 0;

  const lastMonthClaims = claims?.length ? claims.length - 1 : 0;
  const changePercent =
    lastMonthClaims > 0
      ? (((totalClaims - lastMonthClaims) / lastMonthClaims) * 100).toFixed(1)
      : "0";

  const paidAmount =
    claims
      ?.filter((c) => c.status === "Paid")
      .reduce((sum, c) => sum + c.amount, 0) || 0;

  const pendingAmount =
    claims
      ?.filter((c) => c.status === "Pending" || c.status === "Under Review")
      .reduce((sum, c) => sum + c.amount, 0) || 0;

  // ============== STATISTICS ==============
  const stats: StatCard[] = [
    {
      title: "Total Claims Received",
      value: totalClaims,
      change: `${
        Number(changePercent) > 0 ? "+" : ""
      }${changePercent}% from last month`,
      icon: <FileText />,
      bgColor: "#00a63e",
    },
    {
      title: "Medical Refunds",
      value: medicalRefunds,
      icon: <Activity />,
      bgColor: "#00a63e",
    },
    {
      title: "Disability Claims",
      value: disabilityClaims,
      icon: <DollarSign />,
      bgColor: "#3b82f6",
    },
    {
      title: "Death Claims",
      value: deathClaims,
      icon: <BarChart3 />,
      bgColor: "#a855f7",
    },
  ];

  const claimTypes = [
    {
      type: "Medical Refunds",
      count: medicalRefunds,
      color: "bg-green-50 border-l-4 border-green-500",
    },
    {
      type: "Disability Claims",
      count: disabilityClaims,
      color: "bg-blue-50 border-l-4 border-blue-500",
    },
    {
      type: "Death Claims",
      count: deathClaims,
      color: "bg-purple-50 border-l-4 border-purple-500",
    },
    {
      type: "Loss of Productivity",
      count: lossOfProductivity,
      color: "bg-yellow-50 border-l-4 border-yellow-500",
    },
  ];

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Claims Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and process employee compensation claims
          </p>
        </div>

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
          onFilterClick={() => console.log("Filter clicked")}
        />

        {/* Claims Table */}
        <ClaimsTable claims={filteredClaims} onView={handleViewClaim} />
      </div>
    </div>
  );
}
