"use client";

import React, { useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, getRoleBadgeColor } from "@/lib/utils";
import { UserProfile, EditProfileFormData } from "@/lib/types";

export const UserProfileViewPage: React.FC<{
  profile: UserProfile | null;
  onEdit: () => void;
  isLoading: boolean;
}> = ({ profile, onEdit, isLoading }) => {
  useEffect(() => {
    console.log("Profile data in View Page:", profile);
  }, [profile]);
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                {profile?.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>

              {/* Profile Info */}
              <div>
                <h2 className="text-xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white text-xs font-medium capitalize">
                    {profile.role.replace(/_/g, " ")}
                  </Badge>
                  {profile.email_verified && (
                    <Badge className="bg-green-100 text-green-700 text-xs font-medium">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile.is_active && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs font-medium">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Phone Number
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {profile.phone_number}
                </p>
              </div>
            </div>

            {/* Alternative Number */}
            {profile.alternative_number && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Alternative Number
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {profile.alternative_number}
                  </p>
                </div>
              </div>
            )}

            {/* Role */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                  {profile.role.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Date Joined */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Date Joined
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(profile.date_joined)}
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Last Login
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDateTime(profile.last_login)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== EDIT PROFILE PAGE ==============
export const EditProfilePage: React.FC<{
  profile: UserProfile | null;
  formData: EditProfileFormData;
  onFormChange: (data: EditProfileFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  successMessage?: string;
}> = ({
  profile,
  formData,
  onFormChange,
  onSave,
  onCancel,
  isLoading,
  error,
  successMessage,
}) => {
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update your account information
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                {successMessage}
              </p>
              <p className="text-xs text-green-700 mt-1">
                A confirmation email has been sent to your new email address.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Current Profile Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Current Information
          </h3>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">
                {profile.first_name} {profile.last_name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Email:</span>
              <span className="font-medium text-gray-900 truncate ml-2">
                {profile.email}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">
                {profile.phone_number}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              New Email Address *
            </label>
            <Input
              type="email"
              placeholder="newemail@nsitf.gov.ng"
              value={formData.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              className="border-gray-300"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              You will receive a confirmation email at your new address.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading || !formData.email}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Updating..." : "Update Email"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
