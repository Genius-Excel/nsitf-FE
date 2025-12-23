"use client";

import React from "react";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DeleteConfirmationDialog,
  RolePermissionsOverview,
  SearchAndFilter,
  UserFormModal,
  UsersTable,
} from "./users-table";
import {
  useUsers,
  useUserFilters,
  useUserForm,
  useUserMutations,
  useDeleteDialog,
  useRoles,
} from "@/hooks/users";

/**
 * REFACTORED Users & Roles Management
 *
 * Key improvements:
 * - Single source of truth (no state duplication)
 * - Pessimistic updates (refetch on success)
 * - Memoized filtering (no duplicate filteredUsers state)
 * - Encapsulated form logic (useUserForm hook)
 * - Consistent error handling (toast notifications)
 * - Clean separation of concerns
 */
export default function UsersRolesManagement() {
  // ============== DATA FETCHING ==============
  // Single fetch - source of truth
  const { data: users, loading, error, refetch } = useUsers();

  // Fetch roles from API
  const { data: roles } = useRoles();

  // ============== FILTERING ==============
  // Memoized filtering - no duplicate state
  const {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    resetFilters,
    hasActiveFilters,
  } = useUserFilters(users);

  // ============== FORM MANAGEMENT ==============
  // Encapsulated form state
  const {
    isOpen: isModalOpen,
    setIsOpen: setIsModalOpen,
    formData,
    updateForm,
    openForCreate,
    openForEdit,
    closeForm,
    validate,
    isEditing,
    editingUserId,
  } = useUserForm();

  // ============== MUTATIONS ==============
  // Pessimistic updates - refetch on success
  const {
    addUser,
    editUser,
    isLoading: isSaving,
  } = useUserMutations({
    onSuccess: () => {
      refetch(); // Refetch to get fresh data
      closeForm(); // Close modal
    },
  });

  // ============== DELETE DIALOG ==============
  const {
    isOpen: isDeleteDialogOpen,
    userId: deleteUserId,
    userName: deleteUserName,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDeleteDialog();

  const { deleteUser, isLoading: isDeleting } = useUserMutations({
    onSuccess: () => {
      refetch(); // Refetch to get fresh data
      closeDeleteDialog(); // Close dialog
    },
  });

  // ============== HANDLERS ==============

  const handleEditUser = (user: any) => {
    // Map role name to role ID if needed
    let roleId = user.role;

    // If the user.role is a name string (not a UUID), find the matching role ID
    if (roles && roleId && !roleId.includes("-")) {
      // It's likely a role name, find the role ID
      const matchingRole = roles.find(
        (r) => r.name.toLowerCase() === roleId.toLowerCase()
      );
      if (matchingRole) {
        roleId = matchingRole.id;
        console.log(`Mapped role name "${user.role}" to role ID "${roleId}"`);
      }
    }

    // Create a modified user object with the correct role ID
    const userWithRoleId = {
      ...user,
      role: roleId,
    };

    openForEdit(userWithRoleId);
  };

  const handleSaveUser = async () => {
    // Validate form
    const { isValid, errors } = validate();
    if (!isValid) {
      // Show first error (toast already shown by mutation hook)
      console.error("Validation errors:", errors);
      return;
    }

    try {
      if (isEditing && editingUserId) {
        await editUser(editingUserId, formData);
      } else {
        await addUser(formData);
      }
      // Success handling done in mutation hook (toast + onSuccess callback)
    } catch (err) {
      // Error handling done in mutation hook (toast)
      // Modal stays open for retry
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser(deleteUserId, deleteUserName);
      // Success handling done in mutation hook (toast + onSuccess callback)
    } catch (err) {
      // Error handling done in mutation hook (toast)
      // Dialog stays open for retry
    }
  };

  // ============== NAVIGATION ==============
  const router = useRouter();

  const handleManagePermissions = () => {
    router.push("/admin/dashboard/permissions");
  };

  // ============== RENDER ==============

  return (
    <div className="space-y-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Users & Roles Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage staff accounts and role assignments
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleManagePermissions}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 text-sm font-medium transition-colors duration-200"
              aria-label="Manage permissions"
            >
              <Shield className="w-4 h-4 mr-2" />
              Manage Permissions
            </Button>
            <Button
              onClick={openForCreate}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors duration-200"
              aria-label="Add new user"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center">
            <span>Failed to load users: {error}</span>
            <Button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white"
              aria-label="Retry loading users"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterRole={filterRole}
          onFilterChange={setFilterRole}
          roles={roles || []}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* No Data State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            {hasActiveFilters ? (
              <>
                <p className="text-gray-500 mb-4">
                  No users found matching your filters.
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <p className="text-gray-500">
                No users found. Click "Add New User" to create one.
              </p>
            )}
          </div>
        )}

        {/* Users Table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <UsersTable
              users={filteredUsers}
              roles={roles}
              onEdit={handleEditUser}
              onDeleteClick={(userId) => {
                const user = users?.find((u: any) => u.id === userId);
                if (user) {
                  openDeleteDialog(
                    userId,
                    `${user.first_name} ${user.last_name}`.trim() || user.email
                  );
                }
              }}
            />
          </div>
        )}

        {/* Role Permissions Overview */}
        <div className="mt-6">
          <RolePermissionsOverview roles={roles || []} />
        </div>

        {/* User Form Modal */}
        <UserFormModal
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            // Allow closing unless save is in progress
            if (!open && isSaving) {
              return; // Block close during save
            }
            if (open) {
              setIsModalOpen(true);
            } else {
              closeForm();
            }
          }}
          onSave={handleSaveUser}
          formData={formData}
          onFormChange={updateForm}
          isEditing={isEditing}
          isSaving={isSaving}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={(open) => {
            // Allow closing unless delete is in progress
            if (!open && isDeleting) {
              return; // Block close during delete
            }
            if (open) {
              // Opening is controlled by openDeleteDialog
            } else {
              closeDeleteDialog();
            }
          }}
          onConfirm={handleConfirmDelete}
          userName={deleteUserName}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
