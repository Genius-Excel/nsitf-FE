/\*\*

- EXAMPLE IMPLEMENTATION - Permission System in Action
-
- This file demonstrates how to implement the permission system
- in various scenarios within your application.
  \*/

// ============================================================================
// EXAMPLE 1: Page-Level Permission Check
// ============================================================================

import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ClaimsPageExample() {
const router = useRouter();
const { canView, loading } = useCheckPermission("claims");

useEffect(() => {
if (!loading && !canView) {
router.push("/dashboard"); // Redirect if no access
}
}, [loading, canView, router]);

if (loading) return <div>Loading...</div>;
if (!canView) return null; // Or show access denied

return <div>Claims Dashboard Content</div>;
}

// ============================================================================
// EXAMPLE 2: Conditional Button Rendering with PermissionButton
// ============================================================================

import { PermissionButton } from "@/components/permission-button";
import { useCheckPermission } from "@/hooks/useCheckPermission";

export function ClaimsRecordActions() {
const { canManage } = useCheckPermission("claims");

return (
<div className="flex gap-2">
{/_ Only disabled if no permission _/}
<PermissionButton
hasPermission={canManage}
permissionMessage="You need manage claims permission to edit"
onClick={() => console.log("Edit claim")} >
Edit Claim
</PermissionButton>

      {/* Only disabled if no permission */}
      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You need manage claims permission to delete"
        onClick={() => console.log("Delete claim")}
        variant="destructive"
      >
        Delete Claim
      </PermissionButton>

      {/* Can conditionally show/hide based on permission */}
      {canManage && (
        <button onClick={() => console.log("Bulk action")}>
          Bulk Actions
        </button>
      )}
    </div>

);
}

// ============================================================================
// EXAMPLE 3: Using PermissionGuard for Sections
// ============================================================================

import { PermissionGuard } from "@/components/permission-guard";

export function ComplianceDashboard() {
return (
<div>
{/_ Always visible _/}
<div className="p-4">
<h2>Compliance Overview</h2>
<MetricCards />
</div>

      {/* Only visible if user has view_compliance permission */}
      <PermissionGuard permission="view_compliance">
        <div className="p-4">
          <h2>Detailed Compliance Report</h2>
          <ReportTable />
        </div>
      </PermissionGuard>

      {/* Show fallback if no permission */}
      <PermissionGuard
        permission="manage_compliance"
        fallback={
          <div className="p-4 bg-yellow-50 text-yellow-800">
            You don't have permission to manage compliance. Contact your admin.
          </div>
        }
      >
        <div className="p-4">
          <h2>Compliance Management</h2>
          <ComplianceEditor />
        </div>
      </PermissionGuard>
    </div>

);
}

// ============================================================================
// EXAMPLE 4: Using useUserPermissions for Granular Control
// ============================================================================

import { useUserPermissions } from "@/hooks/useUserPermissions";

export function AdminPanel() {
const { permissions, hasPermission, hasAnyPermission, hasAllPermissions, loading } = useUserPermissions();

if (loading) return <div>Loading permissions...</div>;

return (
<div className="space-y-6">
<h1>Admin Panel</h1>

      {/* Show section only if user has this specific permission */}
      {hasPermission("manage_users") && (
        <div>
          <h2>User Management</h2>
          <UserManagementSection />
        </div>
      )}

      {/* Show section if user has ANY of these permissions */}
      {hasAnyPermission(["manage_claims", "manage_hse", "manage_inspection"]) && (
        <div>
          <h2>Operations Management</h2>
          <OperationsSection />
        </div>
      )}

      {/* Show section only if user has ALL of these permissions */}
      {hasAllPermissions(["manage_compliance", "manage_users"]) && (
        <div>
          <h2>Compliance & User Management</h2>
          <CombinedManagement />
        </div>
      )}

      {/* Debug: Show all permissions */}
      <details>
        <summary>Current Permissions ({permissions.length})</summary>
        <ul className="mt-2 space-y-1">
          {permissions.map((perm) => (
            <li key={perm} className="text-sm">
              ✓ {perm}
            </li>
          ))}
        </ul>
      </details>
    </div>

);
}

// ============================================================================
// EXAMPLE 5: Combining Multiple Permission Checks
// ============================================================================

import { useCheckPermission } from "@/hooks/useCheckPermission";

export function ComplexDataTable({ data }) {
const { canView: canViewClaims, canManage: canManageClaims } = useCheckPermission("claims");
const { canView: canViewHSE, canManage: canManageHSE } = useCheckPermission("hse");

if (!canViewClaims && !canViewHSE) {
return <div>You don't have access to any data</div>;
}

return (
<div>
{canViewClaims && (
<div>
<h3>Claims Data</h3>
<Table
data={data.filter((d) => d.type === "claims")}
editable={canManageClaims}
/>
</div>
)}

      {canViewHSE && (
        <div>
          <h3>HSE Data</h3>
          <Table data={data.filter((d) => d.type === "hse")} editable={canManageHSE} />
        </div>
      )}
    </div>

);
}

// ============================================================================
// EXAMPLE 6: Using usePermissionManagement for Admin Functions
// ============================================================================

