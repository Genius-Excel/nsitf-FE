# Claims Modal - Role-Based Button Configuration

## Overview

The Claims modal popout now displays different action buttons based on user role and permissions.

## Button Configuration by Role

### Admin / Manager (admin, manager roles)

**Buttons Displayed:**

- ✏️ **Edit** (in header) - Edit claim details
- ✅ **Approve** (green button) - Approve the claim
- ❌ **Cancel** - Close modal without action

**Permission Check:** `canApprove = userRole && ["admin", "manager"].includes(userRole)`

### Regional Officer (regional_manager role)

**Buttons Displayed:**

- ✏️ **Edit** (in header) - Edit claim details
- 📋 **Review** (blue button) - Mark claim as reviewed
- ❌ **Cancel** - Close modal without action

**Permission Check:** `canReview = userRole === "regional_manager"`

## Code Structure

### State Management

```tsx
const [userRole, setUserRole] = useState<UserRole | null>(null);
const [confirmAction, setConfirmAction] = useState<
  "reviewed" | "approve" | null
>(null);
const [isEditMode, setIsEditMode] = useState(false);
```

### Permission Checks

```tsx
const canEdit =
  userRole && ["regional_manager", "admin", "manager"].includes(userRole);
const canReview = userRole === "regional_manager";
const canApprove = userRole && ["admin", "manager"].includes(userRole);
```

### Modal Footer Logic

```tsx
{
  /* Admin Buttons: Edit (in header), Approve, Cancel */
}
{
  userRole === "admin" || userRole === "manager" ? (
    <>
      {claimDetail && canApprove && (
        <Button
          onClick={handleApproveClick}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </Button>
      )}
      <Button onClick={onClose} variant="outline">
        Cancel
      </Button>
    </>
  ) : (
    // Regional Officer Buttons: Edit (in header), Review, Cancel
    <>
      {claimDetail && canReview && (
        <Button
          onClick={handleReviewedClick}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Review
        </Button>
      )}
      <Button onClick={onClose} variant="outline">
        Cancel
      </Button>
    </>
  );
}
```

## Action Handlers

### Review Action (Regional Officer)

- **Trigger:** User clicks "Review" button
- **Confirmation Dialog:** "Mark as Reviewed?"
- **API Call:** `updateSingleClaim(claimId, "reviewed")`
- **Result:** Claim marked as reviewed

### Approve Action (Admin/Manager)

- **Trigger:** User clicks "Approve" button
- **Confirmation Dialog:** "Approve Claim?"
- **API Call:** `updateSingleClaim(claimId, "approve")`
- **Result:** Claim approved

### Edit Action (Both Roles)

- **Trigger:** User clicks "Edit" button in header
- **Mode:** Switches to edit mode
- **Save:** `handleSaveEdit()` with API call
- **Cancel:** Reverts changes without saving

## Visual Indicators

| Element       | Admin              | Regional Officer |
| ------------- | ------------------ | ---------------- |
| Edit Button   | ✏️ Gray outline    | ✏️ Gray outline  |
| Action Button | ✅ Green (Approve) | 📋 Blue (Review) |
| Cancel Button | ❌ Gray outline    | ❌ Gray outline  |
| Icon          | CheckCircle        | CheckCircle      |

## Confirmation Dialog

Both actions (Review & Approve) trigger a confirmation dialog:

```
┌─────────────────────────────┐
│ Mark as Reviewed?           │
│                             │
│ Are you sure you want to    │
│ mark this claim as reviewed?│
│                             │
│ [Cancel]  [Mark as Reviewed]│
└─────────────────────────────┘
```

OR

```
┌─────────────────────────────┐
│ Approve Claim?              │
│                             │
│ Are you sure you want to    │
│ approve this claim?         │
│                             │
│ [Cancel]    [Approve]       │
└─────────────────────────────┘
```

## File Locations

- **Modal Component:** `parts/admin/claims/ClaimModal.tsx`
- **Permission Hook:** `hooks/useCheckPermission.ts`
- **Bulk Actions Hook:** `hooks/claims/index.ts` (useBulkClaimActions)

## Testing Checklist

- [ ] Login as Admin
  - [ ] Edit button visible
  - [ ] Approve button visible (green)
  - [ ] Cancel button visible
  - [ ] Click Review: Should show error or be disabled
- [ ] Login as Regional Manager

  - [ ] Edit button visible
  - [ ] Review button visible (blue)
  - [ ] Cancel button visible
  - [ ] Click Approve: Should show error or be disabled

- [ ] Edit Functionality

  - [ ] Click Edit → Fields become editable
  - [ ] Click Cancel → Reverts changes
  - [ ] Click Save → Updates claim and closes modal

- [ ] Approval Flow (Admin)

  - [ ] Click Approve → Confirmation dialog
  - [ ] Confirm → API call, toast notification, modal closes

- [ ] Review Flow (Regional Officer)
  - [ ] Click Review → Confirmation dialog
  - [ ] Confirm → API call, toast notification, modal closes

## Implementation Details

### Recent Fixes (Session 2)

1. ✅ Added missing `isSubmitting` state (was being used but not declared)
2. ✅ Changed button text from "Mark as Reviewed" to "Review" for brevity
3. ✅ Restructured footer to show role-specific buttons conditionally
4. ✅ Updated confirmation dialog to reflect cleaner action descriptions
5. ✅ Maintained Edit button in header for both roles

### Related Files

- `parts/admin/claims/ClaimsFunc.tsx` - Permission check + page access
- `parts/admin/claims/ClaimsDesign.tsx` - Table with Eye icon for viewing details
- `parts/admin/claims/ClaimsUploadModal.tsx` - Bulk upload functionality
- `hooks/useCheckPermission.ts` - Permission checking logic
- `hooks/claims/index.ts` - Bulk actions (review, approve)

---

**Status:** ✅ COMPLETE - Role-based button rendering implemented
**Last Updated:** December 16, 2025
