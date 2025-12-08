import { useState, useMemo } from "react";
import { User } from "./UseUsers";

/**
 * Client-side filtering and search
 * Uses memoization to avoid unnecessary recalculations
 * No duplicate state - filtered users are computed from source
 */
export const useUserFilters = (users: User[] | null) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");

  // Memoized filtering - only recalculates when dependencies change
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(search) ||
          user.last_name?.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.role?.toLowerCase().includes(search)
      );
    }

    // Role filter - case-insensitive comparison
    if (filterRole && filterRole !== "All Roles") {
      filtered = filtered.filter(
        (user) => user.role?.toLowerCase() === filterRole.toLowerCase()
      );
    }

    return filtered;
  }, [users, searchTerm, filterRole]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterRole("All Roles");
  };

  return {
    // Computed data
    filteredUsers,

    // Filter state
    searchTerm,
    filterRole,

    // Filter controls
    setSearchTerm,
    setFilterRole,
    resetFilters,

    // Metadata
    totalCount: users?.length ?? 0,
    filteredCount: filteredUsers.length,
    hasActiveFilters: searchTerm !== "" || (filterRole !== "All Roles" && filterRole !== undefined && filterRole !== ""),
  };
};
