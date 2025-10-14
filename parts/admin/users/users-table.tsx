import { Search, Edit2, Trash2, Plus } from "lucide-react";
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
import { getRoleBadgeColor } from "@/lib/utils";
import { NewUserForm, User } from "@/lib/types";
import { ROLES } from "@/lib/Constants/constants";

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
              {user.name}
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
                  user.status === "Active"
                    ? "bg-green-100 text-green-700 font-medium text-xs"
                    : "bg-blue-100 text-blue-700 font-medium text-xs"
                }
              >
                {user.status}
              </Badge>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {user.date_added}
            </td>
            <td className="px-6 py-4 text-sm flex gap-2">
              <Button
                onClick={() => onEdit(user)}
                variant={"outline"}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onDeleteClick(user.id)}
                variant={"outline"}
                className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-600 hover:text-red-900"
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
}> = ({ isOpen, onOpenChange, onSave, formData, onFormChange, isEditing }) => (
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
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-900">
            Phone Number
          </label>
          <Input
            placeholder="+234 XXX XXX XXXX"
            value={formData.phone}
            onChange={(e) =>
              onFormChange({ ...formData, phone: e.target.value })
            }
            className="mt-1 border-gray-200 text-sm"
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
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-900">
            Branch/Region
          </label>
          <Select
            value={formData.branch}
            onValueChange={(value) =>
              onFormChange({ ...formData, branch: value })
            }
          >
            <SelectTrigger className="mt-1 border-gray-200 text-sm">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="headquarters">Headquarters</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="text-sm"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          style={{ backgroundColor: "#00a63e" }}
          className="text-white text-sm hover:opacity-90"
        >
          {isEditing ? "Save Changes" : "Create User"}
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
}> = ({ isOpen, onOpenChange, onConfirm, userName }) => (
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
        <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white text-sm"
        >
          Delete
        </AlertDialogAction>
      </div>
    </AlertDialogContent>
  </AlertDialog>
);