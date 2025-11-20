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
import { formatDate, getRoleBadgeColor } from "@/lib/utils";
import { NewUserForm, User } from "@/lib/types";
import { ROLES } from "@/lib/Constants";

export const UsersTable: React.FC<{
  users: User[];
  onEdit: (user: User) => void;
  onDeleteClick: (userId: string) => void;
}> = ({ users, onEdit, onDeleteClick }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead className="bg-white border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Date Added
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                  user.role
                )} font-medium text-xs`}
              >
                {user.role}
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
);

export const SearchAndFilter: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterRole: string;
  onFilterChange: (value: string) => void;
}> = ({ searchTerm, onSearchChange, filterRole, onFilterChange }) => (
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
          {ROLES.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export const RolePermissionsOverview: React.FC = () => (
  <div className="mt-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Role Permissions Overview
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {ROLES.map((role) => (
        <div
          key={role.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {role.label}
          </h3>
          <p className="text-xs text-gray-600">{role.description}</p>
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
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
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
            disabled={isSaving}
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            Branch/Region
          </label>
          <Select
            value={formData.region}
            onValueChange={(value) =>
              onFormChange({ ...formData, region: value })
            }
            disabled={isSaving}
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Abuja">Abuja</SelectItem>
              <SelectItem value="Lagos">Lagos</SelectItem>
              <SelectItem value="Kano">Kano</SelectItem>
              <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
              <SelectItem value="Ibadan">Ibadan</SelectItem>
              <SelectItem value="Enugu">Enugu</SelectItem>
              <SelectItem value="Kaduna">Kaduna</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create User"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

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
