// components/dashboard/DashboardCards.tsx
"use client";
import React from "react";
import {DashboardCard} from "./DashboardCard";
import { TrendingUp, Target, Building2, UserCheck } from "lucide-react";
import { DashboardMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DashboardCardsProps {
  metrics: DashboardMetrics;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics }) => {
  const cards = [
    {
      label: "Total Actual Contributions",
      value: formatCurrency(metrics.totalActualContributions),
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      colorClass: "bg-green-50 border-green-200",
      ariaLabel: `Total contributions: ${formatCurrency(metrics.totalActualContributions)}`,
    },
    {
      label: "Contributions Target",
      value: formatCurrency(metrics.contributionsTarget),
      icon: <Target className="w-5 h-5 text-blue-600" />,
      colorClass: "bg-blue-50 border-blue-200",
      ariaLabel: `Target amount: ${formatCurrency(metrics.contributionsTarget)}`,
    },
    {
      label: "Performance Rate",
      value: `${metrics.performanceRate.toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      colorClass: "bg-green-50 border-green-200",
      ariaLabel: `Performance rate: ${metrics.performanceRate.toFixed(1)} percent`,
    },
    {
      label: "Total Employers",
      value: metrics.totalEmployers.toLocaleString(),
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      colorClass: "bg-blue-50 border-blue-200",
      ariaLabel: `Total employers: ${metrics.totalEmployers.toLocaleString()}`,
    },
    {
      label: "Total Employees",
      value: metrics.totalEmployees.toLocaleString(),
      icon: <UserCheck className="w-5 h-5 text-green-600" />,
      colorClass: "bg-green-50 border-green-200",
      ariaLabel: `Total employees: ${metrics.totalEmployees.toLocaleString()}`,
    },
  ];

  return (
    <section aria-labelledby="dashboard-metrics-heading" className="mb-6">
      <h2 id="dashboard-metrics-heading" className="sr-only">
        Dashboard Metrics Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card, idx) => (
          <DashboardCard key={idx} {...card} />
        ))}
      </div>
    </section>
  );
};

export default DashboardCards;
