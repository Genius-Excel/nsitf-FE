import type { UserRole } from "./auth"

// Define permissions for each role
export const rolePermissions: Record<UserRole, string[]> = {
  // Admin has full access to everything
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
    "view_inspection",
    "manage_inspection",
    "view_kpi",
    "manage_kpi",
    "view_valuation",
    "manage_valuation",
    "view_risk",
    "manage_risk",
  ],

  // Manager has view access to all, manage access to most (but not specialized modules)
  manager: [
    "view_dashboard",
    "view_users",
    "manage_users",
    "view_compliance",
    "view_claims",
    "view_hse",
    "view_legal",
    "view_inspection",
    "view_kpi",
    "view_valuation",
    "view_risk",
  ],

  // Regional manager has view access and limited manage
  regional_manager: [
    "view_dashboard",
    "view_compliance",
    "view_claims",
    "manage_claims",
    "view_hse",
    "view_legal",
    "view_inspection",
  ],

  // User has basic view access
  user: [
    "view_dashboard",
    "view_claims",
    "view_hse",
    "view_inspection",
  ],

  // Claims Officer - full access to claims, view-only access to others
  claims_officer: [
    "view_dashboard",
    "view_claims",
    "manage_claims",
    "view_compliance",
    "view_hse",
    "view_legal",
    "view_inspection",
  ],

  // Compliance Officer - full access to compliance, manage access to all modules for uploads
  compliance_officer: [
    "view_dashboard",
    "view_compliance",
    "manage_compliance",
    "view_claims",
    "manage_claims",
    "view_hse",
    "manage_hse",
    "view_legal",
    "manage_legal",
    "view_inspection",
    "manage_inspection",
  ],

  // HSE Officer - full access to HSE, view-only access to others
  hse_officer: [
    "view_dashboard",
    "view_hse",
    "manage_hse",
    "view_claims",
    "view_compliance",
    "view_legal",
    "view_inspection",
  ],

  // Legal Officer - full access to legal, view-only access to others
  legal_officer: [
    "view_dashboard",
    "view_legal",
    "manage_legal",
    "view_claims",
    "view_compliance",
    "view_hse",
    "view_inspection",
  ],

  // Inspection Officer - full access to inspection, view-only access to others
  inspection_officer: [
    "view_dashboard",
    "view_inspection",
    "manage_inspection",
    "view_claims",
    "view_compliance",
    "view_hse",
    "view_legal",
  ],
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

export function canManageInspection(role: UserRole): boolean {
  return hasPermission(role, "manage_inspection")
}
