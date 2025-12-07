import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  type UserWithPermissions,
  type Permission,
  type PermissionDiff,
  type UpdateUserPermissionsRequest,
  ALL_PERMISSIONS,
  canRemovePermission,
  canAssignPermission,
} from '@/lib/types/permissions';
import { getUserFromStorage } from '@/lib/auth';

// ============== MOCK DATA (Replace with actual API) ==============

// Mock users data - replace with actual API call
const MOCK_USERS: UserWithPermissions[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@nsitf.com",
    role: "admin",
    permissions: [
      "VIEW_DASHBOARD",
      "MANAGE_USERS",
      "ASSIGN_PERMISSIONS",
      "SYSTEM_CONFIGURATION",
      "UPLOAD_BRANCH_DATA",
      "REVIEW_BRANCH_REPORT",
      "APPROVE_REGIONAL_REPORT",
    ],
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-12-01T08:30:00Z",
    isActive: true,
  },
  {
    id: "2", 
    name: "Sarah Manager",
    email: "sarah.manager@nsitf.com",
    role: "manager",
    permissions: [
      "VIEW_DASHBOARD",
      "UPLOAD_HSE_DATA",
      "REVIEW_HSE_REPORT",
      "VIEW_KPI_ANALYTICS",
    ],
    createdAt: "2024-02-10T14:20:00Z",
    lastLogin: "2024-11-30T16:45:00Z",
    isActive: true,
  },
  {
    id: "3",
    name: "Mike Claims Officer", 
    email: "mike.claims@nsitf.com",
    role: "claims_officer",
    permissions: [
      "VIEW_DASHBOARD",
      "UPLOAD_CLAIMS_DATA",
      "REVIEW_CLAIMS_REPORT",
      "EDIT_RECORD",
    ],
    createdAt: "2024-03-05T09:15:00Z",
    lastLogin: "2024-11-29T11:20:00Z",
    isActive: true,
  },
];

// ============== USERS HOOK ==============

export function useUsersWithPermissions() {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock implementation - replace with actual API call
      // const response = await fetch('/api/admin/users-permissions');
      // const data = await response.json();
      
      setUsers(MOCK_USERS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch,
  };
}

// ============== PERMISSION EDITOR HOOK ==============

