"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, HardHat, AlertTriangle, CheckCircle2 } from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"

const mockIncidents = [
  { id: "HSE-001", title: "Minor Slip Incident", severity: "Low", status: "Resolved", date: "2025-01-09" },
  { id: "HSE-002", title: "Equipment Safety Check", severity: "Medium", status: "In Progress", date: "2025-01-11" },
  { id: "HSE-003", title: "Fire Drill Conducted", severity: "Low", status: "Completed", date: "2025-01-08" },
]

export default function HSEPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Health, Safety & Environment</h1>
          <p className="text-muted-foreground">Monitor and manage HSE incidents and compliance</p>
        </div>
        <PermissionGuard permission="manage_hse" fallback={null}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Report Incident
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Incidents", value: "3", icon: HardHat },
          { label: "Resolved", value: "2", icon: CheckCircle2 },
          { label: "In Progress", value: "1", icon: AlertTriangle },
          { label: "Days Since Last", value: "5", icon: HardHat },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent HSE Activities</CardTitle>
          <CardDescription>Latest health, safety, and environmental incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-4 rounded-md bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                    <HardHat className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{incident.title}</p>
                      <span className="text-xs text-muted-foreground">#{incident.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{incident.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      incident.severity === "High"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : incident.severity === "Medium"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {incident.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{incident.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
