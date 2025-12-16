# Permission System - Quick Reference

## What's New

A complete permission management system with:

- ✅ Sidebar filtering by permissions
- ✅ Action buttons disabled for users without manage permission
- ✅ Admin UI for permission management
- ✅ Role-based + granular permissions

---

## Quick Start

### 1. Check if user can view a page

```tsx
import { useCheckPermission } from "@/hooks/useCheckPermission";

const { canView } = useCheckPermission("claims");

if (!canView) return <div>No access</div>;
```

### 2. Disable buttons for non-managers

```tsx
import { PermissionButton } from "@/components/permission-button";
import { useCheckPermission } from "@/hooks/useCheckPermission";

const { canManage } = useCheckPermission("claims");

<PermissionButton hasPermission={canManage}>Delete Claim</PermissionButton>;
```

### 3. Hide sections without permission

```tsx
import { PermissionGuard } from "@/components/permission-guard";

<PermissionGuard permission="manage_hse">
  <AdminSection />
</PermissionGuard>;
```

---

## Files Added/Modified

### New Hooks

- `hooks/useCheckPermission.ts` - Check view/manage for modules
- `hooks/useUserPermissions.ts` - Get all user permissions
- `hooks/usePermissionManagement.ts` - Assign/remove permissions (enhanced)

### New Components

- `components/permission-button.tsx` - Disabled button with tooltip
- `parts/admin/permissions/PermissionsComponent.tsx` - Admin UI

### Updated Files

- `lib/permissions.ts` - Added helper functions
- `services/apiRoutes/index.js` - Added permission endpoints

### Documentation

- `PERMISSION_SYSTEM_GUIDE.md` - Comprehensive guide
- `PERMISSION_EXAMPLES.md` - Real-world examples
- `PERMISSION_QUICK_REFERENCE.md` - This file

---

## Module Names (for useCheckPermission)

```
"dashboard"   - Dashboard pages
"users"       - User management
"compliance"  - Compliance module
"claims"      - Claims & compensation
"hse"         - OSH/HSE module
"legal"       - Legal cases
"inspection"  - Inspections
"kpi"         - KPI Analytics
"valuation"   - Valuation & Forecasting
"risk"        - Risk Analysis
```

---

## Permission Naming Convention

- `view_{module}` - Can view the module (pages visible in sidebar)
- `manage_{module}` - Can create, edit, delete in the module

Example:

- `view_claims` - Can see claims pages
- `manage_claims` - Can create/edit/delete claims

---

## API Endpoints

### Assign Permissions

```bash
POST /api/admin/users/permissions
{
  "action": "assign",
  "user_ids": ["uuid1", "uuid2"],
  "permission_ids": ["perm1", "perm2"]
}
```

### Remove Permissions

```bash
POST /api/admin/users/permissions
{
  "action": "remove",
  "user_ids": ["uuid1"],
  "permission_ids": ["perm1"]
}
```

### Get User Permissions

```bash
GET /api/admin/users/{userId}/permissions
```

### Get All Permissions

```bash
GET /api/admin/permissions
```

---

## Common Patterns

### Pattern 1: Hide entire page

```tsx
const { canView, loading } = useCheckPermission("claims");
if (!loading && !canView) return <Redirect />;
```

### Pattern 2: Disable action buttons

```tsx
const { canManage } = useCheckPermission("claims");
return <PermissionButton hasPermission={canManage}>Delete</PermissionButton>;
```

### Pattern 3: Conditional sections

```tsx
const { canManage } = useCheckPermission("hse");
return canManage ? <AdminSection /> : <ViewOnlySection />;
```

### Pattern 4: Multiple permission check

```tsx
const { hasAllPermissions } = useUserPermissions();
if (hasAllPermissions(["manage_claims", "manage_hse"])) {
  return <Combined />;
}
```

---

## Testing Permissions

### For Admins

1. Go to Admin dashboard → Permission Management
2. Select users and permissions
3. Click "Assign Permissions"

### For Developers

1. Check browser DevTools → Application → localStorage
2. Look for user object with `permissions` array
3. Test with different roles by modifying localStorage

---

## Troubleshooting

| Issue                       | Solution                                  |
| --------------------------- | ----------------------------------------- |
| Sidebar items still showing | Clear browser cache, restart dev server   |
| Buttons not disabled        | Verify permission string is exact match   |
| API errors                  | Check network tab, verify endpoint URL    |
| Permissions not updating    | Use `refetch()` from `useUserPermissions` |

---

## Integration Checklist

For each page that needs permissions:

- [ ] Import `useCheckPermission`
- [ ] Check `canView` at page level
- [ ] Wrap action buttons with `PermissionButton`
- [ ] Use `canManage` for action availability
- [ ] Handle loading/error states
- [ ] Test with different user roles

---

## Example: Complete Integration

```tsx
"use client";

import { useCheckPermission } from "@/hooks/useCheckPermission";
import { PermissionButton } from "@/components/permission-button";
import { PermissionGuard } from "@/components/permission-guard";

export default function ClaimsPage() {
  const { canView, canManage, loading } = useCheckPermission("claims");

  // Redirect if no view access
  if (!loading && !canView) {
    return <div>You don't have access to claims</div>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Claims Management</h1>

      {/* Read-only section for all users with view_claims */}
      <div>
        <h2>Claims Overview</h2>
        <ClaimsTable />
      </div>

      {/* Admin actions section */}
      <PermissionGuard permission="manage_claims">
        <div>
          <h2>Management Actions</h2>
          <PermissionButton hasPermission={canManage}>
            Create Claim
          </PermissionButton>
          <PermissionButton hasPermission={canManage}>
            Bulk Upload
          </PermissionButton>
        </div>
      </PermissionGuard>
    </div>
  );
}
```

---

## Support & Questions

Refer to `PERMISSION_SYSTEM_GUIDE.md` for detailed documentation.
