// Define the UserRole type
export type UserRole =
  | "admin"
  | "manager"
  | "regional_manager"
  | "user"
  | "claims_officer"
  | "compliance_officer"
  | "hse_officer"
  | "HSE Officer" // API returns this exact string
  | "legal_officer"
  | "inspection_officer"
  | "actuary_officer"
  | "Actuary"; // API returns this exact string

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
  user: ["view_dashboard", "view_claims", "view_hse", "view_inspection"],

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
    "can_review",
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

  // Actuary Officer - review access by default
  actuary_officer: [
    "view_dashboard",
    "can_review",
    "view_claims",
    "view_compliance",
    "view_hse",
    "view_legal",
    "view_inspection",
  ],

  // API string variants (exact values returned by backend)
  "HSE Officer": [
    "view_dashboard",
    "view_hse",
    "manage_hse",
    "can_review",
    "view_claims",
    "view_compliance",
    "view_legal",
    "view_inspection",
  ],

  Actuary: [
    "view_dashboard",
    "can_review",
    "view_claims",
    "view_compliance",
    "view_hse",
    "view_legal",
    "view_inspection",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: string,
  backendPermissions?: string[],
): boolean {
  // Check backend permissions first if available
  if (backendPermissions && Array.isArray(backendPermissions)) {
    // Map frontend permission names to backend permission names
    const permissionMapping: Record<string, string[]> = {
      // View permissions
      view_claims: ["can_view_claims", "can_view_claim"],
      view_hse: ["can_view_hse", "can_view_hse_record"],
      view_legal: ["can_view_legal", "can_view_legal_case"],
      view_inspection: ["can_view_inspection", "can_view_inspection_record"],
      view_compliance: ["can_view_compliance", "can_view_compliance_record"],
      view_dashboard: ["can_view_dashboard"],

      // Manage permissions
      manage_hse: [
        "can_upload_hse",
        "can_create_hse_record",
        "can_edit_hse_record",
        "can_delete_hse_record",
      ],
      manage_claims: [
        "can_upload_claims",
        "can_create_claim",
        "can_create_claims_record",
        "can_edit_claim",
        "can_edit_claims_record",
        "can_approve_claim",
        "can_delete_claim",
        "can_process_claim",
      ],
      manage_legal: [
        "can_upload_legal",
        "can_create_legal_case",
        "can_create_legal_record",
        "can_edit_legal_case",
        "can_edit_legal_record",
        "can_update_legal_status",
        "can_delete_legal_case",
      ],
      manage_inspection: [
        "can_upload_inspection",
        "can_create_inspection_record",
        "can_edit_inspection_record",
        "can_upload_inspection_report",
        "can_delete_inspection",
        "can_update_inspection",
      ],
      manage_compliance: [
        "can_upload_compliance",
        "can_create_compliance_record",
        "can_edit_compliance_record",
        "can_delete_compliance_record",
        "can_generate_compliance_report",
      ],
    };

    const backendPerms = permissionMapping[permission] || [];
    const hasMappedPermission = backendPerms.some((p) =>
      backendPermissions.includes(p),
    );

    if (hasMappedPermission) return true;

    // Also check if the exact permission string exists in backend permissions
    if (backendPermissions.includes(permission)) return true;
  }

  // Fallback to role-based permissions
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "manage_users");
}

export function canManageCompliance(role: UserRole): boolean {
  return hasPermission(role, "manage_compliance");
}

export function canManageClaims(role: UserRole): boolean {
  return hasPermission(role, "manage_claims");
}

export function canManageHSE(role: UserRole): boolean {
  return hasPermission(role, "manage_hse");
}

export function canManageLegal(role: UserRole): boolean {
  return hasPermission(role, "manage_legal");
}

export function canManageInspection(role: UserRole): boolean {
  return hasPermission(role, "manage_inspection");
}
