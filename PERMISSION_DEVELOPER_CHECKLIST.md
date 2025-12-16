# Permission System - Implementation Checklist for Developers

Use this checklist when adding permission checks to a page or component.

## Prerequisites

- [ ] Understand the permission system (read `PERMISSION_SYSTEM_GUIDE.md`)
- [ ] Know your module name (claims, hse, inspection, compliance, legal, etc.)
- [ ] Understand view vs manage permissions

---

## Step 1: Page-Level Access Control

### For Read-Only Pages (view only, no actions)

```tsx
"use client";

import { useCheckPermission } from "@/hooks/useCheckPermission";

export default function MyPage() {
  const { canView, loading } = useCheckPermission("claims");

  if (loading) return <LoadingState />;
  if (!canView) return <AccessDenied />;

  return <div>Page Content</div>;
}
```

**Checklist:**

- [ ] Import `useCheckPermission` hook
- [ ] Call hook with correct module name
- [ ] Check `loading` state
- [ ] Redirect/show access denied if `!canView`
- [ ] Render page content

---

## Step 2: Add Action Buttons

### For Delete/Edit/Create Buttons

```tsx
"use client";

import { useCheckPermission } from "@/hooks/useCheckPermission";
import { PermissionButton } from "@/components/permission-button";

export default function MyPage() {
  const { canView, canManage, loading } = useCheckPermission("claims");

  if (loading) return <LoadingState />;
  if (!canView) return <AccessDenied />;

  return (
    <div>
      <Table data={data} />

      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You need manage_claims permission"
        onClick={() => handleEdit()}
      >
        Edit Record
      </PermissionButton>

      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You need manage_claims permission"
        onClick={() => handleDelete()}
        variant="destructive"
      >
        Delete Record
      </PermissionButton>
    </div>
  );
}
```

**Checklist:**

- [ ] Import `PermissionButton` component
- [ ] Pass `hasPermission={canManage}` to each button
- [ ] Add meaningful `permissionMessage`
- [ ] Test button is disabled when no permission
- [ ] Verify tooltip appears on hover

---

## Step 3: Conditional Sections

### For Admin-Only Sections

```tsx
import { PermissionGuard } from "@/components/permission-guard";

export default function MyPage() {
  return (
    <div>
      {/* Read-only section - visible to all with view permission */}
      <div>
        <h2>Overview</h2>
        <Metrics />
      </div>

      {/* Admin section - only visible with manage permission */}
      <PermissionGuard permission="manage_claims">
        <div>
          <h2>Administration</h2>
          <AdminControls />
        </div>
      </PermissionGuard>

      {/* Or use conditional rendering */}
      {canManage && (
        <div>
          <h2>Management</h2>
          <ManagementPanel />
        </div>
      )}
    </div>
  );
}
```

**Checklist:**

- [ ] Use `PermissionGuard` for sections requiring manage permission
- [ ] Or use `{canManage &&` for conditional rendering
- [ ] Test section is hidden when no permission
- [ ] Ensure read-only content still visible

---

## Step 4: Handle Errors & Loading

```tsx
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useToast } from "@/hooks/use-toast";

export default function MyPage() {
  const { canView, canManage, loading, error } = useCheckPermission("claims");
  const { toast } = useToast();

  // Handle loading state
  if (loading) {
    return <LoadingState />;
  }

  // Handle errors
  if (error) {
    console.error("Permission check error:", error);
    toast({
      title: "Error",
      description: "Failed to load permissions",
      variant: "destructive",
    });
    return <ErrorState />;
  }

  // Handle no access
  if (!canView) {
    return <AccessDeniedState />;
  }

  // Render content
  return <div>Page Content</div>;
}
```

**Checklist:**

- [ ] Handle `loading` state with spinner
- [ ] Handle `error` state with error message
- [ ] Handle `!canView` with access denied UI
- [ ] Log errors to console for debugging
- [ ] Show toast notifications for user feedback

---

## Step 5: Testing

### Manual Testing

```
Test Case 1: User with full permissions
- [ ] Page loads normally
- [ ] All buttons are enabled
- [ ] All sections are visible
- [ ] Can perform all actions

Test Case 2: User with view-only permission
- [ ] Page loads with view permission
- [ ] View content is visible
- [ ] All action buttons are disabled
- [ ] Tooltips appear on button hover
- [ ] Admin sections are hidden

Test Case 3: User with no permission
- [ ] Access denied message appears
- [ ] Redirect to dashboard
- [ ] No error in console

Test Case 4: Different user roles
- [ ] Test with admin
- [ ] Test with manager
- [ ] Test with role-specific user
- [ ] Test with regular user
```

### Automated Testing (Example)

```tsx
import { render, screen } from "@testing-library/react";

test("buttons are disabled without manage permission", () => {
  const { getByRole } = render(
    <PermissionButton hasPermission={false}>Delete</PermissionButton>
  );

  expect(getByRole("button")).toBeDisabled();
});

test("buttons are enabled with permission", () => {
  const { getByRole } = render(
    <PermissionButton hasPermission={true}>Delete</PermissionButton>
  );

  expect(getByRole("button")).not.toBeDisabled();
});
```

