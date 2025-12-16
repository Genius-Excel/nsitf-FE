# Permission System Implementation - Complete Summary

## Overview

A complete permission management system has been implemented for the NSITF application. This system provides:

1. **Sidebar Filtering** - Hide pages from users without permission
2. **Action Button Disabling** - Gray out buttons for users without manage permission
3. **Permission Management UI** - Admin interface to assign/remove permissions
4. **Granular Permission Control** - Role-based + backend granular permissions

---

## What Was Implemented

### 1. New Hooks

#### `hooks/useCheckPermission.ts`

- Checks if user has `view_` and `manage_` permissions for a module
- Returns: `canView`, `canManage`, `loading`, `error`
- **Use for:** Page-level access control and button permission checks

```tsx
const { canView, canManage } = useCheckPermission("claims");
```

#### `hooks/useUserPermissions.ts`

- Fetches all user permissions from backend
- Returns: `permissions`, `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
- **Use for:** Granular permission checking and backend permission validation

```tsx
const { hasPermission } = useUserPermissions();
if (hasPermission("manage_users")) {
  /* ... */
}
```

#### `hooks/usePermissionManagement.ts` (Enhanced)

- Assign/remove permissions for users
- Returns: `assignPermissions()`, `removePermissions()`, `loading`, `error`, `success`
- **Use for:** Admin permission management operations

```tsx
const { assignPermissions } = usePermissionManagement();
```

#### `hooks/useCheckPermission.ts` (New)

- Quick permission check for view/manage on any module
- **Use for:** Quick permission validation

---

### 2. New Components

#### `components/permission-button.tsx`

- Button that automatically disables based on permission
- Shows tooltip with custom message when disabled
- **Use for:** All action buttons (create, edit, delete, etc.)

```tsx
<PermissionButton hasPermission={canManage}>Delete Record</PermissionButton>
```

#### `parts/admin/permissions/PermissionsComponent.tsx`

- Complete admin UI for permission management
- Features:
  - User search and selection
  - Permission selection with descriptions
  - Bulk assign/remove operations
  - Real-time feedback
- **Use for:** Admin dashboard permission management page

---

### 3. Enhanced Files

#### `lib/permissions.ts`

- Added helper functions for permission checking
- Maps frontend permissions to backend permissions
- Maintains role-based permission hierarchy

#### `services/apiRoutes/index.js`

- Added permission endpoints:
  - `getUserPermissions(userId)` - GET
  - `assignUserPermissions()` - POST
  - `removeUserPermissions()` - POST
  - `getAllPermissions()` - GET

---

### 4. Documentation

#### `PERMISSION_SYSTEM_GUIDE.md` (Comprehensive)

- Complete architecture overview
- Detailed API documentation
- Common use cases with examples
- Best practices and troubleshooting

#### `PERMISSION_EXAMPLES.md` (Real-world Examples)

- 8 complete example implementations
- Page-level permission checks
- Button disabling patterns
- Complete dashboard examples

#### `PERMISSION_QUICK_REFERENCE.md` (Quick Start)

- Quick reference for common tasks
- API endpoint quick reference
- Common patterns
- Troubleshooting guide

---

## How It Works

### Sidebar Filtering (Already Implemented)

1. User logs in → Role is stored
2. Sidebar filters navigation items by role
3. Items with matching roles appear
4. Other items are hidden

### Button Disabling (New)

1. Page checks `canManage` permission
2. Pass `hasPermission={canManage}` to `PermissionButton`
3. Button automatically:
   - Disabled if `false`
   - Enabled if `true`
   - Shows tooltip explaining why when disabled

### Permission Management (New)

1. Admin selects users and permissions
2. Clicks "Assign" or "Remove"
3. API updates backend permissions
4. Changes reflected immediately for next login
5. Existing sessions need refresh to see changes

---

## Implementation Flow

```
User Authentication
    ↓
Load User Role & Permissions
    ↓
Check Page Permissions (canView)
    ├─ No → Redirect to dashboard
    └─ Yes → Load page
    ↓
Render Components
    ├─ All users see view sections
    ├─ Check canManage for action buttons
    │   ├─ Has permission → Button enabled
    │   └─ No permission → Button disabled with tooltip
    └─ Render read-only or admin sections based on permission
