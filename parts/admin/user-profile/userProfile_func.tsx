"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfileViewPage, EditProfilePage } from "./userProfileDesign";
import { UserProfile, EditProfileFormData } from "@/lib/types";
import { useEditUserProfile, useGetUserProfile } from "@/services/auth";
import { toast } from "sonner";

export default function UserProfileFlow() {
  const router = useRouter();

  // ============== STATE ==============
  const [currentPage, setCurrentPage] = useState<"view" | "edit">("view");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const { gettingUserData, refetchUserData, userData, userDataError } =
    useGetUserProfile({ enabled: true });
  const [editFormData, setEditFormData] = useState<EditProfileFormData>({
    email: "",
  });
  const {
    editUserProfileData,
    editUserProfileError,
    editUserProfileIsLoading,
    editUserProfileIsSuccess,
    editUserProfilePayload,
  } = useEditUserProfile();

  // ============== FETCH PROFILE ON MOUNT ==============
  useEffect(() => {
    if (gettingUserData) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      if (userDataError) {
        setError(userDataError || "Failed to fetch user profile");
        setProfile(null);
      } else if (userData) {
        const userProfile =
          Array.isArray(userData) && userData.length > 0
            ? userData[0]
            : userData;
        if (userProfile && typeof userProfile === "object") {
          setProfile(userProfile as UserProfile);
          setEditFormData({ email: userProfile.email || "" });
          setError("");
        } else {
          setError("Invalid user data format");
          setProfile(null);
        }
      } else {
        setError("No user data available");
        setProfile(null);
      }
    }
    console.log("Fetched user profile:", userData, "Error:", userDataError);
  }, [gettingUserData, userData, userDataError]);

  // ============== HANDLE EDIT PROFILE RESPONSE ==============
  useEffect(() => {
    if (editUserProfileIsLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      if (editUserProfileIsSuccess && editUserProfileData) {
        setProfile(editUserProfileData as UserProfile); // Update profile with new data
        setSuccessMessage("Profile updated successfully");
        setCurrentPage("view"); // Switch back to view mode
        setError("");
      } else if (editUserProfileError) {
        setError(editUserProfileError || "Failed to update profile");
        setSuccessMessage("");
      }
    }
  }, [editUserProfileIsLoading, editUserProfileIsSuccess, editUserProfileData, editUserProfileError]);

  // ============== API HANDLERS ==============

  // Handler: Update User Profile
  const handleUpdateProfile = async () => {
    if (!editFormData.email) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setSuccessMessage("");
    try {
      await editUserProfilePayload(editFormData); // Trigger the edit profile mutation
    } catch (err) {
      setError("An unexpected error occurred while updating the profile");
    }
  };

  // Handler: Switch to Edit Mode
  const handleEditClick = () => {
    if (profile) {
      setEditFormData({ email: profile.email });
      setCurrentPage("edit");
      setError("");
      setSuccessMessage("");
    }
  };

  // Handler: Cancel Edit
  const handleCancelEdit = () => {
    setCurrentPage("view");
    setError("");
    setSuccessMessage("");
    if (profile) {
      setEditFormData({ email: profile.email });
    }
  };

  // Handler: Retry Fetch
  const handleRetry = () => {
    setIsLoading(true);
    setError("");
    refetchUserData(); // Trigger refetch
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

  // Show error state
  if (!profile || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load profile</p>
          <p className="text-gray-600 text-sm mb-4">{error || "Please try again later"}</p>
          <button
            onClick={handleRetry}
            style={{ backgroundColor: "#00a63e" }}
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
        isLoading={editUserProfileIsLoading} // Use hook's loading state for edit
        error={error}
        successMessage={successMessage}
      />
    );
  }

  return null;
}