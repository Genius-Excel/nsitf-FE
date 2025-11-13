"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Shield,
  ClipboardCheck,
  HardHat,
  Scale,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getUserFromStorage, User } from "@/lib/auth";
import HttpService from "@/services/httpServices";
import { DashboardLineChart } from "./line-chart";
import { ClaimsPieChart } from "./claims-chart";
import { RegionChartBarMultiple } from "./region-chartbar-multiple";

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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            APRD DASHBOARD VIEW FOR SUPER USER
          </h1>
        </div>
        {/* {dashboard && (
          <p className="text-muted-foreground text-sm">
            {dashboard.data.filters.region_name} • {dashboard.data.filters.period}
          </p>
        )} */}
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-muted-foreground">Loading dashboard data...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {/* Metric Cards */}
      {!loading && statCards.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            const TrendIcon =
              card.metric.trend === "up"
                ? ArrowUp
                : card.metric.trend === "down"
                ? ArrowDown
                : null;

            return (
              <Card key={card.title} className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-semibold">
                    {card.format(card.metric.value)}
                  </div>
                  <p
                    className={`mt-1 flex items-center gap-1 text-xs ${
                      card.metric.trend === "up"
                        ? "text-green-600"
                        : card.metric.trend === "down"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {TrendIcon && <TrendIcon className="w-4 h-4" aria-hidden="true" />}
                    {card.metric.change_percent}% from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
