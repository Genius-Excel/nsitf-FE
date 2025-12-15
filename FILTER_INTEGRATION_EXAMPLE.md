# Advanced Filter Integration Guide

## Overview

This guide shows how to integrate the new **AdvancedFilterPanel** component with backend API filtering for Claims, Legal, HSE, Inspection, and Compliance modules.

## Key Features

✅ **Current month shown by default**
✅ **Role-based region filtering:**
  - Admin/Manager: See all regions
  - Regional Officer: See only their region
✅ **Cascading branch dropdown** (loads based on region)
✅ **Month/Year selection** (current year + previous year)
✅ **Optional date range filtering**
✅ **Backend API parameter building**

## Files Created

1. `components/design-system/AdvancedFilterPanel.tsx` - Reusable filter component
2. `hooks/useAdvancedFilters.ts` - Filter state management + API integration

## Integration Steps

### Step 1: Import the Components

```typescript
import { AdvancedFilterPanel } from "@/components/design-system/AdvancedFilterPanel";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
```

### Step 2: Use the Hook in Your Component

```typescript
export default function ClaimsPage() {
  // Initialize advanced filters
  const {
    filters,
    regions,
    branches,
    regionsLoading,
    branchesLoading,
    apiParams,
    userRole,
    userRegionId,
    handleFilterChange,
    resetFilters,
  } = useAdvancedFilters({
    module: "claims",
    onFiltersChange: (params) => {
      console.log("API Params:", params);
      // Params will be like:
      // {
      //   month: "11",
      //   year: "2025",
      //   region_id: "uuid-here",
      //   branch_id: "uuid-here"
      // }
    },
  });

  // Your existing data fetching hook with filter params
  const { data, loading } = useClaimsDashboard(apiParams);

  return (
    <div>
      {/* Add the filter panel */}
      <AdvancedFilterPanel
        regions={regions}
        branches={branches}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        totalEntries={data?.total || 0}
        filteredCount={data?.filtered || 0}
        userRole={userRole}
        userRegionId={userRegionId}
        showRegionFilter={true}
        showBranchFilter={true}
        showMonthYearFilter={true}
        showDateRangeFilter={false}
      />

      {/* Your existing table/content */}
      <ClaimsTable data={data} />
    </div>
  );
}
```

### Step 3: Update Your Data Fetching Hook to Accept Filters

```typescript
// hooks/claims/useClaimsDashboard.ts

export function useClaimsDashboard(filterParams: Record<string, string> = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("access_token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

      // Build query string from filter params
      const queryParams = new URLSearchParams(filterParams).toString();
      const url = `${API_BASE_URL}/api/claims/dashboard?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setData(result.data);
      setLoading(false);
    }

    fetchData();
  }, [filterParams]);

  return { data, loading };
}
```

## Backend API Parameters

The filter hook automatically builds these parameters:

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `month` | string | "11" | Numeric month (1-12) |
| `year` | string | "2025" | 4-digit year |
| `region_id` | string | "uuid" | Selected region ID (optional) |
| `branch_id` | string | "uuid" | Selected branch ID (optional) |
| `date_from` | string | "2025-01-01" | Start date for range (optional) |
| `date_to` | string | "2025-12-31" | End date for range (optional) |

## Example API Request

```
GET /api/claims/dashboard?month=11&year=2025&region_id=474cb009-039e-4cd1-ab8e-cb4ff1c227af
Authorization: Bearer <token>
```

## Role-Based Behavior

### Admin/Manager
- Sees dropdown with all regions
- Can select "All Regions" (no region_id sent to API)
- Can select specific region to filter

### Regional Officer
- Sees their region name (read-only, no dropdown)
- Region ID automatically included in API calls
- Can only select branches within their region

## Expected Backend Response Format

### Regions API
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Lagos Region",
      "code": "LAG"
    }
  ]
}
```

### Branches API
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ikeja Branch",
      "code": "IKE",
      "region_id": "region-uuid"
    }
  ]
}
```

### Dashboard API Response
```json
{
  "filters": {
    "region_id": "uuid",
    "branch_id": "uuid",
    "region_name": "Lagos Region",
    "period": "November 2025",
    "previous_period": "October 2025"
  },
  "data": {
    "total": 150,
    "filtered": 45,
    // ... rest of your data
  }
}
```

## Module-Specific Integration

### Claims Module
```typescript
const filters = useAdvancedFilters({
  module: "claims",
  onFiltersChange: (params) => {
    // Refetch claims with new params
  },
});
```

### Compliance Module
```typescript
const filters = useAdvancedFilters({
  module: "compliance",
  onFiltersChange: (params) => {
    // Refetch compliance with new params
  },
});
```

### HSE Module
```typescript
const filters = useAdvancedFilters({
  module: "hse",
  onFiltersChange: (params) => {
    // Refetch HSE records with new params
  },
});
```

### Legal Module
```typescript
const filters = useAdvancedFilters({
  module: "legal",
  onFiltersChange: (params) => {
    // Refetch legal records with new params
  },
});
```

### Inspection Module
```typescript
const filters = useAdvancedFilters({
  module: "inspection",
  onFiltersChange: (params) => {
    // Refetch inspection records with new params
  },
});
```

## Advanced Customization

### Hide Specific Filters

```typescript
<AdvancedFilterPanel
  // ... other props
  showRegionFilter={false}     // Hide region filter
  showBranchFilter={true}      // Show branch filter
  showMonthYearFilter={true}   // Show month/year
  showDateRangeFilter={true}   // Show date range
/>
```

### Custom Filter Logic

```typescript
const {
  filters,
  handleFilterChange,
  apiParams,
} = useAdvancedFilters({
  module: "claims",
  onFiltersChange: (params) => {
    // Custom logic before API call
    if (params.region_id && !params.branch_id) {
      // Fetch all branches for region
    }

    // Then fetch data
    fetchClaimsData(params);
  },
});
```

## Testing Checklist

- [ ] Admin sees all regions in dropdown
- [ ] Regional officer sees only their region (read-only)
- [ ] Branches load when region is selected
- [ ] Current month is pre-selected
- [ ] Month/Year selection updates API params
- [ ] Clear filters resets to default state
- [ ] Filter count shows "X of Y entries"
- [ ] "Active" badge appears when filters are applied
- [ ] API receives correct query parameters

## Troubleshooting

### Regions not loading
- Check API endpoint: `/api/regions`
- Verify access token is valid
- Check backend returns `data` array

### Branches not loading
- Ensure region is selected first
- Check API endpoint: `/api/regions/{id}/branches`
- Verify region_id is being passed correctly

### Filters not updating data
- Check `onFiltersChange` callback is implemented
- Verify data fetching hook receives `apiParams`
- Console.log `apiParams` to see what's being sent

## Next Steps

1. Update each module's data fetching hook to accept filter parameters
2. Replace old FilterPanel with AdvancedFilterPanel
3. Test with different user roles
4. Coordinate with backend team on API endpoints
5. Add loading states while fetching regions/branches
