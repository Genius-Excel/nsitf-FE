"use client";

import { useEffect, useState } from "react";
import { Users, Shield, ClipboardCheck, HardHat, Scale } from "lucide-react";
import { getUserFromStorage, User } from "@/lib/auth";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useMetricCards } from "@/hooks/Usedashboardcharts";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { DashboardLineChart } from "./line-chart";
import { ClaimsPieChart } from "./claims-chart";
import { RegionChartBarMultiple } from "./region-chartbar-multiple";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";

/**
 * REFACTORED DASHBOARD:
 * - Fetches data ONCE using useDashboardSummary
 * - Passes data down to child components (no redundant fetching)
 * - Proper loading/error states
 * - Correct data access patterns
 */

const ICON_MAP = {
  0: Users,
  1: Shield,
  2: ClipboardCheck,
  3: HardHat,
  4: Scale,
} as const;

const COLOR_SCHEMES: Array<"green" | "blue" | "purple" | "orange" | "gray"> = [
  "green",
  "blue",
  "purple",
  "orange",
  "green",
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  // Check permissions for dashboard access
  const {
    canView,
    loading: permissionLoading,
  } = useCheckPermission("dashboard");

  // SINGLE FETCH for all dashboard data
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
    filters,
  } = useDashboardSummary();

  // Transform metric cards data
  const { cards: metricCards } = useMetricCards(dashboardData);

  useEffect(() => {
    setUser(getUserFromStorage());
  }, []);

  // Permission loading state
  if (permissionLoading) {
    return <LoadingState message="Checking permissions..." />;
  }

  // Permission denied state
  if (!canView) {
    return (
      <ErrorState
        title="Access Denied"
        description="You don't have permission to view the dashboard"
      />
    );
  }

  // Data loading state
  if (loading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <PageHeader
        title="APRD Dashboard View for Super User"
        description={
          filters ? `${filters.region_name} • ${filters.period}` : undefined
        }
      />

      {/* Metric Cards */}
      {metricCards.length > 0 && (
        <MetricsGrid columns={5}>
          {metricCards.map((card, index) => {
            const Icon = ICON_MAP[index as keyof typeof ICON_MAP];

            return (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.formatter(card.value)}
                change={`${card.changePercent}% from last month`}
                icon={<Icon className="w-5 h-5" />}
                colorScheme={COLOR_SCHEMES[index]}
              />
            );
          })}
        </MetricsGrid>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardLineChart dashboardData={dashboardData} loading={loading} />
        <ClaimsPieChart dashboardData={dashboardData} loading={loading} />
      </div>

      <RegionChartBarMultiple dashboardData={dashboardData} loading={loading} />
    </div>
  );
}
