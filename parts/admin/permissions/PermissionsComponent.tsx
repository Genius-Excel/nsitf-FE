"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissionManagement } from "@/hooks/usePermissionManagement";
import { useToast } from "@/hooks/use-toast";
import HttpService from "@/services/httpServices";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
}

const httpService = new HttpService();

export function PermissionManagementComponent() {
  const { toast } = useToast();
  const { assignPermissions, removePermissions, loading, error, success } =
    usePermissionManagement();

  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [action, setAction] = useState<"assign" | "remove">("assign");
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch users and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        setFetchError(null);

        // Fetch users
        const usersResponse = await httpService.getData("/api/admin/users");
        setUsers(usersResponse.data || []);

        // Fetch permissions
        const permsResponse = await httpService.getData(
          "/api/admin/permissions"
        );
        setPermissions(permsResponse.data || []);
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to fetch data";
        setFetchError(message);
        console.error("Error fetching data:", message);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const togglePermissionSelection = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleApplyPermissions = async () => {
    if (selectedUsers.size === 0 || selectedPermissions.size === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one user and one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      const userIds = Array.from(selectedUsers);
      const permissionIds = Array.from(selectedPermissions);

      let results;
      if (action === "assign") {
        results = await assignPermissions(userIds, permissionIds);
      } else {
        results = await removePermissions(userIds, permissionIds);
      }

      const successCount = results.filter(
        (r) => r.status === "assigned" || r.status === "removed"
      ).length;
      toast({
        title: success ? "Success" : "Partial Success",
        description: `${successCount}/${results.length} operations completed`,
        variant: success ? "default" : "destructive",
      });

      // Reset selections
      setSelectedUsers(new Set());
      setSelectedPermissions(new Set());
    } catch (err: any) {
      toast({
        title: "Error",
        description: error || "Failed to apply permissions",
        variant: "destructive",
      });
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">
              Error Loading Data
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>{fetchError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Permission Management</h1>
        <p className="text-muted-foreground">
          Assign or remove user permissions
        </p>
      </div>

      {/* Action Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Action</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            variant={action === "assign" ? "default" : "outline"}
            onClick={() => setAction("assign")}
          >
            Assign Permissions
          </Button>
          <Button
            variant={action === "remove" ? "default" : "outline"}
            onClick={() => setAction("remove")}
          >
            Remove Permissions
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Users</CardTitle>
            <CardDescription>
              {selectedUsers.size} user(s) selected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-96 space-y-2 overflow-y-auto border rounded-lg p-4">
              {filteredUsers.map((user) => (
                <label
                  key={user.user_id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedUsers.has(user.user_id)}
                    onCheckedChange={() => toggleUserSelection(user.user_id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Permissions</CardTitle>
            <CardDescription>
              {selectedPermissions.size} permission(s) selected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 space-y-2 overflow-y-auto border rounded-lg p-4">
              {permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPermissions.has(permission.id)}
                    onCheckedChange={() =>
                      togglePermissionSelection(permission.id)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{permission.name}</p>
                    {permission.description && (
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleApplyPermissions}
          disabled={
            loading ||
            selectedUsers.size === 0 ||
            selectedPermissions.size === 0
          }
          size="lg"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {action === "assign" ? "Assign" : "Remove"} Permissions
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
