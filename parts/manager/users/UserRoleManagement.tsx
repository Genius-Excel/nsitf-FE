import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UsersTable,
  SearchAndFilter,
  RolePermissionsOverview,
  UserFormModal,
  DeleteConfirmationDialog,
} from "./UserRolesDesign";
import { ROLES } from "@/lib/Constants/constants";
import { User, NewUserForm } from "@/lib/types/types";
import { mockUsers } from "@/lib/Constants/constants";

export default function UsersRolesManagement() {
  // ============== STATE ==============
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
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

  // ============== EFFECTS ==============
  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  // ============== HANDLERS ==============
  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const [first_name, ...lastNameParts] = user.name.split(" ");
    setEditingUserId(user.id);
    setFormData({
      first_name,
      last_name: lastNameParts.join(" "),
      email: user.email,
      phone: "",
      role: user.role,
      department: "",
      branch: "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.first_name || !formData.email || !formData.role) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();

      if (editingUserId) {
        // UPDATE USER
        const response = await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            branch: formData.branch,
          }),
        });

        if (response.ok) {
          setUsers(
            users.map((user) =>
              user.id === editingUserId
                ? {
                    ...user,
                    name: fullName,
                    email: formData.email,
                    role: formData.role,
                  }
                : user
            )
          );
          alert("User updated successfully");
        }
      } else {
        // CREATE NEW USER
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            branch: formData.branch,
            status: "Active",
            dateAdded: new Date().toISOString().split("T")[0],
          }),
        });

        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]);
          alert("User created successfully");
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      // Mock fallback
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      if (editingUserId) {
        setUsers(
          users.map((user) =>
            user.id === editingUserId
              ? {
                  ...user,
                  name: fullName,
                  email: formData.email,
                  role: formData.role,
                }
              : user
          )
        );
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          name: fullName,
          email: formData.email,
          role: formData.role,
          status: "Active",
          date_added: new Date().toISOString().split("T")[0],
        };
        setUsers([...users, newUser]);
      }
      setIsModalOpen(false);
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
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        alert("User deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      // Mock fallback
      setUsers(users.filter((user) => user.id !== userToDelete.id));
    }

    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // ============== RENDER ==============
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Users & Roles Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage staff accounts and role assignments
            </p>
          </div>
          <Button
            onClick={handleAddNewUser}
            style={{ backgroundColor: "#00a63e" }}
            className="text-white text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterRole={filterRole}
          onFilterChange={setFilterRole}
        />

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDeleteClick={handleDeleteClick}
        />

        {/* Role Permissions Overview */}
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
  );
}
