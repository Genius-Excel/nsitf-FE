import { useCallback, useState } from "react";
import type { SortConfig, SortField } from "@/lib/types";

export const useSort = (initial: SortConfig | null = null) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initial);

  const onSort = useCallback((field: SortField) => {
    setSortConfig((prev) => {
      if (!prev || prev.field !== field) {
        return { field, direction: "asc" };
      }
      return { 
        field, 
        direction: prev.direction === "asc" ? "desc" : "asc" 
      };
    });
  }, []);

  return { sortConfig, onSort, setSortConfig };
};

