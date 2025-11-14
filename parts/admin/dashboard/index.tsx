"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  ClipboardCheck,
  HardHat,
  Scale,
} from "lucide-react";
import { getUserFromStorage, User } from "@/lib/auth";
import HttpService from "@/services/httpServices";
import { DashboardLineChart } from "./line-chart";
import { ClaimsPieChart } from "./claims-chart";
import { RegionChartBarMultiple } from "./region-chartbar-multiple";
import { MetricsGrid, MetricCard } from "@/components/design-system/MetricCard";
import { PageHeader } from "@/components/design-system/PageHeader";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";

// --- Type for API response ---
interface Metric {
  value: number;
  change_percent: number;
  trend: "up" | "down" | "neutral";
}

interface DashboardResponse {
  message: string;
  data: {
    filters: {
      region_name: string;
      period: string;
      previous_period: string;
    };
    metric_cards: {
      total_actual_contributions: Metric;
      total_employers_registered: Metric;
      total_claims_paid: Metric;
      total_claims_beneficiaries: Metric;
      total_osh_activities: Metric;
    };
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setUser(getUserFromStorage()), []);

  useEffect(() => {
    const fetchDashboard = async () => {
      const http = new HttpService();
      try {
        const res = await http.getData("/api/dashboard/summary");
        setDashboard(res.data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Map API metric_cards to card definitions
  const statCards = dashboard
    ? [
        {
          title: "Total Actual Contributions",
          metric: dashboard.data.metric_cards.total_actual_contributions,
          icon: Users,
          format: (val: number) => `₦${val.toLocaleString()}`,
        },
        {
          title: "Total Registered Employers",
          metric: dashboard.data.metric_cards.total_employers_registered,
          icon: Shield,
          format: (val: number) => val.toLocaleString(),
        },
        {
          title: "Total Claims Paid",
          metric: dashboard.data.metric_cards.total_claims_paid,
          icon: ClipboardCheck,
          format: (val: number) => `₦${val.toLocaleString()}`,
        },
        {
          title: "Total Claims Beneficiaries",
          metric: dashboard.data.metric_cards.total_claims_beneficiaries,
          icon: HardHat,
          format: (val: number) => val.toLocaleString(),
        },
        {
          title: "Total OSH Activities",
          metric: dashboard.data.metric_cards.total_osh_activities,
          icon: Scale,
          format: (val: number) => val.toLocaleString(),
        },
      ]
    : [];

  // Retry function
  const refetchDashboard = async () => {
    setLoading(true);
    setError(null);
    const http = new HttpService();
    try {
      const res = await http.getData("/api/dashboard/summary");
      setDashboard(res.data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  // Show error state
  if (error) {
    return <ErrorState message={error} onRetry={refetchDashboard} />;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <PageHeader
        title="APRD Dashboard View for Super User"
        description={
          dashboard
            ? `${dashboard.data.filters.region_name} • ${dashboard.data.filters.period}`
            : undefined
        }
      />

      {/* Metric Cards */}
      {statCards.length > 0 && (
        <MetricsGrid columns={5}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const colorSchemes: Array<"green" | "blue" | "purple" | "orange" | "gray"> = [
              "green",
              "blue",
              "purple",
              "orange",
              "green",
            ];

            return (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.format(card.metric.value)}
                change={`${card.metric.change_percent}% from last month`}
                icon={<Icon className="w-5 h-5" />}
                colorScheme={colorSchemes[index]}
              />
            );
          })}
        </MetricsGrid>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardLineChart />
        <ClaimsPieChart />
      </div>
      <RegionChartBarMultiple />
    </div>
  );
}
