# Permission System - Module-by-Module Implementation Guide

## Quick Start: 3 Steps for Each Module

### Step 1: Update Functional Component

Add permission check at the top of `*Func.tsx`:

```tsx
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { PermissionButton } from "@/components/permission-button";
import { PermissionGuard } from "@/components/permission-guard";

export default function YourModule() {
  // Add this section right after imports and before other hooks
  const {
    canView,
    canManage,
    loading: permissionLoading,
  } = useCheckPermission("your_module");

  if (permissionLoading) {
    return <LoadingState />;
  }

  if (!canView) {
    return (
      <ErrorState
        title="Access Denied"
        description="You don't have permission to view this module"
      />
    );
  }

  // Rest of your component...
}
```

### Step 2: Pass canManage to Design Component

Update where you pass props to `*Design.tsx`:

```tsx
// Before: <YourDesignComponent data={data} />

// After: Add canManage prop
<YourDesignComponent
  data={data}
  loading={loading}
  error={error}
  canManage={canManage} // <- Add this
/>
```

### Step 3: Update Design Component to Use canManage

In `*Design.tsx`, update components with action buttons:

```tsx
interface YourDesignProps {
  data: any;
  loading: boolean;
  error: string | null;
  canManage: boolean; // <- Add this prop
}

export function YourDesign({
  data,
  loading,
  error,
  canManage,
}: YourDesignProps) {
  return (
    <div>
      {/* View-only section - for all users */}
      <ViewSection />

      {/* Admin section - only for users with manage permission */}
      <PermissionGuard permission="manage_your_module">
        <AdminSection />
      </PermissionGuard>

      {/* Action buttons - disabled if no manage permission */}
      <PermissionButton
        hasPermission={canManage}
        permissionMessage="You need manage_your_module permission"
      >
        Edit
      </PermissionButton>
    </div>
  );
}
```

---

## Module-by-Module Checklist

### 1. CLAIMS (`parts/admin/claims/`)

**Status**: ✅ PARTIALLY DONE
**Files to Update**:

- [x] ClaimsFunc.tsx - Added permission check
- [ ] ClaimsDesign.tsx - Update all action buttons
- [ ] ClaimModal.tsx - Add PermissionButton to modal actions
- [ ] ClaimsUploadModal.tsx - Add canManage check

**Module Name**: `"claims"`
**Permissions**: `view_claims`, `manage_claims`

**Action Items**:

```
- [ ] Import PermissionButton in ClaimsDesign.tsx
- [ ] Import PermissionGuard in ClaimsDesign.tsx
- [ ] Replace delete buttons with <PermissionButton hasPermission={canManage}>
- [ ] Replace edit buttons with <PermissionButton hasPermission={canManage}>
- [ ] Wrap admin sections with <PermissionGuard permission="manage_claims">
- [ ] Test with view-only user
- [ ] Test with manage user
```

---

### 2. HSE (`parts/admin/hse/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] hseFunc.tsx - Add permission check
- [ ] hseDesign.tsx - Add canManage prop and use it
- [ ] hseModal.tsx - Update buttons
- [ ] hseUploadModal.tsx - Update buttons

**Module Name**: `"hse"`
**Permissions**: `view_hse`, `manage_hse`

**Quick Implementation**:

```tsx
// In hseFunc.tsx
const {
  canView,
  canManage,
  loading: permissionLoading,
} = useCheckPermission("hse");

if (permissionLoading) return <LoadingState />;
if (!canView) return <ErrorState title="Access Denied" />;

// Pass to design component
<hseDesign data={data} canManage={canManage} />;
```

---

### 3. COMPLIANCE (`parts/admin/compliance/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] complianceFunc.tsx - Add permission check
- [ ] complianceDesign.tsx - Add canManage prop
- [ ] complianceDetailModal.tsx - Update buttons
- [ ] Other modal files - Update buttons

**Module Name**: `"compliance"`
**Permissions**: `view_compliance`, `manage_compliance`

---

### 4. INSPECTION (`parts/admin/inspection/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] inspectionManagement_func.tsx - Add permission check
- [ ] inspectionDesign.tsx - Add canManage prop
- [ ] inspectionModal.tsx - Update buttons
- [ ] inspectionUploadModal.tsx - Update buttons

**Module Name**: `"inspection"`
**Permissions**: `view_inspection`, `manage_inspection`

---

### 5. LEGAL (`parts/admin/legal/`)

**Status**: ⏳ NOT STARTED
**Files to Check**:

- [ ] Check if legal module exists in parts/admin/
- [ ] Add permission check
- [ ] Update design components

**Module Name**: `"legal"`
**Permissions**: `view_legal`, `manage_legal`

---

### 6. VALUATION (`parts/admin/valuation/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] valuationFunc.tsx - Add permission check
- [ ] valuationDesign.tsx - Add canManage prop

**Module Name**: `"valuation"`
**Permissions**: `view_valuation`, `manage_valuation`

---

### 7. KPI (`parts/admin/kpi/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] kpiAnalyticsFunc.tsx - Add permission check
- [ ] Related design files

**Module Name**: `"kpi"`
**Permissions**: `view_kpi`, `manage_kpi`

---

### 8. RISK (`parts/admin/risk/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] Risk module files

