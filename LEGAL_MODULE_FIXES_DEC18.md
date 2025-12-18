# Legal Module Updates - December 18, 2025

## Changes Made

### 1. Fixed Metrics Calculation ✅

**Issue**: Filters were affecting the dashboard metrics (totals)
**Solution**: Moved metrics calculation BEFORE filtering using `useMemo`

```typescript
// Before: Metrics calculated after filtering (WRONG)
const filteredRecords = allRecords.filter(...);
const metrics = { ... }; // Calculated from filteredRecords

// After: Metrics calculated from ALL records (CORRECT)
const metrics = useMemo(() => ({
  recalcitrantEmployers: allRecords.reduce(...),
  // ... other metrics
}), [allRecords]);

const filteredRecords = allRecords.filter(...); // Filter after
```

**Result**: Dashboard metrics now show total values regardless of applied filters

---

### 2. Updated Filter Panel ✅

**Issue**: Used month/year filter instead of period from/to like Claims/Inspection
**Solution**: Changed to date range filter

```typescript
// Before
showMonthYearFilter={true}
showDateRangeFilter={false}

// After
showMonthYearFilter={false}
showDateRangeFilter={true}
```

**Result**: Legal module now matches Claims/Inspection filter pattern with proper period_from and period_to

---

### 3. Enhanced Upload Error Display ✅

**Issue**: Upload modal showing generic server response, not detailed validation errors
**Solution**: Added detailed error handling like HSE module

#### Changes Made:

1. Added `errorDetails` state to store validation errors
2. Added `"error"` stage to uploadStage type
3. Updated `handleUpload` to:
   - Wrap in try-catch to capture all errors
   - Extract `error_report.LEGAL.errors` from API response
   - Set errorDetails array with validation errors
4. Updated error display section to show:
   - Individual error cards
   - Row numbers
   - Field names
   - Error messages
   - Missing columns (if any)

#### Error Display Format:

```tsx
{
  /* Detailed Error List */
}
{
  errorDetails.length > 0 && (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-red-800 uppercase">
        Validation Errors:
      </p>
      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
        {errorDetails.map((err, idx) => (
          <div key={idx} className="bg-white rounded p-2 border border-red-200">
            <div className="flex items-start gap-2">
              <span className="text-xs font-mono text-red-600">#{idx + 1}</span>
              <div className="flex-1 text-xs">
                {err.row && <p>Row {err.row}:</p>}
                {err.field && <p>Field: {err.field}</p>}
                <p>{err.message || err.error}</p>
                {err.missing_columns && (
                  <p>Missing: {err.missing_columns.join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Result**: Users now see detailed validation errors with:

- Error number
- Row number (if applicable)
- Field name (if applicable)
- Clear error message
- Missing columns list (if applicable)

---

## Files Modified

### 1. `parts/admin/legal/index.tsx`

- ✅ Added `useMemo` import
- ✅ Moved metrics calculation before filtering
- ✅ Wrapped metrics in `useMemo` for performance
- ✅ Changed `showMonthYearFilter={false}` and `showDateRangeFilter={true}`

### 2. `parts/admin/legal/legalUploadModal.tsx`

- ✅ Added `errorDetails` state: `useState<any[]>([])`
- ✅ Updated `uploadStage` type to include `"error"`
- ✅ Updated `handleUpload` with try-catch and error extraction
- ✅ Updated `handleClose` to clear `errorDetails`
- ✅ Enhanced error display section with detailed error cards

---

## Testing Checklist

### ✅ Metrics (Fixed)

- [x] Dashboard metrics show totals for ALL records
- [x] Applying region filter doesn't change metrics
- [x] Applying date range doesn't change metrics
- [x] Applying search doesn't change metrics
- [x] Only table data changes with filters

### ✅ Filters (Updated)

- [x] Month/Year filter removed
- [x] Date Range filter (Period From/To) added
- [x] Filter panel matches Claims/Inspection design
- [x] API receives `period_from` and `period_to` params
- [x] Date range filter works correctly

### ✅ Upload Errors (Enhanced)

- [x] Generic error message shows at top
- [x] "Validation Errors:" section appears when errors exist
- [x] Each error shows in individual card
- [x] Error number displayed (#1, #2, etc.)
- [x] Row number shown (if available)
- [x] Field name shown (if available)
- [x] Error message clearly displayed
- [x] Missing columns list shown (if applicable)
- [x] Error list scrollable with max-height
- [x] errorDetails cleared on modal close

---

## API Error Format Expected

The upload modal now expects errors in this format:

```json
{
  "error_report": {
    "LEGAL": {
      "errors": [
        {
          "row": 5,
          "field": "recalcitrant_employers",
          "message": "Value must be a positive number",
          "error": "Invalid data type"
        },
        {
          "row": 12,
          "message": "Missing required field: ECS Number",
          "missing_columns": ["ecs_number"]
        }
      ]
    }
  }
}
```

---

## Pattern Consistency

All three modules now follow the same pattern:

| Feature           | Claims          | Inspection      | HSE             | Legal             |
| ----------------- | --------------- | --------------- | --------------- | ----------------- |
| Metrics Filtering | ❌ Not affected | ❌ Not affected | ❌ Not affected | ✅ Not affected   |
| Date Filter Type  | Period From/To  | Period From/To  | Period From/To  | ✅ Period From/To |
| Upload Errors     | Detailed        | Detailed        | ✅ Detailed     | ✅ Detailed       |
| Status Workflow   | ✅              | ✅              | ✅              | ✅                |
| Modal Design      | ✅              | ✅              | ✅              | ✅                |

---

## Notes

1. **Performance**: Using `useMemo` for metrics calculation prevents unnecessary recalculations
2. **User Experience**: Filters now affect only the table, not the summary metrics
3. **Error Clarity**: Users can now identify exact rows and fields causing upload failures
4. **Consistency**: Legal module now matches Claims/Inspection patterns exactly

---

**Status**: ✅ **COMPLETE**
**Date**: December 18, 2025
**Issues Fixed**: 3 (Metrics filtering, Filter type, Error display)
