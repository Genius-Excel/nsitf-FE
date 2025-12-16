# Claims Modal - Button Flow Diagram

## User Login & Modal Display

```
┌─────────────────────────────────────────────────────────────┐
│                    Claims List Table                         │
│  [Claim ID] [Employer] ... [Actions] (Eye Icon - View)      │
└─────────────────────────────────────────────────────────────┘
                          ↓ User clicks Eye Icon
┌─────────────────────────────────────────────────────────────┐
│                   Claims Detail Modal                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Claim Details (Claim-001)                            │   │
│  │                               [Edit] [Close]         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [Claim Details Content - Status, Parties, Financials]     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Footer - Role Based Actions:                         │   │
│  │                                                      │   │
│  │ IF Admin/Manager:                                    │   │
│  │   ┌────────────────┐        ┌──────────┐           │   │
│  │   │ Approve (Green)│        │ Cancel   │           │   │
│  │   └────────────────┘        └──────────┘           │   │
│  │                                                      │   │
│  │ IF Regional Officer:                                │   │
│  │   ┌────────────────┐        ┌──────────┐           │   │
│  │   │ Review (Blue)  │        │ Cancel   │           │   │
│  │   └────────────────┘        └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Decision Tree

```
User Opens Claim Details Modal
│
├─ Get User Role: getUserFromStorage()
│
├─ Check canEdit: regional_manager | admin | manager
├─ Check canReview: regional_manager ONLY
└─ Check canApprove: admin | manager
│
└─ Render Footer Buttons
   │
   ├─ IF (admin || manager):
   │  │
   │  └─ Show: [Approve Button] [Cancel Button]
   │     │
   │     ├─ Click Approve
   │     │  ├─ Show Confirmation: "Approve Claim?"
   │     │  ├─ Confirm → API Call: updateSingleClaim(claimId, "approve")
   │     │  └─ Close Modal
   │     │
   │     └─ Click Cancel
   │        └─ Close Modal (no changes)
   │
   └─ ELSE IF (regional_manager):
      │
      └─ Show: [Review Button] [Cancel Button]
         │
         ├─ Click Review
         │  ├─ Show Confirmation: "Mark as Reviewed?"
         │  ├─ Confirm → API Call: updateSingleClaim(claimId, "reviewed")
         │  └─ Close Modal
         │
         └─ Click Cancel
            └─ Close Modal (no changes)
```

## Button Logic Summary

| Scenario                       | Role             | Buttons Shown         | Action             | Result                                          |
| ------------------------------ | ---------------- | --------------------- | ------------------ | ----------------------------------------------- |
| View Claim as Admin            | admin            | Edit, Approve, Cancel | Click Approve      | Approval confirmation → API call → Modal closes |
| View Claim as Manager          | manager          | Edit, Approve, Cancel | Click Approve      | Approval confirmation → API call → Modal closes |
| View Claim as Regional Officer | regional_manager | Edit, Review, Cancel  | Click Review       | Review confirmation → API call → Modal closes   |
| View Claim as Other            | other            | Edit, Cancel          | No action possible | Edit only available if canEdit                  |

## File Edits Made (Session 2)

### ClaimModal.tsx

✅ **Line 49:** Added missing state

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
```

✅ **Lines 530-564:** Restructured footer with role-based conditional rendering

```tsx
{userRole === "admin" || userRole === "manager" ? (
  // Admin/Manager: Approve button
) : (
  // Regional Officer: Review button
)}
```

✅ **Lines 590-599:** Simplified confirmation dialog messages

✅ **Lines 613-623:** Updated confirmation button text to be concise

## User Experience Flow

### For Admin/Manager:

1. Login as Admin/Manager
2. Navigate to Claims page
3. Click Eye icon on any claim
4. Modal opens with:
   - ✏️ Edit button (header)
   - ✅ Approve button (green, footer)
   - ❌ Cancel button (footer)
5. Click Approve → Confirmation → Approved ✓

### For Regional Officer:

1. Login as Regional Officer
2. Navigate to Claims page
3. Click Eye icon on any claim
4. Modal opens with:
   - ✏️ Edit button (header)
   - 📋 Review button (blue, footer)
   - ❌ Cancel button (footer)
5. Click Review → Confirmation → Reviewed ✓

## Next Steps

1. **Test the implementation:**

   - [ ] Login as admin, verify Approve button shows
   - [ ] Login as regional officer, verify Review button shows
   - [ ] Click each button, verify confirmation dialogs
   - [ ] Confirm API calls succeed

2. **Apply to other modules:**

   - HSE module
   - Compliance module
   - Inspection module
   - Etc.

3. **Backend API Requirements:**
   - POST `/api/claims/single/:id` with action: "approve" | "reviewed"
   - Validate user role/permission on backend
   - Return success/failure response

---

**Status:** ✅ IMPLEMENTATION COMPLETE
**Date:** December 16, 2025
**Modified Files:** ClaimModal.tsx, CLAIMS_ROLE_BASED_BUTTONS.md (new)
