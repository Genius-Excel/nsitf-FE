"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromStorage } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

interface PermissionGuardProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setHasAccess(hasPermission(user.role, permission))
    }
    setIsLoading(false)
  }, [permission])

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
