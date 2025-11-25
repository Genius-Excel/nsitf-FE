"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { UserRole } from "@/lib/auth";
import { PermissionGuard } from "@/components/permission-guard";
import { RoleBadge } from "@/components/role-badge";
import UsersRolesManagement from "./users-role-management";

export default function UsersPage() {
  return (
    <div className="p-8 space-y-8">
      <UsersRolesManagement />
    </div>
  );
}
