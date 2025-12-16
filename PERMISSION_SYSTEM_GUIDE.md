# Permission System Implementation Guide

## Overview

This guide explains how to use the new granular permission system in the NSITF application. The system allows:

1. **Sidebar Filtering** - Pages not visible to users without permission
2. **Action Button Disabling** - Buttons grayed out for users without manage permissions
3. **Permission Management UI** - Admin interface to assign/remove permissions

---

## Architecture

### Permission Hierarchy

```
User Role (e.g., "claims_officer")
    ↓
Role-Based Permissions (e.g., ["view_claims", "manage_claims"])
    ↓
Backend Granular Permissions (e.g., ["can_upload_claims", "can_edit_claims_record"])
```

The system first checks role-based permissions, then can be enhanced with backend granular permissions.

---

## Features

### 1. Sidebar Navigation Filtering

The sidebar automatically filters navigation items based on the user's role. Items not accessible to the user are hidden.

**File:** `components/app-sidebar.tsx`

The `filteredNavItems` already handles this:

```tsx
const filteredNavItems = useMemo(() => {
  return navigationItems.filter(
    (item) =>
      !item.roles ||
      (user?.role &&
        validRoles.includes(user.role as Role) &&
        item.roles.includes(user.role as Role))
  );
}, [user?.role]);
```

---

### 2. Permission-Based Button Disabling

Use the `PermissionButton` component to automatically disable buttons for users without the required permission.

**File:** `components/permission-button.tsx`

#### Basic Usage

```tsx
import { PermissionButton } from "@/components/permission-button";
import { useCheckPermission } from "@/hooks/useCheckPermission";

export function ClaimsPage() {
  const { canManage } = useCheckPermission("claims");

  return (
    <div>
      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You don't have permission to manage claims"
        onClick={() => handleDelete()}
      >
        Delete Claim
      </PermissionButton>
    </div>
  );
}
```

#### With Permission Hook

```tsx
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PermissionButton } from "@/components/permission-button";

export function MyComponent() {
  const { hasPermission } = useUserPermissions();

  return (
    <PermissionButton
      hasPermission={hasPermission("manage_hse")}
      permissionMessage="You need 'manage HSE' permission"
    >
      Create HSE Record
    </PermissionButton>
  );
}
```

---

### 3. Using PermissionGuard Component

Use the existing `PermissionGuard` component to hide entire sections based on permissions.

**File:** `components/permission-guard.tsx`

```tsx
import { PermissionGuard } from "@/components/permission-guard";

export function DashboardSection() {
  return (
    <PermissionGuard
      permission="manage_compliance"
      fallback={<div>You don't have access to this section</div>}
    >
      <ComplianceEditor />
    </PermissionGuard>
  );
}
```

---

### 4. Using useCheckPermission Hook

Check if a user has view and/or manage permissions for a module.

**File:** `hooks/useCheckPermission.ts`

```tsx
import { useCheckPermission } from "@/hooks/useCheckPermission";

export function InspectionDashboard() {
  const { canView, canManage, loading, error } =
    useCheckPermission("inspection");

  if (loading) return <div>Loading...</div>;
  if (!canView) return <div>No access to inspections</div>;

  return (
    <div>
      {canManage && <button>Create Inspection</button>}
      {/* Rest of component */}
    </div>
  );
}
```

---

### 5. Using useUserPermissions Hook

Get and check specific permissions from the backend.

**File:** `hooks/useUserPermissions.ts`

```tsx
import { useUserPermissions } from "@/hooks/useUserPermissions";

export function AdminPanel() {
  const { permissions, hasPermission, hasAllPermissions, loading } =
    useUserPermissions();

  if (loading) return <div>Loading permissions...</div>;

  return (
    <div>
      {hasPermission("manage_users") && <UserManagementSection />}
      {hasPermission("manage_compliance") && <ComplianceManagement />}

      {hasAllPermissions(["manage_claims", "manage_hse"]) && (
        <CombinedManagementSection />
      )}
    </div>
  );
}
```

---

### 6. Permission Management UI

Admins can use the permission management interface to assign/remove permissions for users.

**File:** `parts/admin/permissions/PermissionsComponent.tsx`

#### To add to your admin dashboard:

```tsx
import { PermissionManagementComponent } from "@/parts/admin/permissions/PermissionsComponent";

export default function AdminPage() {
  return (
    <div>
      <PermissionManagementComponent />
    </div>
  );
}
```

The UI provides:

- User selection with search
- Permission selection by category
- Bulk assign/remove operations
- Real-time feedback on success/failure

---

## Using usePermissionManagement Hook

For programmatic permission assignment/removal.

**File:** `hooks/usePermissionManagement.ts`

