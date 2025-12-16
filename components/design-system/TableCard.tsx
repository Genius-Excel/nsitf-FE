import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface BulkAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "review" | "approve" | "delete" | "custom";
  disabled?: boolean;
}

interface TableCardProps {
  children: ReactNode;
  selectedCount?: number;
  bulkActions?: BulkAction[];
  maxHeight?: number;
  className?: string;
  enableScroll?: boolean;
}

/**
 * TableCard - Reusable wrapper for all table components
 *
 * Provides consistent styling with optional bulk actions toolbar,
 * scroll container, and max height constraints
 *
 * @example
 * <TableCard
 *   selectedCount={selectedItems.size}
 *   bulkActions={[
 *     { label: "Mark as Reviewed", onClick: handleReview, variant: "review" },
 *     { label: "Approve Selected", onClick: handleApprove, variant: "approve" }
 *   ]}
 *   maxHeight={600}
 * >
 *   <table className="w-full">...</table>
 * </TableCard>
 */
export const TableCard: React.FC<TableCardProps> = ({
  children,
  selectedCount = 0,
  bulkActions = [],
  maxHeight,
  className = "",
  enableScroll = true,
}) => {
  const getButtonVariant = (variant: BulkAction["variant"]) => {
    switch (variant) {
      case "review":
        return "bg-blue-600 hover:bg-blue-700";
      case "approve":
        return "bg-green-600 hover:bg-green-700";
      case "delete":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Bulk Actions Toolbar */}
      {selectedCount > 0 && bulkActions.length > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                onClick={action.onClick}
                disabled={action.disabled}
                size="sm"
                className={getButtonVariant(action.variant)}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        className={enableScroll ? "overflow-x-auto overflow-y-auto" : ""}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        {children}
      </div>
    </div>
  );
};
