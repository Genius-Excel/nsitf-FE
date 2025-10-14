import type { UserRole } from "./auth"

// Define permissions for each role
export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "view_dashboard",
    "manage_users",
    "view_compliance",
    "manage_compliance",
    "view_claims",
    "manage_claims",
    "view_hse",
    "manage_hse",
    "view_legal",
    "manage_legal",
  ],
  regional_manager: ["view_dashboard", "view_compliance", "view_claims", "manage_claims", "view_hse", "view_legal"],
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "manage_users")
}

export function canManageCompliance(role: UserRole): boolean {
  return hasPermission(role, "manage_compliance")
}

export function canManageClaims(role: UserRole): boolean {
  return hasPermission(role, "manage_claims")
}

export function canManageHSE(role: UserRole): boolean {
  return hasPermission(role, "manage_hse")
}

export function canManageLegal(role: UserRole): boolean {
  return hasPermission(role, "manage_legal")
}
