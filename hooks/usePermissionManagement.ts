import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  type UserWithPermissions,
  type PermissionItem,
  type PermissionDiff,
  type UpdateUserPermissionsRequest,
  type GetPermissionsResponse,
} from '@/lib/types/permissions';
import { getUserFromStorage } from '@/lib/auth';
import { getAccessToken } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ============== FETCH PERMISSIONS FROM API ==============

export function usePermissions() {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    description: string;
    permissions: PermissionItem[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const result: GetPermissionsResponse = await response.json();

      // Transform API response to category structure
      const categoryData = [
        {
          id: 'upload_and_data_management',
          name: 'Upload & Data Management',
          description: 'Permissions for uploading and managing various types of data',
          permissions: result.data.upload_and_data_management || [],
        },
        {
          id: 'review_and_approval',
          name: 'Review & Approval',
          description: 'Permissions for reviewing and approving reports and submissions',
          permissions: result.data.regional_management || [],
        },
        {
          id: 'dashboard_and_analytics',
          name: 'Dashboard & Analytics',
          description: 'Permissions for viewing dashboards and analytical tools',
          permissions: result.data.claims_management || [],
        },
        {
          id: 'record_management',
          name: 'Record Management',
          description: 'Permissions for managing individual records and data entries',
          permissions: result.data.admin_role || [],
        },
        {
          id: 'user_and_role_management',
          name: 'User & Role Management',
          description: 'Permissions for managing users, roles, and permissions',
          permissions: result.data.hod_role || [],
        },
        {
          id: 'system_administration',
          name: 'System Administration',
          description: 'High-level system administration permissions',
          permissions: result.data.other || [],
        },
      ];

      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    categories,
    loading,
    error,
    refetch: fetchPermissions,
  };
}

// ============== USERS HOOK ==============

