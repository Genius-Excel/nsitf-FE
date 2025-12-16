# Design System Components

Reusable components for consistent UI/UX across all NSITF modules.

## 📦 Components Overview

### 1. ChartCard

Wrapper for all chart components with consistent styling.

```tsx
import { ChartCard } from "@/components/design-system";
import { ResponsiveContainer, BarChart, Bar } from "recharts";

<ChartCard
  title="Monthly Claims Processing"
  description="Last 6 months trend"
  height={300}
>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData}>
      <Bar dataKey="value" fill="#00a63e" />
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

**Props:**
- `title` (required): Chart title
- `description` (optional): Subtitle text
- `height` (optional, default: 200): Chart height in pixels
- `className` (optional): Additional CSS classes

---

### 2. TableCard

Container for tables with optional bulk actions toolbar.

```tsx
import { TableCard } from "@/components/design-system";
import { FileCheck, CheckCircle } from "lucide-react";

<TableCard
  selectedCount={selectedClaims.size}
  bulkActions={[
    {
      label: "Mark as Reviewed",
      onClick: handleBulkReview,
      icon: <FileCheck className="w-4 h-4" />,
      variant: "review",
      disabled: isSubmitting,
    },
    {
      label: "Approve Selected",
      onClick: handleBulkApprove,
      icon: <CheckCircle className="w-4 h-4" />,
      variant: "approve",
    },
  ]}
  maxHeight={600}
  enableScroll={true}
>
  <table className="w-full">...</table>
</TableCard>
```

**Props:**
- `selectedCount` (optional, default: 0): Number of selected items
- `bulkActions` (optional): Array of bulk action buttons
- `maxHeight` (optional): Maximum height in pixels
- `enableScroll` (optional, default: true): Enable horizontal/vertical scroll
- `className` (optional): Additional CSS classes

**Bulk Action Variants:**
- `"review"` - Blue button
- `"approve"` - Green button
- `"delete"` - Red button
- `"custom"` - Gray button

---

### 3. DataTable

Fully-featured table component with selection, sorting, and custom rendering.

```tsx
import { DataTable, ViewButton, StatusBadge } from "@/components/design-system";

<DataTable
  data={claims}
  columns={[
    {
      key: "claimId",
      header: "ECS NO.",
      accessor: (row) => row.claimId,
      align: "center",
    },
    {
      key: "employer",
      header: "Employer",
      accessor: (row) => row.employer,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) => (
        <StatusBadge variant={getStatusVariant(row.status)}>
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (row) => (
        <ViewButton onClick={() => handleViewClaim(row)} />
      ),
    },
  ]}
  size="compact"
  selectable={true}
  selectedIds={selectedClaims}
  onSelectAll={handleSelectAll}
  onSelectRow={handleSelectClaim}
  getRowId={(row) => row.id}
  stickyHeader={true}
  emptyMessage="No claims found"
/>
```

**Props:**
- `data` (required): Array of data objects
- `columns` (required): Column configuration array
- `size` (optional, default: "normal"): Table size variant
  - `"compact"` - Dense spacing (px-2 py-1.5, text-xs)
  - `"normal"` - Standard spacing (px-4 py-3, text-sm)
  - `"spacious"` - Large spacing (px-4 py-4, text-sm)
- `selectable` (optional, default: false): Enable row selection
- `selectedIds` (optional): Set of selected row IDs
- `onSelectAll` (optional): Callback for select all
- `onSelectRow` (optional): Callback for row selection
- `getRowId` (optional): Function to extract unique ID from row
- `stickyHeader` (optional, default: false): Make header sticky on scroll
- `emptyMessage` (optional): Message when no data available
- `onRowClick` (optional): Callback when row is clicked

**Column Configuration:**
```typescript
{
  key: string;              // Unique key for column
  header: string;           // Column header text
  accessor?: (row) => any;  // Extract value from row
  render?: (row) => Node;   // Custom render function
  align?: "left" | "center" | "right";  // Text alignment
  sortable?: boolean;       // Enable sorting (future)
  className?: string;       // Additional classes
}
```

---

### 4. StatusBadge

Colored badges for status indicators with consistent variants.

```tsx
import { StatusBadge, PerformanceBadge, getStatusVariant } from "@/components/design-system";

