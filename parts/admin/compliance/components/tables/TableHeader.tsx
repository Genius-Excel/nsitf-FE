import React from "react";
import type { SortConfig, SortField } from "@/lib/types";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface Props {
  label: string;
  field: SortField;
  sortConfig: SortConfig | null;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}

export const TableHeader: React.FC<Props> = ({ label, field, sortConfig, onSort, align = "left" }) => {
  const isSorted = sortConfig?.field === field;
  const dir = sortConfig?.direction;
  return (
    <th className={`px-3 sm:px-4 py-3 text-${align} text-sm font-medium text-gray-700`} scope="col">
      <button onClick={() => onSort(field)} className="flex items-center gap-2 hover:text-gray-900 focus:outline-none" aria-label={`Sort by ${label}`}>
        <span>{label}</span>
        {isSorted ? (dir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />) : <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50" />}
      </button>
    </th>
  );
};
