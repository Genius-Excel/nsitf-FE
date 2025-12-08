/**
 * Permission Manager Component
 *
 * Main interface for managing user permissions within the admin dashboard.
 * Provides comprehensive user management with search, filtering, and bulk operations.
 */

"use client";

import React from 'react';
import { Search, Users, X, Plus, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/design-system/LoadingState';
import { ErrorState } from '@/components/design-system/ErrorState';
import {
  useUsersWithPermissions,
  useUserPermissionFilters,
  useBulkPermissionOperations,
  usePermissions,
} from '@/hooks/usePermissionManagement';
import {
  type UserWithPermissions,
  type PermissionItem,
} from '@/lib/types/permissions';

// ============== USER TABLE ROW COMPONENT ==============

interface UserRowProps {
  user: UserWithPermissions;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onManagePermissions: (user: UserWithPermissions) => void;
}

function UserRow({ user, isSelected, onSelectChange, onManagePermissions }: UserRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
          aria-label={`Select ${user.name}`}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="capitalize">
          {user.role.replace('_', ' ')}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{user.permissions.length}</span>
          <span className="text-xs text-gray-500">permissions</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {user.lastLogin ? (
            <span>Last: {new Date(user.lastLogin).toLocaleDateString()}</span>
          ) : (
            <span>Never logged in</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Button
          onClick={() => onManagePermissions(user)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          aria-label={`Manage permissions for ${user.name}`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Permissions
        </Button>
      </td>
    </tr>
  );
}

// ============== FILTER BAR COMPONENT ==============

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  permissionFilter: string;
  onPermissionFilterChange: (permission: string) => void;
  availableRoles: string[];
  allPermissions: PermissionItem[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

function FilterBar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  permissionFilter,
  onPermissionFilterChange,
  availableRoles,
  allPermissions,
  hasActiveFilters,
  onResetFilters,
}: FilterBarProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="capitalize">{role.replace('_', ' ')}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permission Filter */}
          <div className="w-full lg:w-64">
            <Select
              value={permissionFilter}
              onValueChange={onPermissionFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Permissions</SelectItem>
                {allPermissions.map((permission: PermissionItem) => (
                  <SelectItem key={permission.id} value={permission.id}>
                    {permission.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              onClick={onResetFilters}
              variant="outline"
              className="w-full lg:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============== BULK ACTIONS BAR ==============

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAddPermission: (permissionId: string) => void;
  onBulkRemovePermission: (permissionId: string) => void;
  isProcessing: boolean;
  allPermissions: PermissionItem[];
}

function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkAddPermission,
  onBulkRemovePermission,
  isProcessing,
  allPermissions,
}: BulkActionsBarProps) {
  const [selectedPermission, setSelectedPermission] = React.useState<string>('none');

  if (selectedCount === 0) return null;

  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardContent className="pt-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-green-800">
              {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Button
              onClick={onClearSelection}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Clear Selection
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Select
              value={selectedPermission}
              onValueChange={setSelectedPermission}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select permission to manage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a permission</SelectItem>
                {allPermissions.map((permission: PermissionItem) => (
                  <SelectItem key={permission.id} value={permission.id}>
                    {permission.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => selectedPermission !== 'none' && onBulkAddPermission(selectedPermission)}
              disabled={selectedPermission === 'none' || isProcessing}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>

            <Button
              onClick={() => selectedPermission !== 'none' && onBulkRemovePermission(selectedPermission)}
              disabled={selectedPermission === 'none' || isProcessing}
              variant="destructive"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============== MAIN PERMISSION MANAGER COMPONENT ==============

interface PermissionManagerProps {
  onManagePermissions: (user: UserWithPermissions) => void;
  onRegisterUpdateCallback?: (callback: (userId: string, newPermissions: PermissionItem[]) => void) => void;
}

export function PermissionManager({ onManagePermissions, onRegisterUpdateCallback }: PermissionManagerProps) {
  // Router for navigation
  const router = useRouter();

  // Data fetching
  const { users, loading, error, refetch } = useUsersWithPermissions();
  const { categories, loading: loadingPermissions } = usePermissions();

  // Local state for users to enable optimistic updates
  const [localUsers, setLocalUsers] = React.useState<UserWithPermissions[]>(users);

  // Update local users when API users change
  React.useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // Register the update callback with the parent
  React.useEffect(() => {
    if (onRegisterUpdateCallback) {
      const updateCallback = (userId: string, newPermissions: PermissionItem[]) => {
        setLocalUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, permissions: newPermissions }
              : user
          )
        );
      };
      onRegisterUpdateCallback(updateCallback);
    }
  }, [onRegisterUpdateCallback]);

  // Get all permissions from categories
  const allPermissions = React.useMemo(() => {
    return categories.flatMap(cat => cat.permissions);
  }, [categories]);

  // Filtering
  const {
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
  } = useUserPermissionFilters(localUsers);

  // Bulk operations
  const {
    selectedUsers,
    isProcessing,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    bulkAddPermission,
    bulkRemovePermission,
  } = useBulkPermissionOperations();

  // Handle bulk operations with refetch
  const handleBulkAddPermission = async (permissionId: string) => {
    const success = await bulkAddPermission(permissionId);
    if (success) {
      refetch();
    }
  };

  const handleBulkRemovePermission = async (permissionId: string) => {
    const success = await bulkRemovePermission(permissionId);
    if (success) {
      refetch();
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllUsers(filteredUsers.map(user => user.id));
    } else {
      clearSelection();
    }
  };

  const isAllSelected = filteredUsers.length > 0 &&
    filteredUsers.every(user => selectedUsers.includes(user.id));
  const isPartiallySelected = selectedUsers.length > 0 && !isAllSelected;

  // Loading state
  if (loading || loadingPermissions) {
    return <LoadingState message="Loading users and permissions..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to Load Users"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-500 mt-2">
            Assign and manage permissions for {localUsers.length} user{localUsers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => router.push('/admin/dashboard/users')}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Users
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{filteredUsers.length} displayed</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        permissionFilter={permissionFilter}
        onPermissionFilterChange={setPermissionFilter}
        availableRoles={availableRoles}
        allPermissions={allPermissions}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedUsers.length}
        onClearSelection={clearSelection}
        onBulkAddPermission={handleBulkAddPermission}
        onBulkRemovePermission={handleBulkRemovePermission}
        isProcessing={isProcessing}
        allPermissions={allPermissions}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users & Permissions</CardTitle>
          <CardDescription>
            Manage individual user permissions or use bulk operations above
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              {hasActiveFilters ? (
                <>
                  <p className="text-gray-500 mb-4">
                    No users found matching your filters.
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Clear Filters
                  </Button>
                </>
              ) : (
                <p className="text-gray-500">
                  No users available for permission management.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all users"
                        className={isPartiallySelected ? "data-[state=indeterminate]:bg-primary" : ""}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Permissions
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Last Login
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isSelected={selectedUsers.includes(user.id)}
                      onSelectChange={() => toggleUserSelection(user.id)}
                      onManagePermissions={onManagePermissions}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
