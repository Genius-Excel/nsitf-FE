/**
 * Permission Management Types & Constants
 * Single source of truth for all permission-related data
 */

// ============== PERMISSION TYPES ==============

export type Permission = string;

// ============== PERMISSION CATEGORIES ==============

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  permissions: PermissionItem[];
}

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "upload_and_data_management",
    name: "Upload & Data Management",
    description: "Permissions for uploading and managing various types of data",
    permissions: [],
  },
  {
    id: "review_and_approval",
    name: "Review & Approval",
    description: "Permissions for reviewing and approving reports and submissions",
    permissions: [],
  },
  {
    id: "dashboard_and_analytics",
    name: "Dashboard & Analytics",
    description: "Permissions for viewing dashboards and analytical tools",
    permissions: [],
  },
  {
    id: "record_management",
    name: "Record Management",
    description: "Permissions for managing individual records and data entries",
    permissions: [],
  },
  {
    id: "user_and_role_management",
    name: "User & Role Management",
    description: "Permissions for managing users, roles, and permissions",
    permissions: [],
  },
  {
    id: "system_administration",
    name: "System Administration",
    description: "High-level system administration permissions",
    permissions: [],
  },
];

// ============== ALL PERMISSIONS LIST ==============

export const ALL_PERMISSIONS: Permission[] = [];

// ============== USER WITH PERMISSIONS TYPE ==============

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: PermissionItem[];
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

// ============== PERMISSION CHANGE TRACKING ==============

export interface PermissionChange {
  permission: string;
  action: "add" | "remove";
  timestamp: Date;
}

export interface PermissionDiff {
  added: string[];
  removed: string[];
  unchanged: string[];
}

// ============== PERMISSION API TYPES ==============

export interface UpdateUserPermissionsRequest {
  action: "assign" | "remove";
  user_ids: string[];
  permission_ids: string[];
}

export interface UpdateUserPermissionsResponse {
  message: string;
  results: Array<{
    user: string;
    permission: string;
    status: string;
  }>;
}

export interface GetPermissionsResponse {
  message: string;
  data: Record<string, PermissionItem[]>;
}

// ============== PERMISSION VALIDATION UTILITIES ==============

export function canRemovePermission(
  userRole: string,
  permission: PermissionItem,
  currentUser: { role: string; permissions?: PermissionItem[] }
): boolean {
  // All permissions can be removed (no restrictions based on the API)
  return true;
}

export function canAssignPermission(
  targetUserRole: string,
  permission: PermissionItem,
  currentUserRole: string
): boolean {
  // All permissions can be assigned (no restrictions based on the API)
  return true;
}