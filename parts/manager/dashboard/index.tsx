"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, ClipboardCheck, HardHat, Scale } from "lucide-react"
import { getUserFromStorage, User } from "@/lib/auth"
import { RoleBadge } from "@/components/role-badge"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUserFromStorage())
  }, [])

  const stats = [
    {
      title: "Active Users",
      value: "248",
      icon: Users,
      description: "12 new this week",
    },
    {
      title: "Compliance Items",
      value: "42",
      icon: Shield,
      description: "8 pending review",
    },
    {
      title: "Open Claims",
      value: "15",
      icon: ClipboardCheck,
      description: "3 require attention",
    },
    {
      title: "HSE Incidents",
      value: "3",
      icon: HardHat,
      description: "All resolved",
    },
    {
      title: "Legal Cases",
      value: "7",
      icon: Scale,
      description: "2 in progress",
    },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Welcome back, {user?.name}</h1>
          {/* {user && <RoleBadge role={user.role} />} */}
        </div>
        <p className="text-muted-foreground text-balance">Here's an overview of your business operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
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
      </Card>
    </div>
  )
}
