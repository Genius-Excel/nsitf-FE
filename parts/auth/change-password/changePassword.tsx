// app/change-password/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Check,
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { useChangePassword } from "@/services/auth";

export default function ChangePasswordPage() {
  const router = useRouter();

  // Email state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailValidated, setIsEmailValidated] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Show/Hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hooks
  const {
    changePasswordData,
    changePasswordError,
    changePasswordIsLoading,
    changePasswordPayload,
  } = useChangePassword();

  // Password validation
  const passwordStrength = {
    hasMinLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const isPasswordValid =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUppercase &&
    passwordStrength.hasLowercase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar &&
    newPassword === confirmPassword;

  // Email validation function
  const handleEmailValidation = () => {
    if (!email) {
      setEmailError("Please enter your email address");
      return;
    }

    // More robust email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setIsEmailValidated(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your new password meets all requirements");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        email,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      await changePasswordPayload(payload);

      if (changePasswordData) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Optional: Redirect after success
        // setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        setError(
          changePasswordError ||
            "Failed to change password. Please check your email or current password."
        );
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isEmailValidated) {
        handleEmailValidation();
      } else if (isPasswordValid && currentPassword) {
        handleChangePassword();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* NSITF BRAND HEADER */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="h-12 w-12 rounded-lg bg-green-400 flex items-center justify-center border border-primary/20 text-white">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Nigerian Social Insurance Trust Fund
          </h1>
          <p className="text-muted-foreground text-balance">
            Secure access to compliance, claims, and legal management
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Change Password
            </h1>
            <p className="text-sm text-gray-600">
              {isEmailValidated
                ? "Update your account password"
                : "Enter your email to proceed"}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Password changed successfully!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Your password has been updated. Redirecting...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(error || emailError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error || emailError}</p>
            </div>
          )}

          {/* Form */}
          {!isEmailValidated ? (
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="border-gray-200 pr-10"
                    disabled={isLoading}
                  />
                  <Mail className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Validate Email Button */}
              <button
                type="button"
                onClick={handleEmailValidation}
                disabled={isLoading || !email}
                style={{ backgroundColor: "#00a63e" }}
                className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? "Validating Email..." : "Validate Email"}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="border-gray-200 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="border-gray-200 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="border-gray-200 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-900 mb-3">
                    Password must contain:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordStrength.hasMinLength
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.hasMinLength && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          passwordStrength.hasMinLength
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordStrength.hasUppercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.hasUppercase && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          passwordStrength.hasUppercase
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordStrength.hasLowercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.hasLowercase && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          passwordStrength.hasLowercase
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordStrength.hasNumber
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.hasNumber && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          passwordStrength.hasNumber
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          passwordStrength.hasSpecialChar
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordStrength.hasSpecialChar && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          passwordStrength.hasSpecialChar
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    newPassword === confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  !isPasswordValid
                }
                style={{ backgroundColor: "#00a63e" }}
                className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setIsEmailValidated(false)}
                className="w-full py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}