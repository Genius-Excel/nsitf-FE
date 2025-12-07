"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromStorage } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { type Permission } from "@/lib/types/permissions"

interface PermissionGuardProps {
  permission?: string
  requiredPermissions?: Permission[] | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAll?: boolean // If true, user must have ALL permissions. If false, user needs ANY permission.
}

export function PermissionGuard({ 
  permission, 
  requiredPermissions,
  children, 
  fallback,
  requireAll = false 
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getUserFromStorage()
    if (!user) {
      setHasAccess(false)
      setIsLoading(false)
      return
    }

    // Handle single permission (backward compatibility)
    if (permission) {
      if (user.permissions && Array.isArray(user.permissions)) {
        // Check for exact backend permission match (e.g., "can_upload_hse")
        const hasBackendPermission = user.permissions.includes(permission)

        // Also map frontend permission names to backend permission names
        const permissionMapping: Record<string, string[]> = {
          "manage_hse": ["can_upload_hse", "can_create_hse_record", "can_edit_hse_record"],
          "manage_claims": ["can_upload_claims", "can_create_claims_record", "can_edit_claims_record"],
          "manage_legal": ["can_upload_legal", "can_create_legal_record", "can_edit_legal_record"],
          "manage_inspection": ["can_upload_inspection", "can_create_inspection_record", "can_edit_inspection_record"],
          "manage_compliance": ["can_upload_compliance", "can_create_compliance_record", "can_edit_compliance_record"],
        }

        const backendPermissions = permissionMapping[permission] || []
        const hasMappedPermission = backendPermissions.some(p => user.permissions?.includes(p))

        setHasAccess(hasBackendPermission || hasMappedPermission)
      } else {
        // Fallback to role-based permissions if no backend permissions
        setHasAccess(hasPermission(user.role, permission))
      }
      setIsLoading(false)
      return
    }

    // Handle multiple permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const permissionChecks = requiredPermissions.map((perm) => {
        // For permission management, admin role automatically has access
        if (user.role === "admin" && (perm === "ASSIGN_PERMISSIONS" || perm === "MANAGE_USERS")) {
          return true
        }
        
        if (user.permissions && Array.isArray(user.permissions)) {
          return user.permissions.includes(perm as string)
        }
        
        return hasPermission(user.role, perm as string)
      })

      if (requireAll) {
        setHasAccess(permissionChecks.every(check => check))
      } else {
        setHasAccess(permissionChecks.some(check => check))
      }
    } else {
      setHasAccess(true) // No specific permissions required
    }

    setIsLoading(false)
  }, [permission, requiredPermissions, requireAll])

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  if (!hasAccess) {
    // If fallback is explicitly provided (even if null), use it
    // Otherwise show the default "Access Denied" message
    if (fallback !== undefined) {
      return <>{fallback}</>
    }

    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </div>
          <CardDescription>You don't have permission to access this feature.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator if you believe you should have access.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
