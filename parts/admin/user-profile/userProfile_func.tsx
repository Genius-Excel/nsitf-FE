"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserProfileViewPage,
  EditProfilePage,
} from "./userProfileDesign";
import { UserProfile, EditProfileFormData } from "@/lib/types";

const DEV_URL = "https://nsitf-be.geniusexcel.tech";

// ============== MAIN COMPONENT ==============
export default function UserProfileFlow() {
  const router = useRouter();

  // ============== STATE ==============
  const [currentPage, setCurrentPage] = useState<"view" | "edit">("view");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [editFormData, setEditFormData] = useState<EditProfileFormData>({
    email: "",
  });

  // ============== FETCH PROFILE ON MOUNT ==============
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ============== API HANDLERS ==============

  // Handler 1: Fetch User Profile
  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Get token from localStorage or your auth system
      const token = localStorage.getItem("auth_token"); // Adjust based on your auth implementation

      const response = await fetch(`${DEV_URL}/api/user-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.data && result.data.length > 0) {
        setProfile(result.data[0]); // API returns an array
        setEditFormData({ email: result.data[0].email });
      } else {
        setError(result.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("An error occurred while fetching your profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 2: Update User Profile
  const handleUpdateProfile = async () => {
    if (!editFormData.email) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Get token from localStorage or your auth system
      const token = localStorage.getItem("auth_token");

      const formData = new URLSearchParams();
      formData.append("email", editFormData.email);

      const response = await fetch(`${DEV_URL}/api/user-profile/update`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(
          result.message || "Profile updated successfully! A confirmation email has been sent."
        );

        // Update local profile with new data
        if (result.data && result.data.length > 0) {
          setProfile(result.data[0]);
        }

        // Optionally redirect back to view after a delay
        setTimeout(() => {
          setCurrentPage("view");
          setSuccessMessage("");
        }, 3000);
      } else {
        setError(result.message || "Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 3: Switch to Edit Mode
  const handleEditClick = () => {
    if (profile) {
      setEditFormData({ email: profile.email });
      setCurrentPage("edit");
      setError("");
      setSuccessMessage("");
    }
  };

  // Handler 4: Cancel Edit
  const handleCancelEdit = () => {
    setCurrentPage("view");
    setError("");
    setSuccessMessage("");
    if (profile) {
      setEditFormData({ email: profile.email });
    }
  };

  // ============== RENDER ==============
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile is null and not loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load profile</p>
          <p className="text-gray-600 text-sm mb-4">{error || "Please try again later"}</p>
          <button
            onClick={fetchUserProfile}
            style={{ backgroundColor: '#00a63e' }}
            className="px-6 py-2 text-white rounded-lg font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render based on current page
  if (currentPage === "view") {
    return (
      <UserProfileViewPage
        profile={profile}
        onEdit={handleEditClick}
        isLoading={false}
      />
    );
  }

  if (currentPage === "edit") {
    return (
      <EditProfilePage
        profile={profile}
        formData={editFormData}
        onFormChange={setEditFormData}
        onSave={handleUpdateProfile}
        onCancel={handleCancelEdit}
        isLoading={isLoading}
        error={error}
        successMessage={successMessage}
      />
    );
  }

  return null;
}