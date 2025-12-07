/**
 * Permission Management Types & Constants
 * Single source of truth for all permission-related data
 */

// ============== PERMISSION TYPES ==============

export type Permission =
  // Upload & Data Management
  | "UPLOAD_BRANCH_DATA"
  | "UPLOAD_HSE_DATA"
  | "UPLOAD_CLAIMS_DATA"
  | "UPLOAD_COMPLIANCE_DATA"
  | "UPLOAD_LEGAL_DATA"
  | "UPLOAD_INSPECTION_DATA"
  
  // Review & Approval
  | "REVIEW_BRANCH_REPORT"
  | "REVIEW_HSE_REPORT"
  | "REVIEW_CLAIMS_REPORT"
  | "REVIEW_COMPLIANCE_REPORT"
  | "REVIEW_LEGAL_REPORT"
  | "REVIEW_INSPECTION_REPORT"
  | "APPROVE_REGIONAL_REPORT"
  | "APPROVE_BRANCH_REPORT"
  
  // Dashboard & Analytics
  | "VIEW_DASHBOARD"
  | "VIEW_KPI_ANALYTICS"
  | "VIEW_RISK_ANALYSIS"
  | "VIEW_VALUATION_FORECASTING"
  | "VIEW_INVESTMENT_TREASURY"
  
  // Record Management
  | "EDIT_RECORD"
  | "DELETE_RECORD"
  | "CREATE_RECORD"
  | "EXPORT_RECORDS"
  
  // User & Role Management
  | "MANAGE_USERS"
  | "MANAGE_ROLES"
  | "VIEW_USER_PERMISSIONS"
  | "ASSIGN_PERMISSIONS"
  
  // System Administration
  | "SYSTEM_CONFIGURATION"
  | "AUDIT_LOG_ACCESS"
  | "BACKUP_RESTORE"

// ============== PERMISSION CATEGORIES ==============

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "upload",
    name: "Upload & Data Management",
    description: "Permissions for uploading and managing various types of data",
    permissions: [
      "UPLOAD_BRANCH_DATA",
      "UPLOAD_HSE_DATA",
      "UPLOAD_CLAIMS_DATA",
      "UPLOAD_COMPLIANCE_DATA",
      "UPLOAD_LEGAL_DATA",
      "UPLOAD_INSPECTION_DATA",
    ],
  },
  {
    id: "review",
    name: "Review & Approval",
    description: "Permissions for reviewing and approving reports and submissions",
    permissions: [
      "REVIEW_BRANCH_REPORT",
      "REVIEW_HSE_REPORT",
      "REVIEW_CLAIMS_REPORT",
      "REVIEW_COMPLIANCE_REPORT",
      "REVIEW_LEGAL_REPORT",
      "REVIEW_INSPECTION_REPORT",
      "APPROVE_REGIONAL_REPORT",
      "APPROVE_BRANCH_REPORT",
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard & Analytics",
    description: "Permissions for viewing dashboards and analytical tools",
    permissions: [
      "VIEW_DASHBOARD",
      "VIEW_KPI_ANALYTICS",
      "VIEW_RISK_ANALYSIS",
      "VIEW_VALUATION_FORECASTING",
      "VIEW_INVESTMENT_TREASURY",
    ],
  },
  {
    id: "records",
    name: "Record Management",
    description: "Permissions for managing individual records and data entries",
    permissions: [
      "EDIT_RECORD",
      "DELETE_RECORD",
      "CREATE_RECORD",
      "EXPORT_RECORDS",
    ],
  },
  {
    id: "administration",
    name: "User & Role Management",
    description: "Permissions for managing users, roles, and permissions",
    permissions: [
      "MANAGE_USERS",
      "MANAGE_ROLES", 
      "VIEW_USER_PERMISSIONS",
      "ASSIGN_PERMISSIONS",
    ],
  },
  {
    id: "system",
    name: "System Administration",
    description: "High-level system administration permissions",
    permissions: [
      "SYSTEM_CONFIGURATION",
      "AUDIT_LOG_ACCESS",
      "BACKUP_RESTORE",
    ],
  },
];

// ============== ALL PERMISSIONS LIST ==============

export const ALL_PERMISSIONS: Permission[] = PERMISSION_CATEGORIES.flatMap(
  (category) => category.permissions
);

// ============== USER WITH PERMISSIONS TYPE ==============

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

// ============== PERMISSION CHANGE TRACKING ==============

export interface PermissionChange {
  permission: Permission;
  action: "add" | "remove";
  timestamp: Date;
}

export interface PermissionDiff {
  added: Permission[];
  removed: Permission[];
  unchanged: Permission[];
}

// ============== PERMISSION API TYPES ==============

export interface UpdateUserPermissionsRequest {
  add: Permission[];
  remove: Permission[];
}

export interface UpdateUserPermissionsResponse {
  success: boolean;
  user: UserWithPermissions;
  changes: PermissionChange[];
}

// ============== ROLE-BASED PERMISSION RESTRICTIONS ==============

/**
 * Permissions that cannot be removed from specific roles
 * This prevents breaking core functionality
 */
export const ROLE_PROTECTED_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    "VIEW_DASHBOARD",
    "MANAGE_USERS", 
    "ASSIGN_PERMISSIONS",
    "SYSTEM_CONFIGURATION",
  ],
  manager: [
    "VIEW_DASHBOARD",
  ],
  regional_manager: [
    "VIEW_DASHBOARD",
  ],
  // Other roles can have all their permissions removed if needed
};

/**
 * Permissions that are always restricted for non-admin users
 */
export const ADMIN_ONLY_PERMISSIONS: Permission[] = [
  "SYSTEM_CONFIGURATION",
  "AUDIT_LOG_ACCESS", 
  "BACKUP_RESTORE",
  "MANAGE_ROLES",
];

// ============== PERMISSION VALIDATION UTILITIES ==============

export function isValidPermission(permission: string): permission is Permission {
  return ALL_PERMISSIONS.includes(permission as Permission);
}

export function getPermissionsByCategory(categoryId: string): Permission[] {
  const category = PERMISSION_CATEGORIES.find((cat) => cat.id === categoryId);
  return category ? category.permissions : [];
}

export function getCategoryForPermission(permission: Permission): PermissionCategory | undefined {
  return PERMISSION_CATEGORIES.find((category) =>
    category.permissions.includes(permission)
  );
}

export function canRemovePermission(
  userRole: string, 
  permission: Permission,
  currentUser: { role: string; permissions?: string[] }
): boolean {
  // Can't remove from own admin account if it would break critical functionality
  if (currentUser.role === "admin" && ROLE_PROTECTED_PERMISSIONS.admin?.includes(permission)) {
    return false;
  }
  
  // Check role-based protection
  const protectedPerms = ROLE_PROTECTED_PERMISSIONS[userRole];
  if (protectedPerms && protectedPerms.includes(permission)) {
    return false;
  }
  
  return true;
}

export function canAssignPermission(
  targetUserRole: string, 
  permission: Permission,
  currentUserRole: string
): boolean {
  // Only admins can assign admin-only permissions
  if (ADMIN_ONLY_PERMISSIONS.includes(permission) && currentUserRole !== "admin") {
    return false;
  }
  
  return true;
}