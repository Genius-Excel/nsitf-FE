/**
 * Permission Management Page
 *
 * Main page component that orchestrates the permission management feature.
 * Combines the PermissionManager and PermissionEditor components.
 */

"use client";

import React from 'react';
import { PermissionManager } from '@/components/permission-manager';
import { PermissionEditor } from '@/components/permission-editor';
import { PermissionGuard } from '@/components/permission-guard';
import { usePermissionEditor, usePermissions } from '@/hooks/usePermissionManagement';
import type { UserWithPermissions } from '@/lib/types/permissions';

export default function PermissionManagementPage() {
  // Fetch permission categories
  const { categories } = usePermissions();

  // Permission editor state
  const {
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
  } = usePermissionEditor(null);

  // Currently selected user for editing
  const [selectedUser, setSelectedUser] = React.useState<UserWithPermissions | null>(null);

  // Callback to update user after permissions are saved
  const [onPermissionsUpdated, setOnPermissionsUpdated] = React.useState<((userId: string, newPermissions: any[]) => void) | null>(null);

  // Handle opening the permission editor
  const handleManagePermissions = async (user: UserWithPermissions) => {
    setSelectedUser(user);
    await openEditor(user);
  };

  // Handle closing the editor
  const handleCloseEditor = () => {
    closeEditor();
    setSelectedUser(null);
  };

  // Handle save with optimistic update
  const handleSavePermissions = async () => {
    const success = await savePermissions();
    if (success && selectedUser && onPermissionsUpdated) {
      // Update the user's permissions in the table without refetching
      onPermissionsUpdated(selectedUser.id, editedPermissions);
    }
    return success;
  };

  return (
    <PermissionGuard
      requiredPermissions={["can_manage_roles"]}
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-500">
              You don't have permission to manage user permissions.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PermissionManager
            onManagePermissions={handleManagePermissions}
            onRegisterUpdateCallback={setOnPermissionsUpdated}
          />

          <PermissionEditor
            isOpen={isOpen}
            user={selectedUser}
            originalPermissions={originalPermissions}
            editedPermissions={editedPermissions}
            permissionDiff={permissionDiff}
            hasChanges={hasChanges}
            isSaving={isSaving}
            categories={categories}
            onClose={handleCloseEditor}
            onTogglePermission={togglePermission}
            onSave={handleSavePermissions}
            onReset={resetChanges}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
