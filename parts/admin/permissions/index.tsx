/**
 * Permission Management Page
 *
 * Main page component that orchestrates the permission management feature.
 * Combines the PermissionManager and PermissionEditor components.
 */

"use client";

import React from "react";
import { PermissionManager } from "@/components/permission-manager";
import { PermissionEditor } from "@/components/permission-editor";
import { PermissionGuard } from "@/components/permission-guard";
import {
  usePermissionEditor,
  usePermissions,
} from "@/hooks/usePermissionManagement";
import type { UserWithPermissions } from "@/lib/types/permissions";

export default function PermissionManagementPage() {
  // Fetch permission categories
  const { categories } = usePermissions();

  // Permission editor state
  const {
    isOpen,
    originalPermissions,
    editedPermissions,
    roleDefaultPermissionNames,
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
  const [selectedUser, setSelectedUser] =
    React.useState<UserWithPermissions | null>(null);

  // Ref to store the update callback
  const updateCallbackRef = React.useRef<
    ((userId: string, newPermissions: any[]) => void) | null
  >(null);

  // Handle registering the update callback
  const handleRegisterCallback = React.useCallback(
    (callback: (userId: string, newPermissions: any[]) => void) => {
      updateCallbackRef.current = callback;
    },
    []
  );

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
  const handleSavePermissions = React.useCallback(async () => {
    const success = await savePermissions();

    if (success && selectedUser && updateCallbackRef.current) {
      // Update the user's permissions in the table without refetching
      updateCallbackRef.current(selectedUser.id, editedPermissions);
    }
    return success;
  }, [savePermissions, selectedUser, editedPermissions]);

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
      <div className="space-y-10">
        <PermissionManager
          onManagePermissions={handleManagePermissions}
          onRegisterUpdateCallback={handleRegisterCallback}
        />

        <PermissionEditor
          isOpen={isOpen}
          user={selectedUser}
          originalPermissions={originalPermissions}
          editedPermissions={editedPermissions}
          roleDefaultPermissionNames={roleDefaultPermissionNames}
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
    </PermissionGuard>
  );
}
