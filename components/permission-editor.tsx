/**
 * Permission Editor Modal
 *
 * Modal component for editing individual user permissions with bulk assignment/removal.
 */

"use client";

import React, { useState } from 'react';
import { Check, X, AlertTriangle, User, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  type UserWithPermissions,
  type PermissionItem,
  type PermissionDiff,
  canRemovePermission,
  canAssignPermission,
} from '@/lib/types/permissions';
import { getUserFromStorage } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ============== HELPER FUNCTIONS ==============

/**
 * Formats permission name by removing underscores and capitalizing properly
 * Example: "can_upload_branch_data" -> "Can upload branch data"
 */
function formatPermissionName(name: string): string {
  if (!name) return '';

  // Remove underscores and replace with spaces
  const withSpaces = name.replace(/_/g, ' ');

  // Capitalize first letter only
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

// ============== PERMISSION CATEGORY SECTION ==============

interface PermissionCategorySectionProps {
  category: {
    id: string;
    name: string;
    description: string;
    permissions: PermissionItem[];
  };
  editedPermissions: PermissionItem[];
  permissionDiff: PermissionDiff;
  userRole: string;
  onTogglePermission: (permission: PermissionItem) => void;
  onToggleCategory: (category: { id: string; name: string; permissions: PermissionItem[] }) => void;
}

function PermissionCategorySection({
  category,
  editedPermissions,
  permissionDiff,
  userRole,
  onTogglePermission,
  onToggleCategory,
}: PermissionCategorySectionProps) {
  const currentUser = getUserFromStorage();

  // Check if all permissions in category are selected
  const selectedCount = category.permissions.filter(p => editedPermissions.some(ep => ep.id === p.id)).length;
  const totalCount = category.permissions.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={() => onToggleCategory(category)}
              className={isPartiallySelected ? "data-[state=indeterminate]:bg-primary" : ""}
              aria-label={`Select all ${category.name} permissions`}
            />
            <div>
              <CardTitle className="text-base font-medium">{category.name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {selectedCount} / {totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {category.permissions.map((permission) => {
            const isSelected = editedPermissions.some(ep => ep.id === permission.id);
            const isAdded = permissionDiff.added.includes(permission.id);
            const isRemoved = permissionDiff.removed.includes(permission.id);
            const canRemove = canRemovePermission(userRole, permission, currentUser || { role: 'user', permissions: [] });
            const canAssign = canAssignPermission(userRole, permission, currentUser?.role || 'user');

            const isDisabled = isSelected ? !canRemove : !canAssign;

            return (
              <div
                key={permission.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-md border transition-colors",
                  isSelected
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                  isAdded && "ring-2 ring-green-300 bg-green-100",
                  isRemoved && "ring-2 ring-red-300 bg-red-50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => !isDisabled && onTogglePermission(permission)}
                  disabled={isDisabled}
                  aria-label={`Toggle ${permission.name} permission`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-green-800" : "text-gray-700"
                    )}>
                      {permission.description}
                    </p>
                    <div className="flex items-center space-x-1 ml-2">
                      {isAdded && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Adding
                        </Badge>
                      )}
                      {isRemoved && (
                        <Badge variant="destructive" className="text-xs">
                          <X className="w-3 h-3 mr-1" />
                          Removing
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatPermissionName(permission.name)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============== MAIN PERMISSION EDITOR COMPONENT ==============

interface PermissionEditorProps {
  isOpen: boolean;
  user: UserWithPermissions | null;
  originalPermissions: PermissionItem[];
  editedPermissions: PermissionItem[];
  permissionDiff: PermissionDiff;
  hasChanges: boolean;
  isSaving: boolean;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    permissions: PermissionItem[];
  }>;
  onClose: () => void;
  onTogglePermission: (permission: PermissionItem) => void;
  onSave: () => Promise<boolean>;
  onReset: () => void;
}

function useToggleCategory(
  editedPermissions: PermissionItem[],
  onTogglePermission: (permission: PermissionItem) => void
) {
  return (category: { id: string; name: string; permissions: PermissionItem[] }) => {
    const selectedCount = category.permissions.filter(p =>
      editedPermissions.some(ep => ep.id === p.id)
    ).length;
    const isAllSelected = selectedCount === category.permissions.length;

    // If all selected, deselect all; otherwise select all
    category.permissions.forEach(permission => {
      const isSelected = editedPermissions.some(ep => ep.id === permission.id);
      if (isAllSelected && isSelected) {
        onTogglePermission(permission); // Deselect
      } else if (!isAllSelected && !isSelected) {
        onTogglePermission(permission); // Select
      }
    });
  };
}

export function PermissionEditor({
  isOpen,
  user,
  originalPermissions,
  editedPermissions,
  permissionDiff,
  hasChanges,
  isSaving,
  categories,
  onClose,
  onTogglePermission,
  onSave,
  onReset,
}: PermissionEditorProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const handleToggleCategory = useToggleCategory(editedPermissions, onTogglePermission);

  if (!user) return null;

  // Handle save with confirmation for removals
  const handleSave = () => {
    if (permissionDiff.removed.length > 0) {
      setShowConfirmDialog(true);
    } else {
      handleConfirmedSave();
    }
  };

  // Handle confirmed save
  const handleConfirmedSave = async () => {
    setShowConfirmDialog(false);
    const success = await onSave();
    if (success) {
      onClose();
    }
  };

  // Handle dialog close with unsaved changes check
  const handleClose = () => {
    if (hasChanges && !isSaving) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span>Manage Permissions</span>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  {user.name} ({user.email})
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Assign or remove permissions for this user. Changes will not be saved until you click "Save Changes".
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {categories.map((category) => (
                <PermissionCategorySection
                  key={category.id}
                  category={category}
                  editedPermissions={editedPermissions}
                  permissionDiff={permissionDiff}
                  userRole={user.role}
                  onTogglePermission={onTogglePermission}
                  onToggleCategory={handleToggleCategory}
                />
              ))}
            </ScrollArea>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                onClick={onReset}
                variant="outline"
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Changes
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Removals */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Confirm Permission Removal</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove {permissionDiff.removed.length} permission{permissionDiff.removed.length !== 1 ? 's' : ''} from {user.name}.
              This action may limit their access to certain features.

              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedSave}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                'Confirm Removal'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