import { usePermissionManagement } from "@/hooks/usePermissionManagement";
import { useToast } from "@/hooks/use-toast";

export function AssignPermissionsForm({ selectedUsers, selectedPermissions }) {
const { toast } = useToast();
const { assignPermissions, loading, success } = usePermissionManagement();

const handleAssign = async () => {
const results = await assignPermissions(selectedUsers, selectedPermissions);

    const successful = results.filter((r) => r.status === "assigned").length;
    toast({
      title: "Permissions Assigned",
      description: `${successful} permissions assigned successfully`,
      variant: success ? "default" : "destructive",
    });

};

return (
<div>
<button onClick={handleAssign} disabled={loading}>
{loading ? "Assigning..." : "Assign Permissions"}
</button>
</div>
);
}

// ============================================================================
// EXAMPLE 7: Role-Based Component with Fallback
// ============================================================================

import { useCheckPermission } from "@/hooks/useCheckPermission";

interface ModuleCardProps {
moduleName: "claims" | "hse" | "inspection" | "compliance" | "legal";
title: string;
component: React.ComponentType;
restrictManagement?: boolean; // Only show if user can manage
}

export function ModuleCard({
moduleName,
title,
component: Component,
restrictManagement,
}: ModuleCardProps) {
const { canView, canManage, loading } = useCheckPermission(moduleName);

if (loading) return <div className="p-4">Loading...</div>;

// If restrictManagement is true, only show if user can manage
if (restrictManagement && !canManage) {
return (
<div className="p-4 bg-gray-50 text-gray-600">
You don't have permission to access {title} management
</div>
);
}

// If user can't view, don't show at all
if (!canView) {
return null;
}

return (
<div className="p-4 border rounded-lg">
<h3 className="font-bold mb-4">{title}</h3>
<Component />
{!canManage && (
<p className="mt-4 text-sm text-yellow-600">
You have read-only access. Contact admin for management access.
</p>
)}
</div>
);
}

// ============================================================================
// EXAMPLE 8: Complete Dashboard with Permission-Based Layout
// ============================================================================

export function PermissionAwareDashboard() {
const { canView: canViewClaims, canManage: canManageClaims } = useCheckPermission("claims");
const { canView: canViewHSE, canManage: canManageHSE } = useCheckPermission("hse");
const { canView: canViewCompliance, canManage: canManageCompliance } =
useCheckPermission("compliance");
const { canView: canViewInspection, canManage: canManageInspection } =
useCheckPermission("inspection");
const { canView: canViewLegal, canManage: canManageLegal } = useCheckPermission("legal");

return (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{/_ Claims Card _/}
{canViewClaims && (
<div className="p-4 border rounded-lg">
<h3>Claims Management</h3>
<ClaimsMetrics />
{canManageClaims && <ClaimsActions />}
</div>
)}

      {/* HSE Card */}
      {canViewHSE && (
        <div className="p-4 border rounded-lg">
          <h3>HSE Management</h3>
          <HSEMetrics />
          {canManageHSE && <HSEActions />}
        </div>
      )}

      {/* Compliance Card */}
      {canViewCompliance && (
        <div className="p-4 border rounded-lg">
          <h3>Compliance Management</h3>
          <ComplianceMetrics />
          {canManageCompliance && <ComplianceActions />}
        </div>
      )}

      {/* Inspection Card */}
      {canViewInspection && (
        <div className="p-4 border rounded-lg">
          <h3>Inspection Management</h3>
          <InspectionMetrics />
          {canManageInspection && <InspectionActions />}
        </div>
      )}

      {/* Legal Card */}
      {canViewLegal && (
        <div className="p-4 border rounded-lg">
          <h3>Legal Management</h3>
          <LegalMetrics />
          {canManageLegal && <LegalActions />}
        </div>
      )}
    </div>

);
}

// ============================================================================
// Placeholder Components (replace with actual components)
// ============================================================================

const MetricCards = () => <div>Metric Cards</div>;
const ReportTable = () => <div>Report Table</div>;
const ComplianceEditor = () => <div>Compliance Editor</div>;
const UserManagementSection = () => <div>User Management</div>;
const OperationsSection = () => <div>Operations</div>;
const CombinedManagement = () => <div>Combined Management</div>;
const Table = ({ data, editable }: any) => <div>Table with {data.length} rows</div>;
const AssignPermissionsModal = () => <div>Assign Permissions</div>;
const ClaimsMetrics = () => <div>Claims Metrics</div>;
const ClaimsActions = () => <div>Claims Actions</div>;
const HSEMetrics = () => <div>HSE Metrics</div>;
const HSEActions = () => <div>HSE Actions</div>;
const ComplianceMetrics = () => <div>Compliance Metrics</div>;
const ComplianceActions = () => <div>Compliance Actions</div>;
const InspectionMetrics = () => <div>Inspection Metrics</div>;
const InspectionActions = () => <div>Inspection Actions</div>;
const LegalMetrics = () => <div>Legal Metrics</div>;
const LegalActions = () => <div>Legal Actions</div>;