**Module Name**: `"risk"`
**Permissions**: `view_risk`, `manage_risk`

---

### 9. INVESTMENT (`parts/admin/investment/`)

**Status**: ⏳ NOT STARTED
**Files to Update**:

- [ ] Investment module files

**Module Name**: `"investment"`
**Permissions**: `view_investment`, `manage_investment`

---

## Implementation Template

Copy this template for each module:

```tsx
// ============================================================================
// [ModuleName]Func.tsx - FUNCTIONAL COMPONENT
// ============================================================================

import { useCheckPermission } from "@/hooks/useCheckPermission";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { PermissionButton } from "@/components/permission-button";
import { PermissionGuard } from "@/components/permission-guard";

/**
 * [Module Name] Module - Functional Container
 *
 * Permissions Required:
 * - view_[module]: Required to view this page
 * - manage_[module]: Required for create/edit/delete/upload operations
 */
export default function [ModuleName]Management() {
  // Permission check
  const { canView, canManage, loading: permissionLoading } = useCheckPermission("[module]");

  if (permissionLoading) return <LoadingState />;
  if (!canView) return <ErrorState title="Access Denied" />;

  // Your existing hooks...
  const { data, loading, error } = useYourDataHook();

  return (
    <[ModuleName]Design
      data={data}
      loading={loading}
      error={error}
      canManage={canManage}  // <- Pass this
    />
  );
}
```

```tsx
// ============================================================================
// [ModuleName]Design.tsx - DESIGN/UI COMPONENT
// ============================================================================

interface [ModuleName]DesignProps {
  data: any;
  loading: boolean;
  error: string | null;
  canManage: boolean;  // <- Add this
}

export function [ModuleName]Design({
  data,
  loading,
  error,
  canManage,  // <- Destructure this
}: [ModuleName]DesignProps) {
  return (
    <div className="space-y-6">
      <h1>[Module Name] Management</h1>

      {/* View-only section */}
      <div>
        <ViewComponent data={data} />
      </div>

      {/* Admin section */}
      <PermissionGuard permission="manage_[module]">
        <AdminComponent canManage={canManage} />
      </PermissionGuard>

      {/* Action buttons */}
      <PermissionButton hasPermission={canManage} permissionMessage="...">
        Action
      </PermissionButton>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Disabled Upload Button

```tsx
<PermissionButton
  hasPermission={canManage}
  permissionMessage="You need manage permission to upload data"
  onClick={handleUpload}
>
  Upload Data
</PermissionButton>
```

### Pattern 2: Hidden Admin Section

```tsx
<PermissionGuard permission="manage_module">
  <div className="p-4 bg-gray-50 rounded-lg">
    <h3>Admin Controls</h3>
    {/* Admin UI here */}
  </div>
</PermissionGuard>
```

### Pattern 3: Conditional Render

```tsx
{
  canManage && (
    <div>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### Pattern 4: Table Row Actions

```tsx
{
  data.map((item) => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td className="flex gap-2">
        <PermissionButton hasPermission={canManage}>Edit</PermissionButton>
        <PermissionButton hasPermission={canManage} variant="destructive">
          Delete
        </PermissionButton>
      </td>
    </tr>
  ));
}
```

---

## Testing Checklist for Each Module

After implementing permissions for a module:

- [ ] Test with user having NO permission

  - [ ] Page shows "Access Denied"
  - [ ] Cannot see in sidebar

- [ ] Test with user having view-only permission

  - [ ] Page loads
  - [ ] Can see read-only content
  - [ ] All buttons are disabled
  - [ ] Tooltips show when hovering over disabled buttons
  - [ ] Admin sections are hidden

- [ ] Test with user having manage permission
  - [ ] Page loads normally
  - [ ] Can see all content
  - [ ] All buttons are enabled
  - [ ] Admin sections are visible
  - [ ] Can perform all actions

---

## Priority Implementation Order

### Week 1 (High Priority)

1. ✅ Claims - STARTED
2. HSE - START HERE NEXT
3. Compliance - THEN HERE
4. Inspection - THEN HERE

### Week 2 (Medium Priority)

5. Legal
6. Valuation
7. KPI

### Week 3+ (Lower Priority)

8. Risk
9. Investment
10. Other modules

---

## Tools & Resources

**Copy-Paste Template**: Use the template section above for each module

**Components to Use**:

- `useCheckPermission(module)` - Get canView, canManage
- `<PermissionButton>` - Disabled button with tooltip
- `<PermissionGuard>` - Hide section without permission
- `<LoadingState>` - Show while loading permissions
- `<ErrorState>` - Show access denied message

**Module Names**: See the checklist section above for each module's name

**Reference Implementation**: Claims module is done (partially) - use as guide

---

## Questions?

1. **How do I know which buttons to disable?** - Any button that creates, edits, or deletes should use `manage_` permission
2. **How do I test permissions?** - Use different user roles and check browser localStorage
3. **What if a component is nested deeply?** - Pass `canManage` through props or use Context API
4. **Can I use both PermissionButton and PermissionGuard?** - Yes! Use both for best UX

---

## Next Steps

1. Pick a module from the checklist
2. Follow the 3-step implementation
3. Use the template above
4. Test with different user roles
5. Move to next module

**Start with HSE or Compliance - they're similar to Claims!**
