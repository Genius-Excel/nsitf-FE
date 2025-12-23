"use client";

import { useEffect } from "react";
import { Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate, getRoleBadgeColor, getRoleDisplayName } from "@/lib/utils";
import { NewUserForm, User } from "@/lib/types";
import { useRegions } from "@/hooks/compliance/Useregions";
import { useBranches, useRoles, type Role } from "@/hooks/users";

export const UsersTable: React.FC<{
  users: User[];
  onEdit: (user: User) => void;
  onDeleteClick: (userId: string) => void;
  roles?: Role[] | null;
}> = ({ users, onEdit, onDeleteClick, roles = null }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center break-words">
              Name
            </th>
            <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center break-words">
              Email
            </th>
            <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center break-words">
              Role
            </th>
            <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center break-words">
              Status
            </th>
            <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center break-words">
              Date Added
            </th>
            <th className="px-2 py-1.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide text-center break-words">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
              <td className="px-6 py-4 text-sm">
                <Badge
                  className={`${getRoleBadgeColor(
                    getRoleDisplayName(user.role, roles)
                  )} font-medium text-xs`}
                >
                  {getRoleDisplayName(user.role, roles)}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge
                  className={
                    user.account_status === "active"
                      ? "bg-green-100 text-green-700 font-medium text-xs"
                      : "bg-gray-100 text-gray-700 font-medium text-xs"
                  }
                >
                  {user.account_status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(user.created_at)}
              </td>
              <td className="px-6 py-4 text-sm flex gap-2">
                <Button
                  onClick={() => onEdit(user)}
                  variant={"outline"}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
                  aria-label="Edit user"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onDeleteClick(user.id)}
                  variant={"outline"}
                  className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-600 hover:text-red-900"
                  aria-label="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SearchAndFilter: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterRole: string;
  onFilterChange: (value: string) => void;
  roles?: Role[];
}> = ({
  searchTerm,
  onSearchChange,
  filterRole,
  onFilterChange,
  roles = [],
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
    <div className="flex gap-3 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or role..."
          className="pl-10 border-gray-200"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={filterRole} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48 border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Roles">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.roleName}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export const RolePermissionsOverview: React.FC<{
  roles?: Role[];
}> = ({ roles = [] }) => (
  <div className="mt-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Role Permissions Overview
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {roles.map((role) => (
        <div
          key={role.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {role.name}
          </h3>
          {role.description && (
            <p className="text-xs text-gray-600">{role.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const UserFormModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  formData: NewUserForm;
  onFormChange: (data: NewUserForm) => void;
  isEditing: boolean;
  isSaving?: boolean;
}> = ({
  isOpen,
  onOpenChange,
  onSave,
  formData,
  onFormChange,
  isEditing,
  isSaving = false,
}) => {
  // Fetch regions
  const { data: regions, loading: regionsLoading } = useRegions();

  // Fetch roles
  const { data: roles, loading: rolesLoading, error: rolesError } = useRoles();

  // Debug roles
  useEffect(() => {
    console.log("Roles in modal:", roles);
    console.log("Roles loading:", rolesLoading);
    console.log("Roles error:", rolesError);
  }, [roles, rolesLoading, rolesError]);

  // Fetch branches when region is selected
  const { data: branches, fetchBranches, clearBranches } = useBranches();

  // Fetch branches when region changes
  useEffect(() => {
    if (formData.region_id) {
      fetchBranches(formData.region_id);
    } else {
      clearBranches();
    }
  }, [formData.region_id, fetchBranches, clearBranches]);

  // Clear region and branch when organizational level changes
  const handleOrgLevelChange = (value: string) => {
    onFormChange({
      ...formData,
      organizational_level: value,
      region_id: "",
      branch_id: "",
    });
  };

  // Clear branch when region changes
  const handleRegionChange = (value: string) => {
    onFormChange({
      ...formData,
      region_id: value,
      branch_id: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Edit User" : "Onboard New User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-900">
                First Name *
              </label>
              <Input
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={(e) =>
                  onFormChange({ ...formData, first_name: e.target.value })
                }
                className="mt-1 border-gray-200 text-sm"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-900">
                Last Name
              </label>
              <Input
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={(e) =>
                  onFormChange({ ...formData, last_name: e.target.value })
                }
                className="mt-1 border-gray-200 text-sm"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-900">
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="user@nsitf.gov.ng"
              value={formData.email}
              onChange={(e) =>
                onFormChange({ ...formData, email: e.target.value })
              }
              className="mt-1 border-gray-200 text-sm"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-900">
              Phone Number
            </label>
            <Input
              placeholder="+234 XXX XXX XXXX"
              value={formData.phone_number}
              onChange={(e) =>
                onFormChange({ ...formData, phone_number: e.target.value })
              }
              className="mt-1 border-gray-200 text-sm"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-900">
              Assign Role *
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                onFormChange({ ...formData, role: value })
              }
              disabled={isSaving || rolesLoading}
            >
              <SelectTrigger className="mt-1 border-gray-200 text-sm">
                <SelectValue
                  placeholder={rolesLoading ? "Loading..." : "Select a role"}
                />
              </SelectTrigger>
              <SelectContent>
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {rolesLoading
                      ? "Loading roles..."
                      : rolesError
                      ? `Error: ${rolesError}`
                      : "No roles available"}
                  </div>
                )}
              </SelectContent>
            </Select>
            {rolesError && (
              <p className="text-xs text-red-600 mt-1">
                Failed to load roles. Please refresh or contact support.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-900">
              Department
            </label>
            <Input
              placeholder="Enter department"
              value={formData.department}
              onChange={(e) =>
                onFormChange({ ...formData, department: e.target.value })
              }
              className="mt-1 border-gray-200 text-sm"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-900">
              Organizational Level *
            </label>
            <Select
              value={formData.organizational_level}
              onValueChange={handleOrgLevelChange}
              disabled={isSaving}
            >
              <SelectTrigger className="mt-1 border-gray-200 text-sm">
                <SelectValue placeholder="Select organizational level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hq">Headquarters (HQ)</SelectItem>
                <SelectItem value="region">Region</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Region selector for Region and Branch levels */}
          {(formData.organizational_level === "region" ||
            formData.organizational_level === "branch") && (
            <div>
              <label className="text-xs font-semibold text-gray-900">
                Region *
              </label>
              <Select
                value={formData.region_id}
                onValueChange={handleRegionChange}
                disabled={isSaving || regionsLoading}
              >
                <SelectTrigger className="mt-1 border-gray-200 text-sm">
                  <SelectValue
                    placeholder={
                      regionsLoading ? "Loading..." : "Select region"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {regions?.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show Branch selector only for Branch level */}
          {formData.organizational_level === "branch" && formData.region_id && (
            <div>
              <label className="text-xs font-semibold text-gray-900">
                Branch *
              </label>
              {branches && branches.length > 0 ? (
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) =>
                    onFormChange({ ...formData, branch_id: value })
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger className="mt-1 border-gray-200 text-sm">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <Input
                    placeholder="Enter branch ID"
                    value={formData.branch_id}
                    onChange={(e) =>
                      onFormChange({ ...formData, branch_id: e.target.value })
                    }
                    className="mt-1 border-gray-200 text-sm"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Branch selection is not available. Please enter the
                    branch ID manually or contact your administrator.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-sm"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            style={{ backgroundColor: "#00a63e" }}
            className="text-white text-sm hover:opacity-90 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteConfirmationDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  isDeleting?: boolean;
}> = ({ isOpen, onOpenChange, onConfirm, userName, isDeleting = false }) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete User</AlertDialogTitle>
        <AlertDialogDescription className="text-sm">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">{userName}</span>? This
          action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="flex gap-3 justify-end">
        <AlertDialogCancel className="text-sm" disabled={isDeleting}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </AlertDialogAction>
      </div>
    </AlertDialogContent>
  </AlertDialog>
);
