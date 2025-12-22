/**
 * Role-based routing configuration
 * Centralized mapping to ensure consistency across the application
 */

export const validRoles = [
  "admin",
  "manager",
  "user",
  "regional_manager",
  "regional_officer",
  "claims_officer",
  "compliance_officer",
  "hse_officer",
  "legal_officer",
  "inspection_officer",
  "inspector_officer",
  "branch_data_officer",
  "branch_officer",
  "actuary",
] as const;

export type Role = (typeof validRoles)[number];

/**
 * Maps role names (as they come from backend) to standardized role identifiers
 * Handles variations in role naming (spaces vs underscores)
 */
export const roleNameMapping: Record<string, Role> = {
  // Standard formats with underscores
  admin: "admin",
  manager: "manager",
  user: "user",
  regional_manager: "regional_manager",
  regional_officer: "regional_officer",
  claims_officer: "claims_officer",
  compliance_officer: "compliance_officer",
  hse_officer: "hse_officer",
  legal_officer: "legal_officer",
  inspection_officer: "inspection_officer",
  inspector_officer: "inspector_officer",
  branch_data_officer: "branch_data_officer",
  branch_officer: "branch_officer",
  actuary: "actuary",

  // Variants with spaces (common from backend)
  "regional officer": "regional_officer",
  "claims officer": "claims_officer",
  "compliance officer": "compliance_officer",
  "hse officer": "hse_officer",
  "legal officer": "legal_officer",
  "inspection officer": "inspection_officer",
  "inspector officer": "inspector_officer",
  "branch officer": "branch_officer",
  "branch data officer": "branch_data_officer",

  // Capitalized variants
  Admin: "admin",
  Manager: "manager",
  "Regional Officer": "regional_officer",
  "Legal Officer": "legal_officer",
  "Compliance Officer": "compliance_officer",
  "HSE Officer": "hse_officer",
  "Inspector Officer": "inspector_officer",
  "Inspection Officer": "inspection_officer",
  "Branch Officer": "branch_officer",
  Actuary: "actuary",
};

/**
 * Role-to-route mapping for login redirects
 * Maps standardized role identifiers to their default dashboard routes
 */
export const roleRouteMapping: Record<Role, string> = {
  admin: "/admin/dashboard",
  manager: "/admin/dashboard",
  user: "/admin/dashboard",
  regional_manager: "/admin/dashboard",
  regional_officer: "/admin/dashboard/compliance",
  branch_officer: "/branch/dashboard",
  branch_data_officer: "/branch/dashboard",
  legal_officer: "/admin/dashboard/legal",
  compliance_officer: "/admin/dashboard/compliance",
  inspection_officer: "/admin/dashboard/inspection",
  inspector_officer: "/admin/dashboard/inspection",
  hse_officer: "/admin/dashboard/hse",
  actuary: "/admin/dashboard/claims",
  claims_officer: "/admin/dashboard/claims",
};

/**
 * Role-to-module mapping for sidebar filtering
 * Maps standardized role identifiers to accessible modules
 */
export const roleModuleMapping: Record<Role, string[]> = {
  admin: [
    "dashboard",
    "users",
    "compliance",
    "legal",
    "hse",
    "claims",
    "inspection",
    "valuation",
    "risk",
    "investment",
  ],
  manager: [
    "dashboard",
    "users",
    "compliance",
    "legal",
    "hse",
    "claims",
    "inspection",
    "valuation",
    "risk",
    "investment",
  ],
  user: ["dashboard"],
  regional_manager: [
    "dashboard",
    "compliance",
    "legal",
    "hse",
    "claims",
    "inspection",
  ],
  regional_officer: ["compliance", "legal", "hse", "claims", "inspection"],
  legal_officer: ["legal"],
  compliance_officer: ["compliance"],
  inspection_officer: ["inspection"],
  inspector_officer: ["inspection"],
  hse_officer: ["hse"],
  actuary: ["claims"],
  claims_officer: ["claims"],
  branch_officer: [],
  branch_data_officer: [],
};

/**
 * Normalizes a role name to a standardized Role type
 * Handles various naming conventions (spaces, underscores, capitalization)
 */
export function normalizeRole(
  roleName: string | undefined | null
): Role | null {
  if (!roleName) return null;

  const normalized = roleName.toLowerCase().trim();
  return roleNameMapping[normalized] || null;
}

/**
 * Gets the default route for a given role
 * Returns null if role is invalid
 */
export function getRoleDefaultRoute(
  roleName: string | undefined | null
): string | null {
  const normalizedRole = normalizeRole(roleName);
  if (!normalizedRole) return null;

  return roleRouteMapping[normalizedRole] || null;
}

/**
 * Gets the allowed modules for a given role
 * Returns empty array if role is invalid
 */
export function getRoleModules(roleName: string | undefined | null): string[] {
  const normalizedRole = normalizeRole(roleName);
  if (!normalizedRole) return [];

  return roleModuleMapping[normalizedRole] || [];
}

/**
 * Checks if a role is valid
 */
export function isValidRole(roleName: string | undefined | null): boolean {
  const normalized = normalizeRole(roleName);
  return normalized !== null && validRoles.includes(normalized);
}

/**
 * Formats a role name for display
 * Converts underscores to spaces and capitalizes words
 */
export function formatRoleDisplay(roleName: string | undefined | null): string {
  if (!roleName) return "Unknown Role";

  return roleName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