export function useUsersWithPermissions() {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    console.log('===== fetchUsers CALLED - NEW VERSION =====');
    try {
      setLoading(true);
      setError(null);

      const token = getAccessToken();
      console.log('Token:', token ? 'exists' : 'missing');
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();

      // Fetch all available permissions to map user permission names to full objects
      let allPermissions: PermissionItem[] = [];
      try {
        console.log('Fetching permissions from:', `${API_BASE_URL}/api/admin/users/permissions`);
        const permissionsResponse = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Permissions response status:', permissionsResponse.status, permissionsResponse.ok);

        if (permissionsResponse.ok) {
          const permissionsResult = await permissionsResponse.json();
          console.log('Permissions API response:', permissionsResult);
          // Extract all permissions from categories
          const categories = permissionsResult.data || [];
          console.log('Categories found:', categories.length);

          allPermissions = categories.flatMap((cat: any) => {
            console.log(`Category ${cat.name} has ${cat.permissions?.length || 0} permissions`);
            return (cat.permissions || []).map((perm: any) => ({
              id: perm.id,
              name: perm.name,
              description: perm.description,
            }));
          });
          console.log('All permissions loaded:', allPermissions.length);
        } else {
          console.error('Permissions fetch failed with status:', permissionsResponse.status);
          const errorText = await permissionsResponse.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Failed to fetch permissions list:', error);
      }

      // Transform API response to match our UserWithPermissions interface
      // Fetch permissions for each user individually
      const transformedUsers: UserWithPermissions[] = await Promise.all(
        (result.data || []).map(async (user: any) => {
          let permissions: PermissionItem[] = [];
          console.log(`Processing user ${user.first_name}, allPermissions available:`, allPermissions.length);

          // Try to fetch individual user details to get permissions
          try {
            const userDetailResponse = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (userDetailResponse.ok) {
              const userDetail = await userDetailResponse.json();
              const userPermissionNames = userDetail.data?.user_permissions || [];

              // Map permission names to full permission objects
              if (allPermissions.length > 0) {
                permissions = allPermissions.filter(perm =>
                  userPermissionNames.includes(perm.name)
                );
              } else {
                // Fallback: create placeholder objects using permission names
                permissions = userPermissionNames.map((name: string, index: number) => ({
                  id: `${user.id}-perm-${index}`,
                  name: name,
                  description: name.replace(/_/g, ' ').replace(/^can /, 'Can '),
                }));
              }
            }
          } catch (error) {
            console.error(`Failed to fetch permissions for user ${user.id}:`, error);
          }

          return {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`.trim(),
            email: user.email,
            role: user.role || 'user',
            permissions,
            createdAt: user.created_at,
            lastLogin: user.last_login || user.updated_at,
            isActive: user.account_status === 'active',
          };
        })
      );

      setUsers(transformedUsers);
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
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [originalPermissions, setOriginalPermissions] = useState<PermissionItem[]>([]);
  const [editedPermissions, setEditedPermissions] = useState<PermissionItem[]>([]);
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
    const added = editedPermissions
      .filter(p => !originalPermissions.some(op => op.id === p.id))
      .map(p => p.id);
    const removed = originalPermissions
      .filter(p => !editedPermissions.some(ep => ep.id === p.id))
      .map(p => p.id);
    const unchanged = originalPermissions
      .filter(p => editedPermissions.some(ep => ep.id === p.id))
      .map(p => p.id);

    return { added, removed, unchanged };
  }, [originalPermissions, editedPermissions]);

  // Check if there are changes
  const hasChanges = permissionDiff.added.length > 0 || permissionDiff.removed.length > 0;

  // Toggle permission
  const togglePermission = useCallback((permission: PermissionItem) => {
    if (!selectedUser || !currentUser) return;

    const isCurrentlySelected = editedPermissions.some(ep => ep.id === permission.id);

    if (isCurrentlySelected) {
      setEditedPermissions(prev => prev.filter(p => p.id !== permission.id));
    } else {
      setEditedPermissions(prev => [...prev, permission]);
    }
  }, [selectedUser, currentUser, editedPermissions, toast]);

  // Open editor and fetch user's current permissions
  const openEditor = useCallback(async (userToEdit: UserWithPermissions) => {
    console.log('=== OPENING EDITOR ===');
    console.log('User:', userToEdit.name);
    console.log('User has permissions in state:', userToEdit.permissions.length);

    setIsOpen(true);
    setSelectedUser(userToEdit);

    // Fetch user's current permissions from API
    try {
      const token = getAccessToken();

      // First, fetch all available permissions
      const permissionsResponse = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let allPermissions: PermissionItem[] = [];
      if (permissionsResponse.ok) {
        const permissionsResult = await permissionsResponse.json();
        console.log('Permissions result:', permissionsResult);
        const categories = permissionsResult.data || [];
        console.log('Categories type:', typeof categories, 'Is array?', Array.isArray(categories));

        if (Array.isArray(categories)) {
          allPermissions = categories.flatMap((cat: any) =>
            (cat.permissions || []).map((perm: any) => ({
              id: perm.id,
              name: perm.name,
              description: perm.description,
            }))
          );
        } else if (categories && typeof categories === 'object') {
          // If categories is an object, try to extract permissions from it
          console.log('Categories is object, keys:', Object.keys(categories));
          allPermissions = Object.values(categories).flatMap((cat: any) =>
            (cat.permissions || []).map((perm: any) => ({
              id: perm.id,
              name: perm.name,
              description: perm.description,
            }))
          );
        }
        console.log('Loaded all permissions:', allPermissions.length);
      } else {
        console.log('Failed to load all permissions');
      }

      // Then fetch user's permissions
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userToEdit.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const userPermissionNames = result.data?.user_permissions || [];
        console.log('User has permission names from API:', userPermissionNames.length);

        let userPermissions: PermissionItem[];

        // Map permission names to full permission objects
        if (allPermissions.length > 0) {
          userPermissions = allPermissions.filter(perm =>
            userPermissionNames.includes(perm.name)
          );
          console.log('Mapped to objects:', userPermissions.length);
        } else {
          // Fallback: create permission objects from names
          userPermissions = userPermissionNames.map((name: string, index: number) => ({
            id: `${userToEdit.id}-perm-${index}`,
            name: name,
            description: name.replace(/_/g, ' ').replace(/^can /, 'Can '),
          }));
          console.log('Created fallback objects:', userPermissions.length);
        }

        console.log('Setting permissions:', userPermissions.length);
        console.log('First 3 permissions:', userPermissions.slice(0, 3));
        setOriginalPermissions(userPermissions);
        setEditedPermissions(userPermissions);
      } else {
        console.log('User API failed, using existing permissions');
        setOriginalPermissions(userToEdit.permissions);
        setEditedPermissions(userToEdit.permissions);
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      setOriginalPermissions(userToEdit.permissions);
      setEditedPermissions(userToEdit.permissions);
    }
  }, []);

  // Close editor
  const closeEditor = useCallback(() => {
    setIsOpen(false);
    // Reset state after animation completes
    setTimeout(() => {
      setSelectedUser(null);
      setOriginalPermissions([]);
      setEditedPermissions([]);
    }, 200);
  }, []);

  // Save permissions
  const savePermissions = useCallback(async (): Promise<boolean> => {
    if (!selectedUser || !hasChanges) return false;

    try {
      setIsSaving(true);

      const token = getAccessToken();

      // Handle additions
      if (permissionDiff.added.length > 0) {
        const addRequest: UpdateUserPermissionsRequest = {
          action: 'assign',
          user_ids: [selectedUser.id],
          permission_ids: permissionDiff.added,
        };

        const addResponse = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(addRequest),
        });

        if (!addResponse.ok) {
          throw new Error('Failed to add permissions');
        }
      }

      // Handle removals
      if (permissionDiff.removed.length > 0) {
        const removeRequest: UpdateUserPermissionsRequest = {
          action: 'remove',
          user_ids: [selectedUser.id],
          permission_ids: permissionDiff.removed,
        };

        const removeResponse = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(removeRequest),
        });

        if (!removeResponse.ok) {
          throw new Error('Failed to remove permissions');
        }
      }

      toast({
        title: "Permissions Updated",
        description: `Successfully updated permissions for ${selectedUser.name}.`,
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
  }, [selectedUser, hasChanges, permissionDiff, toast]);

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
  const [permissionFilter, setPermissionFilter] = useState<string>('all');

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
        user.permissions.some(p => p.id === permissionFilter);

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
    permissionId: string
  ): Promise<boolean> => {
    if (selectedUsers.length === 0) return false;

    try {
      setIsProcessing(true);

      const token = getAccessToken();
      const request: UpdateUserPermissionsRequest = {
        action: 'assign',
        user_ids: selectedUsers,
        permission_ids: [permissionId],
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to add permissions');
      }

      toast({
        title: "Bulk Update Successful",
        description: `Added permission to ${selectedUsers.length} user(s).`,
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
    permissionId: string
  ): Promise<boolean> => {
    if (selectedUsers.length === 0) return false;

    try {
      setIsProcessing(true);

      const token = getAccessToken();
      const request: UpdateUserPermissionsRequest = {
        action: 'remove',
        user_ids: selectedUsers,
        permission_ids: [permissionId],
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to remove permissions');
      }

      toast({
        title: "Bulk Update Successful",
        description: `Removed permission from ${selectedUsers.length} user(s).`,
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
