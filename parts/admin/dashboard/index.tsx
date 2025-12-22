"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, Shield, ClipboardCheck, HardHat, Scale } from "lucide-react";
import { getUserFromStorage, User } from "@/lib/auth";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useMetricCards } from "@/hooks/Usedashboardcharts";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { DashboardLineChart } from "./line-chart";
import { ClaimsPieChart } from "./claims-chart";
import { RegionChartBarMultiple } from "./region-chartbar-multiple";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { MetricsFilter } from "@/components/design-system/MetricsFilter";
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

  // Metrics filters state
  const [metricsFilters, setMetricsFilters] = useState({
    selectedMonth: undefined,
    selectedYear: undefined,
    periodFrom: undefined,
    periodTo: undefined,
  });

  const handleMetricsFilterChange = (newFilters: typeof metricsFilters) => {
    setMetricsFilters(newFilters);
  };

  const handleResetMetricsFilters = () => {
    setMetricsFilters({
      selectedMonth: undefined,
      selectedYear: undefined,
      periodFrom: undefined,
      periodTo: undefined,
    });
  };

  // Check permissions for dashboard access
  const { canView, loading: permissionLoading } =
    useCheckPermission("dashboard");

  // Convert metrics filters to API params
  const dashboardApiParams = useMemo(() => {
    const params: { month?: number; year?: number } = {};

    if (metricsFilters.selectedMonth && metricsFilters.selectedYear) {
      const monthIndex =
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].indexOf(metricsFilters.selectedMonth) + 1;

      params.month = monthIndex;
      params.year = parseInt(metricsFilters.selectedYear);
    }

    console.log("🔍 [Dashboard] Metrics Filters:", metricsFilters);
    console.log("🔍 [Dashboard] API Params:", params);

    return params;
  }, [metricsFilters]);

  // SINGLE FETCH for all dashboard data (controlled by MetricsFilter)
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
    filters,
  } = useDashboardSummary(dashboardApiParams);

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
        message="You don't have permission to view the dashboard"
      />
    );
  }

  // Data loading state - only show on initial load
  if (loading && !dashboardData) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-10">
      {/* Header */}
      <PageHeader
        title="APRD Dashboard View for Super User"
        description={
          filters ? `${filters.region_name} • ${filters.period}` : undefined
        }
      />

      {/* Metrics Filters */}
      <MetricsFilter
        filters={metricsFilters}
        onFilterChange={handleMetricsFilterChange}
        onReset={handleResetMetricsFilters}
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
