"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Scale, FileText } from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"

const mockLegalCases = [
  { id: "LEG-001", title: "Contract Dispute - Vendor A", status: "In Progress", priority: "High", date: "2025-01-05" },
  { id: "LEG-002", title: "Employment Agreement Review", status: "Pending", priority: "Medium", date: "2025-01-10" },
  { id: "LEG-003", title: "Intellectual Property Filing", status: "Completed", priority: "High", date: "2025-01-03" },
  {
    id: "LEG-004",
    title: "Regulatory Compliance Review",
    status: "In Progress",
    priority: "Medium",
    date: "2025-01-08",
  },
]

export default function LegalPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Legal Management</h1>
          <p className="text-muted-foreground">Track legal cases and document reviews</p>
        </div>
        <PermissionGuard permission="manage_legal" fallback={null}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Legal Case
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Cases", value: "7" },
          { label: "In Progress", value: "2" },
          { label: "Pending", value: "3" },
          { label: "Completed", value: "2" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Active Legal Cases</CardTitle>
          <CardDescription>Current legal matters requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLegalCases.map((legalCase) => (
              <div
                key={legalCase.id}
                className="flex items-center justify-between p-4 rounded-md bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{legalCase.title}</p>
                      <span className="text-xs text-muted-foreground">#{legalCase.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{legalCase.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      legalCase.priority === "High"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    }`}
                  >
                    {legalCase.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">{legalCase.status}</span>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