```tsx
import { usePermissionManagement } from "@/hooks/usePermissionManagement";

export function UserPermissionsForm({ userId, permissionIds }) {
  const { assignPermissions, removePermissions, loading, success } =
    usePermissionManagement();

  const handleAssign = async () => {
    const results = await assignPermissions([userId], permissionIds);
    console.log("Assignment results:", results);
  };

  const handleRemove = async () => {
    const results = await removePermissions([userId], permissionIds);
    console.log("Removal results:", results);
  };

  return (
    <div>
      <button onClick={handleAssign} disabled={loading}>
        Assign
      </button>
      <button onClick={handleRemove} disabled={loading}>
        Remove
      </button>
      {success && <p>Operation successful!</p>}
    </div>
  );
}
```

---

## API Endpoints

### Get User Permissions

```
GET /api/admin/users/{userId}/permissions
```

Response:

```json
{
  "permissions": ["can_upload_claims", "can_create_claims_record"]
}
```

### Assign/Remove Permissions

```
POST /api/admin/users/permissions
```

Request:

```json
{
  "action": "assign",
  "user_ids": ["user-id-1", "user-id-2"],
  "permission_ids": ["permission-id-1", "permission-id-2"]
}
```

Response:

```json
{
  "message": "Permissions assign operation completed successfully",
  "results": [
    {
      "user": "user-id-1",
      "permission": "permission-id-1",
      "status": "assigned"
    }
  ]
}
```

### Get All Permissions

```
GET /api/admin/permissions
```

Response:

```json
{
  "permissions": [
    {
      "id": "perm-id-1",
      "name": "can_upload_claims",
      "description": "Can upload claims data",
      "module": "claims"
    }
  ]
}
```

---

## Common Use Cases

### 1. Hide/Show Module Based on View Permission

```tsx
import { useCheckPermission } from "@/hooks/useCheckPermission";

export function ModuleCard({ moduleName, module }) {
  const { canView } = useCheckPermission(moduleName);

  if (!canView) return null;

  return <div>{module}</div>;
}
```

### 2. Disable Action Buttons

```tsx
import { PermissionButton } from "@/components/permission-button";
import { useCheckPermission } from "@/hooks/useCheckPermission";

export function RecordActions({ record }) {
  const { canManage } = useCheckPermission("claims");

  return (
    <div className="flex gap-2">
      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You don't have permission to edit"
      >
        Edit
      </PermissionButton>

      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You don't have permission to delete"
      >
        Delete
      </PermissionButton>
    </div>
  );
}
```

### 3. Role-Based Conditional Rendering

```tsx
import { useCheckPermission } from "@/hooks/useCheckPermission";

export function DashboardMetrics() {
  const { canManage: canManageAll } = useCheckPermission("dashboard");

  return (
    <div>
      {/* Always visible */}
      <MetricCard />

      {/* Only visible if user can manage */}
      {canManageAll && <AdminMetric />}
    </div>
  );
}
```

---

## Implementation Checklist

To implement permissions in a new module/page:

- [ ] Import `useCheckPermission` hook
- [ ] Check `canView` permission at the page level
- [ ] Check `canManage` permission for action buttons
- [ ] Use `PermissionButton` for all action buttons
- [ ] Use `PermissionGuard` for sections needing special access
- [ ] Handle loading and error states
- [ ] Test with different user roles

---

## Best Practices

1. **Always check `canView`** - Hide entire pages from users without view permission
2. **Disable buttons for manage** - Show UI but disable buttons for users without manage permission
3. **Show meaningful messages** - Provide tooltips explaining why actions are disabled
4. **Cache permissions** - The hooks cache permissions to avoid repeated API calls
5. **Handle loading states** - Always handle the `loading` state in permission checks
6. **Test thoroughly** - Test with different user roles and permission combinations

---

## Troubleshooting

### Permissions not updating

- Clear browser cache and localStorage
- Refetch permissions using the `refetch()` method from `useUserPermissions`
- Check the browser console for API errors

### Buttons always disabled

- Verify the permission string matches exactly (case-sensitive)
- Check that the user role has the permission in `lib/permissions.ts`
- Verify the backend is returning permissions in the API response

### Sidebar items still showing

- Clear the sidebar cache
- Verify the user role is in the `roles` array for the navigation item
- Check `app-sidebar.tsx` `filteredNavItems` logic

---

## File Structure

```
hooks/
  ├── useCheckPermission.ts          # Check view/manage for modules
  ├── useUserPermissions.ts          # Get all user permissions
  └── usePermissionManagement.ts     # Assign/remove permissions

components/
  ├── permission-guard.tsx           # Hide sections based on permissions
  └── permission-button.tsx          # Disable buttons based on permissions

parts/admin/permissions/
  └── PermissionsComponent.tsx       # Admin permission management UI

lib/
  └── permissions.ts                 # Role-permission mappings
```

---

## Support

For issues or questions about the permission system, contact your development team.
