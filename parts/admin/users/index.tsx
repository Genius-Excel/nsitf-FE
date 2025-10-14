"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical } from "lucide-react"
import { UserRole } from "@/lib/auth"
import { PermissionGuard } from "@/components/permission-guard"
import { RoleBadge } from "@/components/role-badge"
import UsersRolesManagement from "./users-role-management"

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
     <UsersRolesManagement/>
    </div>
  )
}
