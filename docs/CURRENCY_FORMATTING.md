# Currency Formatting Guide

## Overview

This project uses user-friendly currency formatting with proper comma separators and tooltips for full amounts.

## Features

### 1. **Comma Separators**

- Amounts are displayed with proper comma separators (e.g., `₦500,000` instead of `₦0.5M`)
- Makes numbers more readable and user-friendly

### 2. **Smart Truncation**

- Long numbers (>9 digits) are automatically truncated with ellipsis
- Example: `₦13,345,560...` for very large amounts
- Full amount is shown in tooltip on hover

### 3. **Tooltip on Hover**

- When a number is truncated, hovering shows the full formatted amount
- Tooltip displays: `₦13,345,560,789.00`

## Usage

### Using the FormattedCurrency Component

```tsx
import { FormattedCurrency } from "@/components/ui/formatted-currency";

// Basic usage
<FormattedCurrency amount={500000} />
// Displays: ₦500,000

// Without currency symbol
<FormattedCurrency amount={500000} showSymbol={false} />
// Displays: 500,000

// Custom max digits (default is 9)
<FormattedCurrency amount={1234567890123} maxDigits={7} />
// Displays: ₦1,234,567... (with tooltip showing full amount)

// With custom className
<FormattedCurrency amount={500000} className="text-green-700 font-bold" />
```

### Using Utility Functions

```tsx
import { formatCurrency, formatCurrencyFull } from "@/lib/utils";

// Format with truncation
const formatted = formatCurrency(500000);
// Returns: "₦500,000"

// Format with full precision
const fullFormatted = formatCurrencyFull(500000);
// Returns: "₦500,000.00"

// Legacy short format (kept for backward compatibility)
import { formatCurrencyShort } from "@/lib/utils";
const shortFormat = formatCurrencyShort(500000);
// Returns: "₦0.50M"
```

### Domain-Specific Formatting

#### Inspection Module

```tsx
import { formatInspectionCurrency } from "@/lib/types/inspection";

const formatted = formatInspectionCurrency(1234567890);
// Returns: "₦1,234,567,890" with tooltip for full amount
```

#### Valuation Module

- Uses the internal `formatCurrency` function in `@/lib/types/valuation.tsx`
- Automatically handles large numbers with truncation

## Migration Guide

### Old Format (Million/Billion notation)

```tsx
// OLD - Don't use this anymore
const formatCurrency = (value: number) => {
  return `₦${(value / 1000000).toFixed(2)}M`;
};
```

### New Format (Comma separators)

```tsx
// NEW - Use this instead
import { FormattedCurrency } from "@/components/ui/formatted-currency";

<FormattedCurrency amount={value} />;
```

## Examples

| Input Amount  | Display           | Tooltip (on hover)    |
| ------------- | ----------------- | --------------------- |
| 500000        | ₦500,000          | -                     |
| 13345560      | ₦13,345,560       | -                     |
| 13345560789   | ₦13,345,560...    | ₦13,345,560,789.00    |
| 1234567890123 | ₦1,234,567,890... | ₦1,234,567,890,123.00 |

## Files Modified

1. **`components/ui/formatted-currency.tsx`** - New component for formatted display
2. **`lib/utils.ts`** - Updated core formatting functions
3. **`lib/types/inspection.ts`** - Updated inspection currency formatting
4. **`lib/types/valuation.tsx`** - Updated valuation currency formatting
5. **`parts/admin/investment/InvestmentTable.tsx`** - Uses FormattedCurrency component
6. **`parts/admin/investment/InvestmentDashboard.tsx`** - Uses updated formatCurrency
7. **`parts/admin/inspection/inspectionDesign.tsx`** - Uses FormattedCurrency component

## Best Practices

1. **Use FormattedCurrency component** for table cells and display values
2. **Use formatCurrency utility** when you need just the string (e.g., for CSV export)
3. **Keep maxDigits at 9** unless you have a specific reason to change it
4. **Always import from the correct source** to maintain consistency