// Basic usage
<StatusBadge variant="success">Paid</StatusBadge>
<StatusBadge variant="warning">Pending</StatusBadge>
<StatusBadge variant="error">Rejected</StatusBadge>

// Auto-detect variant from status string
<StatusBadge variant={getStatusVariant(claim.status)}>
  {claim.status}
</StatusBadge>

// Performance/Compliance badge
<PerformanceBadge value={85} showPercentage={true} />
```

**Props:**
- `variant` (optional, default: "neutral"): Badge color scheme
  - `"success"` - Green (paid, completed, approved, active)
  - `"warning"` - Yellow (pending, in progress, under review)
  - `"error"` - Red (rejected, failed, cancelled)
  - `"info"` - Blue (processing, submitted)
  - `"neutral"` - Gray (default)
- `size` (optional, default: "md"): Badge size
  - `"sm"` - text-[10px]
  - `"md"` - text-xs
  - `"lg"` - text-sm
- `className` (optional): Additional CSS classes

**Helper Functions:**
- `getStatusVariant(status: string)` - Auto-detect variant from status text
- `PerformanceBadge` - Color-coded badge for percentages (green >=80%, yellow >=60%, red <60%)

---

### 5. MetricCard & MetricsGrid

Display key metrics in a responsive grid layout.

```tsx
import { MetricsGrid, MetricCard } from "@/components/design-system";
import { Users, DollarSign, FileText } from "lucide-react";

<MetricsGrid columns={5}>
  <MetricCard
    title="Total Claims Paid"
    value={1234}
    change="+8.2% from last month"
    icon={<FileText className="w-5 h-5" />}
    colorScheme="green"
  />
  <MetricCard
    title="Beneficiaries"
    value={5678}
    icon={<Users className="w-5 h-5" />}
    colorScheme="blue"
  />
  <MetricCard
    title="Total Amount"
    value="₦25.4M"
    trend="up"
    icon={<DollarSign className="w-5 h-5" />}
    colorScheme="purple"
  />
</MetricsGrid>
```

**MetricCard Props:**
- `title` (required): Metric label
- `value` (required): Metric value (number or string)
- `change` (optional): Change percentage text
- `icon` (optional): Icon component
- `colorScheme` (optional, default: "green"): Color theme
  - `"green"`, `"blue"`, `"purple"`, `"orange"`, `"gray"`
- `description` (optional): Additional description
- `subtitle` (optional): Subtitle text
- `trend` (optional): Trend indicator

**MetricsGrid Props:**
- `columns` (optional, default: 5): Number of columns on large screens
  - Desktop (lg): Uses specified columns (4, 5, 6, or 7)
  - Tablet (md): Always 3 columns
  - Mobile: Always 2 columns

---

### 6. SearchBar

Search input with optional filter and upload buttons.

```tsx
import { SearchBar } from "@/components/design-system";

<SearchBar
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Search by ECS No., Employer..."
  showFilter={false}
  showUpload={true}
  onUpload={handleUploadClick}
  uploadButtonText="Upload Claims"
  uploadButtonColor="green"
/>
```

**Props:**
- `searchTerm` (required): Current search value
- `onSearchChange` (required): Callback when search changes
- `placeholder` (optional, default: "Search..."): Input placeholder
- `showFilter` (optional, default: true): Show filter button
- `onFilter` (optional): Filter button click handler
- `showUpload` (optional, default: false): Show upload button
- `onUpload` (optional): Upload button click handler
- `uploadButtonText` (optional, default: "Upload"): Upload button text
- `uploadButtonColor` (optional, default: "green"): Upload button color ("green" or "blue")

---

### 7. AdvancedFilterPanel

Collapsible filter panel with region, branch, date, and period filters.

```tsx
import { AdvancedFilterPanel } from "@/components/design-system";

<AdvancedFilterPanel
  regions={regions}
  branches={branches}
  filters={filters}
  onFilterChange={handleFilterChange}
  onReset={resetFilters}
  totalEntries={totalClaims}
  filteredCount={filteredClaims.length}
  userRole={userRole}
  userRegionId={userRegionId}
  showRegionFilter={true}
  showBranchFilter={true}
  showMonthYearFilter={true}
  showDateRangeFilter={false}
