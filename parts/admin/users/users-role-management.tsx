import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  DeleteConfirmationDialog,
  RolePermissionsOverview,
  SearchAndFilter,
  UserFormModal,
  UsersTable,
} from "./users-table";
import { NewUserForm, User } from "@/lib/types";
import { useGetUsers } from "@/services/admin/index";

export default function UsersRolesManagement() {
  // ============== STATE ==============
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState<NewUserForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    branch: "",
  });
  const { gettingUserData, refetchUserData, userData, userDataError } = useGetUsers({ enabled: true });

  // ============== EFFECTS ==============
  useEffect(() => {
    if (userData) {
      setFilteredUsers(userData);
      setUsers(userData);
    }
  }, [userData]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  // ============== HANDLERS ==============
  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) => //@ts-ignore
          user?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || //@ts-ignore
          user?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== "All Roles") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleAddNewUser = () => {
    setEditingUserId(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      branch: "",
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setFormData({//@ts-ignore
      first_name: user?.first_name,//@ts-ignore
      last_name: user?.last_name,
      email: user.email,
      phone: user.phone_number || "",
      role: user.role,
      department: user.department || "",
      branch: user.region || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.first_name || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const fullName = `${formData.first_name} ${formData.last_name}`.trim();

    try {
      if (editingUserId) {
        // Placeholder for updating user via API
        // Replace with actual API call, e.g., updateUser({ id: editingUserId, ...formData })
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        setUsers(
          users.map((user) =>
            user.id === editingUserId
              ? {
                  ...user,
                  name: fullName,
                  email: formData.email,
                  role: formData.role,
                  phone: formData.phone,
                  department: formData.department,
                  branch: formData.branch,
                }
              : user
          )
        );
        toast.success("User updated successfully");
      } else {
        // Placeholder for creating user via API
        // Replace with actual API call, e.g., createUser({ ...formData })
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        const newUser: User = {
          id: `temp-${Date.now()}`, // Temporary ID; real ID should come from API
          name: fullName,
          email: formData.email,
          role: formData.role,
          status: "Active",
          date_added: new Date().toISOString().split("T")[0],
          phone_number: formData.phone,
          department: formData.department,
          region: formData.branch,
        };
        setUsers([...users, newUser]);
        toast.success("User created successfully");
      }

      setIsModalOpen(false);
      refetchUserData(); // Refresh user data after save
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user. Please try again.");
    }
  };

  const handleDeleteClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete({ id: userId, name: user.name });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      // Placeholder for deleting user via API
      // Replace with actual API call, e.g., deleteUser(userToDelete.id)
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      toast.success("User deleted successfully");
      refetchUserData(); // Refresh user data after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    }

    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterRole("All Roles");
  };

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Roles Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage staff accounts and role assignments
            </p>
          </div>
          <Button
            onClick={handleAddNewUser}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors duration-200"
            aria-label="Add new user"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Error State */}
        {userDataError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center">
            <span>Failed to load users. Please try again.</span>
            <Button
              // onClick={refetchUserData}
              className="bg-red-600 hover:bg-red-700 text-white"
              aria-label="Retry loading users"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterRole={filterRole}
            onFilterChange={setFilterRole}
          />
         
        </div>

        {/* Loading State */}
        {gettingUserData && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* No Data State */}
        {!gettingUserData && filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            <p className="text-gray-500">No users found. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Users Table */}
        {!gettingUserData && filteredUsers.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <UsersTable
              users={filteredUsers}
              onEdit={handleEditUser}
              onDeleteClick={handleDeleteClick}
            />
          </div>
        )}

        {/* Role Permissions Overview */}
        <div className="mt-6">
          <RolePermissionsOverview />
        </div>

        {/* Modals */}
        <UserFormModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={handleSaveUser}
          formData={formData}
          onFormChange={setFormData}
          isEditing={editingUserId !== null}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          userName={userToDelete?.name || ""}
        />
      </div>
    </div>
  );
}