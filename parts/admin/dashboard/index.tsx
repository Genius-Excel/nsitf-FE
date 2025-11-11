"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "lucide-react";
import { getUserFromStorage, User } from "@/lib/auth";
import { RoleBadge } from "@/components/role-badge";
import { DashboardLineChart } from "./line-chart";
import { ClaimsPieChart } from "./claims-chart";
import { RegionChartBarMultiple } from "./region-chartbar-multiple";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUserFromStorage());
  }, []);

  const stats = [
    {
      title: "Total Actual Contributions",
      value: "248",
      icon: Users,
      description: "12.5% fromn last months",
    },
    {
      title: "Total Registered Employers",
      value: "92%",
      icon: Shield,
      description: "8 pending review",
    },
    {
      title: "Total Claims Paid",
      value: "15",
      icon: ClipboardCheck,
      description: "8.3% fromlast month",
    },
    {
      title: "Total Claims Beneficiaries",
      value: "N2.4B",
      icon: HardHat,
      description: "15% from last month",
    },
    {
      title: "Total OSH Activities",
      value: "N2.4B",
      icon: Scale,
      description: "15% from last month",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Dashboard Overview
          </h1>
          {/* {user && <RoleBadge role={user.role} />} */}
        </div>
        <p className="text-muted-foreground text-balance">
          Welcome to NSITF operations platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-1 sm:pb-2">
                <CardTitle className="text-gray-400 font-normal text-sm sm:text-base">
                  {stat.title}
                </CardTitle>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md bg-blue-100 flex items-center justify-center">
                  <Icon
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500"
                    aria-hidden="true"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-semibold">
                  {stat.value}
                </div>
                <p className="mt-0.5 sm:mt-1 text-green-700 flex gap-0.5 sm:gap-1 items-start text-xs sm:text-sm">
                  <ArrowUp
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    aria-hidden="true"
                  />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      {/* <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "New compliance report submitted",
                time: "2 hours ago",
                type: "Compliance",
              },
              {
                title: "Claim #1234 inspection completed",
                time: "4 hours ago",
                type: "Claims",
              },
              {
                title: "HSE training session scheduled",
                time: "Yesterday",
                type: "HSE",
              },
              {
                title: "Legal document review pending",
                time: "2 days ago",
                type: "Legal",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-md bg-secondary/30 border border-border/50"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary">{activity.type}</span>
                    <span className="text-xs text-muted-foreground">• {activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardLineChart />
        <ClaimsPieChart />
      </div>
      <RegionChartBarMultiple />
    </div>
  );
}
