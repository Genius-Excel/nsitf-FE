import { useState, useCallback } from "react";
import { User } from "./UseUsers";

// ============= TYPES =============

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  department: string;
  organizational_level: string; // 'hq', 'region', or 'branch'
  region_id: string;
  branch_id: string;
}

const EMPTY_FORM: UserFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  role: "",
  department: "",
  organizational_level: "",
  region_id: "",
  branch_id: "",
};

// ============= HOOK =============

/**
 * Form state management for user creation/editing
 * Encapsulates modal state, form data, and validation
 */
export const useUserForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);

  // Open modal for creating new user
  const openForCreate = useCallback(() => {
    setEditingUserId(null);
    setFormData(EMPTY_FORM);
    setIsOpen(true);
  }, []);

  // Open modal for editing existing user
  const openForEdit = useCallback((user: User) => {
    setEditingUserId(user.id);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email,
      phone_number: user.phone_number || "",
      role: user.role,
      department: user.department || "",
      organizational_level: "",
      region_id: "",
      branch_id: "",
    });
    setIsOpen(true);
  }, []);

  // Close modal and reset form
  const closeForm = useCallback(() => {
    setIsOpen(false);
    // Delay reset to avoid visual glitch during modal close animation
    setTimeout(() => {
      setEditingUserId(null);
      setFormData(EMPTY_FORM);
    }, 200);
  }, []);

  // Update form field
  const updateField = useCallback(
    (field: keyof UserFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update entire form
  const updateForm = useCallback((data: UserFormData) => {
    setFormData(data);
  }, []);

  // Validation
  const validate = useCallback(() => {
    const errors: string[] = [];

    if (!formData.first_name.trim()) {
      errors.push("First name is required");
    }

    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Invalid email format");
    }

    if (!formData.role) {
      errors.push("Role is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [formData]);

  return {
    // Modal state
    isOpen,
    setIsOpen,

    // Form state
    formData,
    editingUserId,
    isEditing: editingUserId !== null,

    // Actions
    openForCreate,
    openForEdit,
    closeForm,
    updateField,
    updateForm,

    // Validation
    validate,
  };
};
