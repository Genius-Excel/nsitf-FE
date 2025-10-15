"use client";
import React, { useState, useEffect } from "react";
import { FileText, Shield, CheckCircle, AlertCircle } from "lucide-react";
import {
  StatisticsCards,
  RecentHSEActivities,
  MonthlySummary,
  ComplianceRate,
} from "./hseDesign";
import { HSEActivity, StatCard } from "@/lib/types";
import { mockHSEActivities } from "@/lib/Constants";

export default function HSEManagement() {
  // ============== STATE ==============
  const [activities, setActivities] = useState<HSEActivity[]>([]);
  const [isClient, setIsClient] = useState(false);

  // ============== INITIALIZATION ==============
  useEffect(() => {
    setIsClient(true);
    setActivities(mockHSEActivities);
  }, []);

  // ============== CALCULATIONS ==============
  const lettersIssued = mockHSEActivities.filter(
    (a) => a.type === "Letter Issued"
  ).length;
  const oshAwarenessCount = mockHSEActivities.filter(
    (a) => a.type === "OSH Awareness"
  ).length;
  const safetyAuditsCount = mockHSEActivities.filter(
    (a) => a.type === "Safety Audit"
  ).length;
  const accidentInvestigationsCount = mockHSEActivities.filter(
    (a) => a.type === "Accident Investigation"
  ).length;

  const completedCount = mockHSEActivities.filter(
    (a) => a.status === "Completed"
  ).length;
  const underInvestigationCount = mockHSEActivities.filter(
    (a) => a.status === "Under Investigation"
  ).length;
  const followUpRequiredCount = mockHSEActivities.filter(
    (a) => a.status === "Follow-up Required"
  ).length;

  const compliancePercentage = 92;
  const complianceChange = "↑ 3% from last month";

  // ============== STATISTICS ==============
  const stats: StatCard[] = [
    {
      title: "Letters Issued",
      value: lettersIssued,
      description: "Safety compliance letters",
      icon: <FileText />,
      bgColor: "#00a63e",
    },
    {
      title: "OSH Awareness Sessions",
      value: oshAwarenessCount,
      description: "Training & awareness programs",
      icon: <Shield />,
      bgColor: "#00a63e",
    },
    {
      title: "Safety Audits",
      value: safetyAuditsCount,
      description: "Completed workplace audits",
      icon: <CheckCircle />,
      bgColor: "#3b82f6",
    },
    {
      title: "Accident Investigations",
      value: accidentInvestigationsCount,
      description: "Incident investigations",
      icon: <AlertCircle />,
      bgColor: "#a855f7",
    },
  ];

  const monthlySummaryData = [
    { label: "Total Activities", value: mockHSEActivities.length },
    { label: "Completed", value: completedCount },
    { label: "Under Investigation", value: underInvestigationCount },
    { label: "Follow-up Required", value: followUpRequiredCount },
  ];

  // Don't render until client-side
  if (!isClient) {
    return null;
  }

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Health, Safety & Environment (HSE)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage workplace safety and environmental compliance
          </p>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards stats={stats} />

        {/* Recent HSE Activities */}
        <RecentHSEActivities activities={activities} />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Summary */}
          <div className="lg:col-span-2">
            <MonthlySummary data={monthlySummaryData} />
          </div>

          {/* Compliance Rate */}
          <div className="lg:col-span-1">
            <ComplianceRate
              percentage={compliancePercentage}
              change={complianceChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}