/>
```

**Props:**
- `regions` (required): Array of region objects
- `branches` (required): Array of branch objects
- `filters` (required): Current filter state
- `onFilterChange` (required): Callback when filters change
- `onReset` (required): Callback to clear all filters
- `totalEntries` (required): Total number of entries
- `filteredCount` (required): Number of filtered entries
- `userRole` (optional): Current user role for role-based filtering
- `userRegionId` (optional): Current user's region ID
- `showRegionFilter` (optional, default: true): Show region dropdown
- `showBranchFilter` (optional, default: true): Show branch dropdown
- `showMonthYearFilter` (optional, default: true): Show month/year selectors
- `showDateRangeFilter` (optional, default: false): Show date range inputs

**Filter Config:**
```typescript
interface FilterConfig {
  selectedRegionId: string;
  selectedBranchId: string;
  selectedMonth: string;      // "1" to "12"
  selectedYear: string;       // "YYYY"
  dateFrom?: string;          // "YYYY-MM-DD"
  dateTo?: string;            // "YYYY-MM-DD"
}
```

---

## 🎨 Usage Patterns

### Complete Page Example

```tsx
import {
  PageHeader,
  MetricsGrid,
  MetricCard,
  ChartCard,
  SearchBar,
  AdvancedFilterPanel,
  TableCard,
  DataTable,
  StatusBadge,
  ViewButton,
  getStatusVariant,
} from "@/components/design-system";

export default function ModulePage() {
  return (
    <div className="space-y-10">
      {/* Page Header */}
      <PageHeader
        title="Module View"
        description="Track and manage module data"
      />

      {/* Metrics */}
      <MetricsGrid columns={5}>
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </MetricsGrid>

      {/* Chart */}
      <ChartCard title="Monthly Trends" height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>...</BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Search */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showUpload={true}
        onUpload={handleUpload}
      />

      {/* Filters */}
      <AdvancedFilterPanel {...filterProps} />

      {/* Table */}
      <TableCard
        selectedCount={selectedIds.size}
        bulkActions={bulkActions}
        maxHeight={600}
      >
        <DataTable
          data={data}
          columns={columns}
          size="compact"
          selectable={true}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          stickyHeader={true}
        />
      </TableCard>
    </div>
  );
}
```

---

## 📚 Best Practices

1. **Always use TableCard with DataTable** for consistent table styling
2. **Use StatusBadge for all status indicators** instead of custom badges
3. **Wrap charts in ChartCard** for consistent styling
4. **Use MetricsGrid columns based on metric count**:
   - 5 columns: Dashboard standard
   - 6 columns: When you have 6 metrics
   - 7 columns: Only when necessary (can be cramped on smaller screens)
5. **Use compact table size** for dense data tables
6. **Use normal/spacious sizes** for tables with complex data
7. **Enable stickyHeader** for tables with many rows
8. **Always provide emptyMessage** for better UX

---

## 🔄 Migration Guide

### Before (Old Pattern):
```tsx
<div className="bg-white rounded-lg border">
  <table className="w-full">
    <thead className="bg-gray-50">
      <th className="px-4 py-3 text-xs">Name</th>
    </thead>
    <tbody>
      <tr><td className="px-4 py-3">{data.name}</td></tr>
    </tbody>
  </table>
</div>
```

### After (New Pattern):
```tsx
<TableCard maxHeight={600}>
  <DataTable
    data={[data]}
    columns={[
      { key: "name", header: "Name", accessor: (row) => row.name }
    ]}
    size="normal"
  />
</TableCard>
```

---

## 🎯 Component Decision Tree

**Need to display metrics?** → Use `MetricCard` + `MetricsGrid`

**Need to display a chart?** → Wrap in `ChartCard`

**Need a data table?** → Use `TableCard` + `DataTable`

**Need status/badge?** → Use `StatusBadge` or `PerformanceBadge`

**Need search functionality?** → Use `SearchBar`

**Need advanced filters?** → Use `AdvancedFilterPanel`

**Need page structure?** → Use `PageHeader` + `space-y-10` container
