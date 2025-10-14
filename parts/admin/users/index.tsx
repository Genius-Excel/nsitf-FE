"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical } from "lucide-react"
import { UserRole } from "@/lib/auth"
import { PermissionGuard } from "@/components/permission-guard"
import { RoleBadge } from "@/components/role-badge"

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@company.com", role: "admin" as UserRole, status: "Active" },
  { id: "2", name: "Jane Smith", email: "jane@company.com", role: "regional_manager" as UserRole, status: "Active" },
  { id: "3", name: "Bob Johnson", email: "bob@company.com", role: "regional_manager" as UserRole, status: "Active" },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@company.com",
    role: "regional_manager" as UserRole,
    status: "Inactive",
  },
]

export default function UsersPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">User and Role Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <PermissionGuard permission="manage_users" fallback={null}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </PermissionGuard>
      </div>

      <PermissionGuard permission="manage_users">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A list of all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-md bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-medium text-primary">{user.name.charAt(0)}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={user.role} />
                    <span
                      className={`text-xs px-2 py-1 rounded-md ${
                        user.status === "Active"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.status}
                    </span>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  )
}