**Checklist:**

- [ ] Test all button states (enabled/disabled)
- [ ] Test all user roles
- [ ] Test loading states
- [ ] Test error handling
- [ ] Verify tooltips appear
- [ ] Verify sections show/hide correctly

---

## Step 6: Documentation

Add a comment at the top of your component:

```tsx
/**
 * MyPage Component
 *
 * Permissions Required:
 * - view_claims: To view this page
 * - manage_claims: To edit/delete claims
 *
 * Features:
 * - Read-only claims table for all users
 * - Edit/delete buttons disabled without manage permission
 * - Admin section hidden without manage permission
 */
```

**Checklist:**

- [ ] Document required permissions
- [ ] Document user-visible features
- [ ] Document permission-based features
- [ ] Add JSDoc comments for complex logic

---

## Common Module Names

| Module     | View Permission   | Manage Permission   |
| ---------- | ----------------- | ------------------- |
| Claims     | `view_claims`     | `manage_claims`     |
| HSE        | `view_hse`        | `manage_hse`        |
| Compliance | `view_compliance` | `manage_compliance` |
| Inspection | `view_inspection` | `manage_inspection` |
| Legal      | `view_legal`      | `manage_legal`      |
| Dashboard  | `view_dashboard`  | -                   |
| Users      | `view_users`      | `manage_users`      |

---

## Complete Example

```tsx
/**
 * Claims Page
 *
 * Requires:
 * - view_claims: To view this page and claims data
 * - manage_claims: To edit/delete claims (buttons disabled without)
 */

"use client";

import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useToast } from "@/hooks/use-toast";
import { PermissionButton } from "@/components/permission-button";
import { PermissionGuard } from "@/components/permission-guard";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { useState } from "react";

export default function ClaimsPage() {
  const { canView, canManage, loading, error } = useCheckPermission("claims");
  const { toast } = useToast();
  const [claims, setClaims] = useState([]);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    console.error("Permission error:", error);
    toast({
      title: "Error",
      description: "Failed to load permissions",
      variant: "destructive",
    });
    return <ErrorState />;
  }

  // No access
  if (!canView) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to view claims",
      variant: "destructive",
    });
    return <ErrorState title="Access Denied" />;
  }

  // Handle edit
  const handleEdit = (claimId: string) => {
    if (!canManage) {
      toast({
        title: "No Permission",
        description: "You don't have permission to edit claims",
        variant: "destructive",
      });
      return;
    }
    // Handle edit logic
  };

  // Handle delete
  const handleDelete = (claimId: string) => {
    if (!canManage) {
      toast({
        title: "No Permission",
        description: "You don't have permission to delete claims",
        variant: "destructive",
      });
      return;
    }
    // Handle delete logic
  };

  return (
    <div className="space-y-6">
      <h1>Claims Management</h1>

      {/* Read-only section - visible to all */}
      <div>
        <h2>Claims Overview</h2>
        <ClaimsTable claims={claims} />
      </div>

      {/* Management section - only visible with manage_claims */}
      <PermissionGuard permission="manage_claims">
        <div className="space-y-4">
          <h2>Management Actions</h2>

          <PermissionButton
            hasPermission={canManage}
            permissionMessage="You need manage_claims permission"
            onClick={() => handleNewClaim()}
          >
            New Claim
          </PermissionButton>

          <PermissionButton
            hasPermission={canManage}
            permissionMessage="You need manage_claims permission"
            onClick={() => handleImport()}
          >
            Bulk Import
          </PermissionButton>
        </div>
      </PermissionGuard>

      {/* Inline action buttons */}
      <div className="flex gap-2">
        <PermissionButton
          hasPermission={canManage}
          permissionMessage="Edit requires manage_claims permission"
          onClick={() => handleEdit("123")}
        >
          Edit Selected
        </PermissionButton>

        <PermissionButton
          hasPermission={canManage}
          permissionMessage="Delete requires manage_claims permission"
          onClick={() => handleDelete("123")}
          variant="destructive"
        >
          Delete Selected
        </PermissionButton>
      </div>
    </div>
  );
}
```

---

## Helpful Links

- **Full Guide**: `PERMISSION_SYSTEM_GUIDE.md`
- **Examples**: `PERMISSION_EXAMPLES.md`
- **Quick Ref**: `PERMISSION_QUICK_REFERENCE.md`
- **Implementation Details**: `PERMISSION_IMPLEMENTATION.md`

---

## Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section in `PERMISSION_QUICK_REFERENCE.md`
2. Review an example in `PERMISSION_EXAMPLES.md`
3. Read the full guide `PERMISSION_SYSTEM_GUIDE.md`
4. Check browser DevTools console for errors
5. Ask your team lead or create an issue

---

**Ready to implement? Start with Step 1 and work through each step.**
