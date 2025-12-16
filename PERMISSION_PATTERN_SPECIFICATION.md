# Permission System Implementation Pattern - All Pages

## Overview

This document defines the standard permission pattern that ALL pages/modules must follow for consistency.

## Pattern Structure

### 1. Functional Component (e.g., ClaimsFunc.tsx)

```tsx
"use client";

import { useCheckPermission } from "@/hooks/useCheckPermission";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { ClaimsDesign } from "./claimsDesign";
import { useState, useEffect } from "react";

/**
 * Claims Module - Functional Container
 *
 * Permissions Required:
 * - view_claims: Required to view this page
 * - manage_claims: Required for create/edit/delete operations
 */
export function ClaimsFunc() {
  // 1. Check permissions
  const {
    canView,
    canManage,
    loading: permissionLoading,
  } = useCheckPermission("claims");

  // 2. Page-level access control
  if (permissionLoading) {
    return <LoadingState />;
  }

  if (!canView) {
    return (
      <ErrorState
        title="Access Denied"
        description="You don't have permission to view claims"
      />
    );
  }

  // 3. Fetch data hook (existing)
  const { data, loading, error } = useClaimsDashboard();

  // 4. Pass both data and permission state to design component
  return (
    <ClaimsDesign
      data={data}
      loading={loading}
      error={error}
      canManage={canManage}
    />
  );
}
```

### 2. Design Component (e.g., ClaimsDesign.tsx)

```tsx
"use client";

import { PermissionButton } from "@/components/permission-button";
import { PermissionGuard } from "@/components/permission-guard";

interface ClaimsDesignProps {
  data: any;
  loading: boolean;
  error: string | null;
  canManage: boolean; // Passed from functional component
}

/**
 * Claims Module - Design/UI Component
 *
 * Receives canManage prop from functional component
 */
export function ClaimsDesign({
  data,
  loading,
  error,
  canManage,
}: ClaimsDesignProps) {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1>Claims Management</h1>

      {/* Read-only section - visible to all with view_claims */}
      <div>
        <h2>Claims Overview</h2>
        <ClaimsTable data={data} />
      </div>

      {/* Management actions - only visible if user has manage_claims */}
      <PermissionGuard permission="manage_claims">
        <div className="space-y-4">
          <h2>Management Actions</h2>

          {/* Use PermissionButton for all action buttons */}
          <PermissionButton
            hasPermission={canManage}
            permissionMessage="You need manage_claims permission to create claims"
            onClick={() => handleCreate()}
          >
            Create Claim
          </PermissionButton>

          <PermissionButton
            hasPermission={canManage}
            permissionMessage="You need manage_claims permission to upload claims"
            onClick={() => handleUpload()}
          >
            Bulk Upload
          </PermissionButton>
        </div>
      </PermissionGuard>

      {/* Table action buttons */}
      <div className="space-y-4">
        {data.map((claim) => (
          <ClaimRow key={claim.id} claim={claim} canManage={canManage} />
        ))}
      </div>
    </div>
  );
}

function ClaimRow({ claim, canManage }) {
  return (
    <div className="flex gap-2">
      <span>{claim.name}</span>

      {/* Disable buttons if user can't manage */}
      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You need manage_claims permission to edit"
        onClick={() => handleEdit(claim.id)}
      >
        Edit
      </PermissionButton>

      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You need manage_claims permission to delete"
        onClick={() => handleDelete(claim.id)}
        variant="destructive"
      >
        Delete
      </PermissionButton>
    </div>
  );
}
```

---

## Standard Module Names & Permission Pairs

| Module     | View Permission   | Manage Permission   | Module Key   |
| ---------- | ----------------- | ------------------- | ------------ |
| Claims     | `view_claims`     | `manage_claims`     | "claims"     |
| HSE        | `view_hse`        | `manage_hse`        | "hse"        |
| Compliance | `view_compliance` | `manage_compliance` | "compliance" |
| Inspection | `view_inspection` | `manage_inspection` | "inspection" |
| Legal      | `view_legal`      | `manage_legal`      | "legal"      |
| KPI        | `view_kpi`        | `manage_kpi`        | "kpi"        |
| Valuation  | `view_valuation`  | `manage_valuation`  | "valuation"  |
| Risk       | `view_risk`       | `manage_risk`       | "risk"       |
| Investment | `view_investment` | `manage_investment` | "investment" |

---

## Implementation Checklist for Each Module

Use this checklist when implementing permissions for a new module:

### Functional Component (e.g., ClaimsFunc.tsx)

- [ ] Import `useCheckPermission` hook
- [ ] Import `LoadingState` and `ErrorState` components
- [ ] Call `useCheckPermission("module_name")` with correct module
- [ ] Check `permissionLoading` state
- [ ] Redirect/show error if `!canView`
- [ ] Pass `canManage` to design component
- [ ] Add JSDoc comment documenting required permissions

### Design Component (e.g., ClaimsDesign.tsx)

- [ ] Accept `canManage` as prop in interface
- [ ] Import `PermissionButton` component
- [ ] Import `PermissionGuard` component
- [ ] Use `PermissionGuard` for admin-only sections
- [ ] Use `PermissionButton` for all action buttons
- [ ] Add meaningful `permissionMessage` to each button
- [ ] Handle both view and manage scenarios
- [ ] Add JSDoc comment documenting required permissions