```

---

## Usage Patterns

### Pattern 1: Basic Page-Level Check

```tsx
const { canView } = useCheckPermission("claims");
if (!canView) return <NoAccess />;
// Render page
```

### Pattern 2: Action Buttons

```tsx
const { canManage } = useCheckPermission("claims");
<PermissionButton hasPermission={canManage}>Delete</PermissionButton>;
```

### Pattern 3: Conditional Sections

```tsx
const { canManage } = useCheckPermission("hse");
return (
  <>
    <ViewSection />
    {canManage && <AdminSection />}
  </>
);
```

### Pattern 4: Granular Permissions

```tsx
const { hasPermission } = useUserPermissions();
if (hasPermission("manage_users")) {
  return <UserManagement />;
}
```

---

## Permission Naming Convention

### View Permissions

- `view_claims` - Can view claims pages
- `view_hse` - Can view HSE pages
- `view_compliance` - Can view compliance pages
- `view_inspection` - Can view inspection pages
- `view_legal` - Can view legal pages
- `view_dashboard` - Can view dashboard

### Manage Permissions

- `manage_claims` - Can create/edit/delete claims
- `manage_hse` - Can manage HSE records
- `manage_compliance` - Can manage compliance
- `manage_inspection` - Can manage inspections
- `manage_legal` - Can manage legal cases
- `manage_users` - Can manage users

---

## Module Names for useCheckPermission

```
dashboard, users, compliance, claims, hse, legal,
inspection, kpi, valuation, risk, investment
```

---

## API Integration

### Existing User Permissions Structure

```typescript
interface User {
  role: UserRole; // "admin", "manager", "claims_officer", etc.
  permissions?: string[]; // ["can_upload_claims", "can_edit_claims_record"]
}
```

### Backend API Response Format

```json
{
  "permissions": [
    "can_upload_claims",
    "can_create_claims_record",
    "can_edit_claims_record"
  ]
}
```

### Permission Assignment API

```json
POST /api/admin/users/permissions
{
  "action": "assign",
  "user_ids": ["uuid1", "uuid2"],
  "permission_ids": ["permission-uuid-1"]
}
```

---

## Migration Checklist

For existing pages to use the new permission system:

- [ ] Import `useCheckPermission` or `useUserPermissions`
- [ ] Check `canView` at page level
- [ ] Add `PermissionButton` to all action buttons
- [ ] Use `canManage` for conditional rendering of admin sections
- [ ] Handle loading states
- [ ] Test with different user roles
- [ ] Update page documentation

---

## Testing the System

### Manual Testing

1. Login as different user roles
2. Verify sidebar shows appropriate items
3. Try clicking disabled buttons
4. Verify tooltips appear
5. Test permission assignment in admin UI

### Automated Testing (Future)

```tsx
// Example test
test("claims button disabled for user without manage_claims", () => {
  render(<PermissionButton hasPermission={false}>Delete</PermissionButton>);
  expect(screen.getByRole("button")).toBeDisabled();
});
```

---

## Performance Considerations

- Permissions are cached after first fetch
- Use `refetch()` to manually refresh
- Sidebar filtering is memoized to avoid re-renders
- Permission checks are lightweight

---

## Security Notes

1. **Backend Validation** - Always validate permissions on backend
2. **Frontend is UI-Only** - Frontend permission checks are for UX only
3. **Never Trust Frontend** - Backend must validate all operations
4. **Audit Logs** - Log all permission changes for compliance

---

## Future Enhancements

Potential improvements for future versions:

1. **Time-based Permissions** - Permissions valid for specific periods
2. **Hierarchical Roles** - Role inheritance system
3. **Resource-level Permissions** - Permissions per object/resource
4. **Permission Expiry** - Auto-expire temporary permissions
5. **Audit Dashboard** - View permission change history
6. **Bulk Operations** - Import/export permissions as CSV

---

## Troubleshooting Guide

### Permissions Not Updating

- Clear browser localStorage
- Use `refetch()` from `useUserPermissions` hook
- Check network tab for API errors

### Buttons Still Disabled After Getting Permission

- Page might be cached
- User session might be old
- Need to refresh browser for non-SSR pages

### Sidebar Still Showing Hidden Items

- Clear browser cache
- Verify role is correct in localStorage
- Check navigation items configuration

### API Errors When Assigning Permissions

- Verify user IDs are valid UUIDs
- Verify permission IDs exist in system
- Check admin has necessary authorization

---

## File Structure Summary

```
hooks/
├── useCheckPermission.ts              ✨ NEW
├── useUserPermissions.ts              ✨ NEW
└── usePermissionManagement.ts         📝 ENHANCED

components/
├── permission-guard.tsx               (existing)
└── permission-button.tsx              ✨ NEW

parts/admin/permissions/
└── PermissionsComponent.tsx           ✨ NEW

lib/
└── permissions.ts                     📝 ENHANCED

services/
└── apiRoutes/index.js                 📝 ENHANCED

Documentation/
├── PERMISSION_SYSTEM_GUIDE.md         ✨ NEW
├── PERMISSION_EXAMPLES.md             ✨ NEW
├── PERMISSION_QUICK_REFERENCE.md      ✨ NEW
└── PERMISSION_IMPLEMENTATION.md       ✨ NEW (this file)
```

---

## Quick Start for Developers

1. **For Page Access:**

   ```tsx
   const { canView } = useCheckPermission("claims");
   ```

2. **For Buttons:**

   ```tsx
   import { PermissionButton } from "@/components/permission-button";
   <PermissionButton hasPermission={canManage}>Action</PermissionButton>;
   ```

3. **For Sections:**

   ```tsx
   import { PermissionGuard } from "@/components/permission-guard";
   <PermissionGuard permission="manage_users">
     <AdminUI />
   </PermissionGuard>;
   ```

4. **For Admin:**
   ```tsx
   import { PermissionManagementComponent } from "@/parts/admin/permissions/PermissionsComponent";
   <PermissionManagementComponent />;
   ```

---

## Support

For detailed documentation, see:

- `PERMISSION_SYSTEM_GUIDE.md` - Complete guide
- `PERMISSION_EXAMPLES.md` - Real-world examples
- `PERMISSION_QUICK_REFERENCE.md` - Quick reference

For questions, contact the development team.
