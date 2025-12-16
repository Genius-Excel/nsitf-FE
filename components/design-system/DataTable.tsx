import React, { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export type TableSize = "compact" | "normal" | "spacious";

interface TableColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  size?: TableSize;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectAll?: () => void;
  onSelectRow?: (id: string) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

/**
 * DataTable - Reusable table component with consistent styling
 *
 * Supports:
 * - Multiple size variants (compact, normal, spacious)
 * - Optional row selection with checkboxes
 * - Custom column rendering
 * - Sticky headers
 * - Alignment control per column
 *
 * @example
 * <DataTable
 *   data={claims}
 *   columns={[
 *     { key: "id", header: "ECS NO.", accessor: (row) => row.claimId },
 *     { key: "employer", header: "Employer", accessor: (row) => row.employer },
 *     { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> }
 *   ]}
 *   size="compact"
 *   selectable={true}
 *   selectedIds={selectedClaims}
 *   onSelectAll={handleSelectAll}
 *   onSelectRow={handleSelectRow}
 *   getRowId={(row) => row.id}
 * />
 */
export function DataTable<T>({
  data,
  columns,
  size = "normal",
  onRowClick,
  selectable = false,
  selectedIds = new Set(),
  onSelectAll,
  onSelectRow,
  getRowId = (row: any) => row.id,
  emptyMessage = "No data available",
  stickyHeader = false,
}: DataTableProps<T>) {
  const sizeClasses = {
    compact: {
      header: "px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide",
      cell: "px-2 py-1.5 text-xs",
    },
    normal: {
      header: "px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider",
      cell: "px-4 py-3 text-sm",
    },
    spacious: {
      header: "px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider",
      cell: "px-4 py-4 text-sm",
    },
  };

  const classes = sizeClasses[size];

  const getAlignment = (align?: string) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const allSelected = data.length > 0 && selectedIds.size === data.length;

  return (
    <table className="w-full divide-y divide-border">
      <thead className={`bg-muted border-b border-border ${stickyHeader ? "sticky top-0" : ""}`}>
        <tr>
          {selectable && (
            <th className={`${classes.header} ${getAlignment("center")} whitespace-nowrap`}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                aria-label="Select all rows"
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              className={`${classes.header} ${getAlignment(column.align)} ${column.className || ""} whitespace-nowrap`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border bg-card">
        {data.length > 0 ? (
          data.map((row, rowIdx) => {
            const rowId = getRowId(row);
            const isSelected = selectedIds.has(rowId);

            return (
              <tr
                key={rowId || rowIdx}
                className={`hover:bg-muted/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className={`${classes.cell} ${getAlignment("center")} whitespace-nowrap`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectRow?.(rowId);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      aria-label={`Select row ${rowId}`}
                    />
                  </td>
                )}
                {columns.map((column) => {
                  const value = column.accessor?.(row) ?? (row as any)[column.key];
                  const content = column.render ? column.render(row) : value;

                  return (
                    <td
                      key={column.key}
                      className={`${classes.cell} ${getAlignment(column.align)} ${column.className || ""} whitespace-nowrap`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              className="px-4 py-8 text-center text-gray-500"
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Helper component for view button
export const ViewButton: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = "View",
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
  >
    <Eye size={16} />
    {label}
  </button>
);