### Testing

- [ ] Test with user having view-only permission
- [ ] Test with user having manage permission
- [ ] Test with user having no permission
- [ ] Verify buttons disabled/enabled correctly
- [ ] Verify sections show/hide correctly
- [ ] Verify tooltips appear on disabled buttons

---

## Common Patterns

### Pattern 1: Simple Admin Section

```tsx
<PermissionGuard permission="manage_claims">
  <AdminSection />
</PermissionGuard>
```

### Pattern 2: Individual Action Buttons

```tsx
<PermissionButton hasPermission={canManage} permissionMessage="...">
  Edit
</PermissionButton>
```

### Pattern 3: Conditional Rendering

```tsx
{
  canManage && <AdminControls />;
}
```

### Pattern 4: Section with Multiple Buttons

```tsx
<PermissionGuard permission="manage_claims">
  <div>
    <PermissionButton hasPermission={canManage}>Create</PermissionButton>
    <PermissionButton hasPermission={canManage}>Import</PermissionButton>
    <PermissionButton hasPermission={canManage}>Export</PermissionButton>
  </div>
</PermissionGuard>
```

---

## Modules to Update (Priority Order)

### High Priority (Core Modules)

1. **Claims** (`parts/admin/claims/`)

   - Module: "claims"
   - Files: ClaimsFunc.tsx, ClaimsDesign.tsx

2. **HSE** (`parts/admin/hse/`)

   - Module: "hse"
   - Files: hseFunc.tsx, hseDesign.tsx

3. **Compliance** (`parts/admin/compliance/`)

   - Module: "compliance"
   - Files: complianceFunc.tsx, complianceDesign.tsx

4. **Inspection** (`parts/admin/inspection/`)
   - Module: "inspection"
   - Files: inspectionManagement_func.tsx, inspectionDesign.tsx

### Medium Priority (Specialized Modules)

5. **Legal** (`parts/admin/legal/`)

   - Module: "legal"

6. **Valuation** (`parts/admin/valuation/`)

   - Module: "valuation"

7. **KPI** (`parts/admin/kpi/`)
   - Module: "kpi"

### Lower Priority

8. **Risk** (`parts/admin/risk/`)

   - Module: "risk"

9. **Investment** (`parts/admin/investment/`)
   - Module: "investment"

---

## Implementation Guide

### Step 1: Identify the Functional & Design Components

- Find the main functional component (usually `*Func.tsx`)
- Find the design component (usually `*Design.tsx`)

### Step 2: Update Functional Component

1. Import `useCheckPermission` hook
2. Call hook with module name
3. Check permissions before rendering
4. Pass `canManage` to design component

### Step 3: Update Design Component

1. Accept `canManage` as prop
2. Wrap admin sections with `PermissionGuard`
3. Replace action buttons with `PermissionButton`
4. Add `permissionMessage` to each button

### Step 4: Test

1. Test with different user roles
2. Verify buttons disable correctly
3. Verify sections show/hide correctly

---

## Quick Reference - Module Mapping

```
CLAIMS
  └─ parts/admin/claims/
     ├─ ClaimsFunc.tsx (add useCheckPermission)
     ├─ ClaimsDesign.tsx (add canManage prop)
     └─ Module: "claims"

HSE
  └─ parts/admin/hse/
     ├─ hseFunc.tsx (add useCheckPermission)
     ├─ hseDesign.tsx (add canManage prop)
     └─ Module: "hse"

COMPLIANCE
  └─ parts/admin/compliance/
     ├─ complianceFunc.tsx (add useCheckPermission)
     ├─ complianceDesign.tsx (add canManage prop)
     └─ Module: "compliance"

INSPECTION
  └─ parts/admin/inspection/
     ├─ inspectionManagement_func.tsx (add useCheckPermission)
     ├─ inspectionDesign.tsx (add canManage prop)
     └─ Module: "inspection"

LEGAL
  └─ parts/admin/legal/
     ├─ legalFunc.tsx (add useCheckPermission)
     ├─ legalDesign.tsx (add canManage prop)
     └─ Module: "legal"

VALUATION
  └─ parts/admin/valuation/
     ├─ valuationFunc.tsx (add useCheckPermission)
     ├─ valuationDesign.tsx (add canManage prop)
     └─ Module: "valuation"

KPI
  └─ parts/admin/kpi/
     ├─ kpiAnalyticsFunc.tsx (add useCheckPermission)
     ├─ kpiAnalyticsDesign.tsx (add canManage prop)
     └─ Module: "kpi"
```

---

## File Template

When adding permissions to a module:

```tsx
/**
 * [ModuleName] - Functional Container
 *
 * Permissions Required:
 * - view_[module]: Required to view this page
 * - manage_[module]: Required for create/edit/delete operations
 *
 * Access Pattern:
 * 1. Users without view_[module] see "Access Denied"
 * 2. Users with view_[module] but no manage_[module] see view-only content
 * 3. Users with manage_[module] see full content with action buttons
 */
```

---

## Summary

- **Every module should follow the same pattern**
- **Functional component handles permissions**
- **Design component receives canManage prop**
- **Use PermissionButton for all action buttons**
- **Use PermissionGuard for admin-only sections**
- **Add meaningful permission messages to buttons**
- **Test with different user roles**

This ensures consistency across the entire application!
