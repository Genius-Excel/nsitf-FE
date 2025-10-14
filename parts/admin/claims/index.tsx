"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ClipboardCheck, Eye } from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"

const mockClaims = [
  {
    id: "CLM-001",
    title: "Property Damage - Building A",
    status: "Under Review",
    amount: "$15,000",
    date: "2025-01-10",
  },
  { id: "CLM-002", title: "Equipment Malfunction", status: "Approved", amount: "$8,500", date: "2025-01-08" },
  { id: "CLM-003", title: "Vehicle Accident", status: "Pending Inspection", amount: "$22,000", date: "2025-01-12" },
  { id: "CLM-004", title: "Workplace Injury", status: "Under Review", amount: "$5,200", date: "2025-01-11" },
]

export default function ClaimsPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Claims Inspection</h1>
          <p className="text-muted-foreground">Manage and inspect insurance claims</p>
        </div>
        <PermissionGuard permission="manage_claims" fallback={null}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Claim
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Claims", value: "15" },
          { label: "Under Review", value: "5" },
          { label: "Approved", value: "7" },
          { label: "Rejected", value: "3" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>Latest insurance claims requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-4 rounded-md bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{claim.title}</p>
                      <span className="text-xs text-muted-foreground">#{claim.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-primary font-medium">{claim.amount}</p>
                      <span className="text-xs text-muted-foreground">• {claim.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{claim.status}</span>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
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