export function usePermissionEditor(user: UserWithPermissions | null) {
  const { toast } = useToast();
  const currentUser = getUserFromStorage();
  
  // State for permission editing
  const [isOpen, setIsOpen] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<Permission[]>([]);
  const [editedPermissions, setEditedPermissions] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize permissions when user changes
  useEffect(() => {
    if (user) {
      setOriginalPermissions([...user.permissions]);
      setEditedPermissions([...user.permissions]);
    } else {
      setOriginalPermissions([]);
      setEditedPermissions([]);
    }
  }, [user]);

  // Calculate permission diff
  const permissionDiff = useMemo((): PermissionDiff => {
    const added = editedPermissions.filter(p => !originalPermissions.includes(p));
    const removed = originalPermissions.filter(p => !editedPermissions.includes(p));
    const unchanged = originalPermissions.filter(p => editedPermissions.includes(p));
    
    return { added, removed, unchanged };
  }, [originalPermissions, editedPermissions]);

  // Check if there are changes
  const hasChanges = permissionDiff.added.length > 0 || permissionDiff.removed.length > 0;

  // Toggle permission
  const togglePermission = useCallback((permission: Permission) => {
    if (!user || !currentUser) return;

    const isCurrentlySelected = editedPermissions.includes(permission);
    
    if (isCurrentlySelected) {
      // Check if we can remove this permission
      if (!canRemovePermission(user.role, permission, currentUser || { role: 'user' })) {
        toast({
          title: "Cannot Remove Permission",
          description: `The ${permission} permission cannot be removed from this role.`,
          variant: "destructive",
        });
        return;
      }
      
      setEditedPermissions(prev => prev.filter(p => p !== permission));
    } else {
      // Check if we can assign this permission
      if (!canAssignPermission(user.role, permission, currentUser?.role || 'user')) {
        toast({
          title: "Cannot Assign Permission",
          description: `You don't have permission to assign ${permission} to this role.`,
          variant: "destructive",
        });
        return;
      }
      
      setEditedPermissions(prev => [...prev, permission]);
    }
  }, [user, currentUser, editedPermissions, toast]);

  // Open editor
  const openEditor = useCallback((userToEdit: UserWithPermissions) => {
    setOriginalPermissions([...userToEdit.permissions]);
    setEditedPermissions([...userToEdit.permissions]);
    setIsOpen(true);
  }, []);

  // Close editor
  const closeEditor = useCallback(() => {
    setIsOpen(false);
    // Reset state after animation completes
    setTimeout(() => {
      setOriginalPermissions([]);
      setEditedPermissions([]);
    }, 200);
  }, []);

  // Save permissions
  const savePermissions = useCallback(async (): Promise<boolean> => {
    if (!user || !hasChanges) return false;

    try {
      setIsSaving(true);

      const request: UpdateUserPermissionsRequest = {
        add: permissionDiff.added,
        remove: permissionDiff.removed,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock implementation - replace with actual API call
      // const response = await fetch(`/api/admin/users/${user.id}/permissions`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(request),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to update permissions');
      // }

      toast({
        title: "Permissions Updated",
        description: `Successfully updated permissions for ${user.name}.`,
      });

      return true;
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update permissions",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, hasChanges, permissionDiff, toast]);

  // Reset changes
  const resetChanges = useCallback(() => {
    setEditedPermissions([...originalPermissions]);
  }, [originalPermissions]);

  return {
    isOpen,
    originalPermissions,
    editedPermissions,
    permissionDiff,
    hasChanges,
    isSaving,
    togglePermission,
    openEditor,
    closeEditor,
    savePermissions,
    resetChanges,
  };
}

// ============== USER FILTERS HOOK ==============

export function useUserPermissionFilters(users: UserWithPermissions[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [permissionFilter, setPermissionFilter] = useState<Permission | 'all'>('all');

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = !roleFilter || roleFilter === 'all' || user.role === roleFilter;

      // Permission filter
      const matchesPermission = !permissionFilter || permissionFilter === 'all' || 
        user.permissions.includes(permissionFilter);

      return matchesSearch && matchesRole && matchesPermission;
    });
  }, [users, searchTerm, roleFilter, permissionFilter]);

  // Get unique roles from users
  const availableRoles = useMemo(() => {
    const roles = new Set(users.map(user => user.role));
    return Array.from(roles).sort();
  }, [users]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(searchTerm || (roleFilter && roleFilter !== 'all') || (permissionFilter && permissionFilter !== 'all'));

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('all');
    setPermissionFilter('all');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    permissionFilter,
    setPermissionFilter,
    filteredUsers,
    availableRoles,
    hasActiveFilters,
    resetFilters,
  };
}

// ============== BULK PERMISSION OPERATIONS ==============

export function useBulkPermissionOperations() {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle user selection
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  // Select all users
  const selectAllUsers = useCallback((userIds: string[]) => {
    setSelectedUsers(userIds);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // Bulk add permission
  const bulkAddPermission = useCallback(async (
    users: UserWithPermissions[],
    permission: Permission
  ): Promise<boolean> => {
    if (selectedUsers.length === 0) return false;

    try {
      setIsProcessing(true);

      // Filter selected users and validate permission assignment
      const validUsers = users.filter(user => 
        selectedUsers.includes(user.id) && 
        !user.permissions.includes(permission)
      );

      if (validUsers.length === 0) {
        toast({
          title: "No Changes Needed", 
          description: "Selected users already have this permission.",
        });
        return false;
      }

      // Simulate API calls
      for (const user of validUsers) {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Mock API call - replace with actual implementation
      }

      toast({
        title: "Bulk Update Successful",
        description: `Added ${permission} permission to ${validUsers.length} user(s).`,
      });

      clearSelection();
      return true;
    } catch (err) {
      toast({
        title: "Bulk Update Failed",
        description: err instanceof Error ? err.message : "Failed to update permissions",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedUsers, toast, clearSelection]);

  // Bulk remove permission  
  const bulkRemovePermission = useCallback(async (
    users: UserWithPermissions[],
    permission: Permission
  ): Promise<boolean> => {
    if (selectedUsers.length === 0) return false;

    try {
      setIsProcessing(true);
      const currentUser = getUserFromStorage();

      // Filter selected users and validate permission removal
      const validUsers = users.filter(user => 
        selectedUsers.includes(user.id) && 
        user.permissions.includes(permission) &&
        canRemovePermission(user.role, permission, currentUser || { role: 'user' })
      );

      if (validUsers.length === 0) {
        toast({
          title: "No Changes Allowed",
          description: "Selected users don't have this permission or it cannot be removed.",
        });
        return false;
      }

      // Simulate API calls
      for (const user of validUsers) {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Mock API call - replace with actual implementation
      }

      toast({
        title: "Bulk Update Successful",
        description: `Removed ${permission} permission from ${validUsers.length} user(s).`,
      });

      clearSelection();
      return true;
    } catch (err) {
      toast({
        title: "Bulk Update Failed",
        description: err instanceof Error ? err.message : "Failed to update permissions",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedUsers, toast, clearSelection]);

  return {
    selectedUsers,
    isProcessing,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    bulkAddPermission,
    bulkRemovePermission,
  };
}