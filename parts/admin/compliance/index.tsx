"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { PermissionGuard } from "@/components/permission-guard"

const mockCompliance = [
  { id: "1", title: "Annual Safety Audit", status: "Completed", dueDate: "2025-01-15", priority: "High" },
  {
    id: "2",
    title: "Environmental Compliance Report",
    status: "In Progress",
    dueDate: "2025-02-01",
    priority: "Medium",
  },
  { id: "3", title: "Data Protection Assessment", status: "Pending", dueDate: "2025-02-15", priority: "High" },
  { id: "4", title: "Quality Standards Review", status: "Completed", dueDate: "2025-01-10", priority: "Low" },
]

export default function CompliancePage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-primary" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">Track and manage compliance requirements</p>
        </div>
        <PermissionGuard permission="manage_compliance" fallback={null}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Compliance Item
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Items", value: "42", icon: FileText },
          { label: "Completed", value: "28", icon: CheckCircle2 },
          { label: "In Progress", value: "8", icon: Clock },
          { label: "Pending", value: "6", icon: AlertCircle },
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
          <CardTitle>Compliance Items</CardTitle>
          <CardDescription>Recent compliance activities and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCompliance.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-md bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {item.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      item.priority === "High"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : item.priority === "Medium"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
