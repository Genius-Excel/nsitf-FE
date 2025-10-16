"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Check, AlertCircle, Clock, Building2 } from "lucide-react";
import { ResetEmailFormData, NewPasswordFormData } from "@/lib/types";

export const ResetEmailPage: React.FC<{
  formData: ResetEmailFormData;
  onFormChange: (data: ResetEmailFormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
}> = ({ formData, onFormChange, onSubmit, isLoading, error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md">
        {/* ===================== NSITF BRAND HEADER ===================== */}
      <div className="flex flex-col items-center text-center space-y-2">
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
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="user@nsitf.gov.ng"
              value={formData.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              className="border-gray-200"
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !formData.email}
            style={{ backgroundColor: "#00a63e" }}
            className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center pt-4">
            <a
              href="/#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============== PAGE 2: CREATE NEW PASSWORD ==============
export const CreateNewPasswordPage: React.FC<{
  formData: NewPasswordFormData;
  onFormChange: (data: NewPasswordFormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
  passwordStrength: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}> = ({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
  error,
  passwordStrength,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-sm text-gray-600">
            Create a strong, unique password
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              New Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                onFormChange({ ...formData, password: e.target.value })
              }
              className="border-gray-200"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                onFormChange({ ...formData, confirmPassword: e.target.value })
              }
              className="border-gray-200"
              disabled={isLoading}
            />
          </div>

          {/* Password Requirements */}
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
                    passwordStrength.hasNumber ? "bg-green-500" : "bg-gray-300"
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

          <button
            type="button"
            onClick={onSubmit}
            disabled={
              isLoading || !formData.password || !formData.confirmPassword
            }
            style={{ backgroundColor: "#00a63e" }}
            className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============== PAGE 3: PASSWORD SUCCESS ==============
export const PasswordSuccessPage: React.FC<{
  onContinue: () => void;
}> = ({ onContinue }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Password Reset Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Your password has been changed successfully.
          <br />
          You can now log in with your new password.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onContinue}
          style={{ backgroundColor: "#00a63e" }}
          className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Continue to Login
        </button>
      </div>
    </div>
  </div>
);

// ============== PAGE 4: INVALID/EXPIRED LINK ==============
export const ExpiredLinkPage: React.FC<{
  onRequestNew: () => void;
  onBackToLogin: () => void;
  timeRemaining: number;
  isExpired: boolean;
}> = ({ onRequestNew, onBackToLogin, timeRemaining, isExpired }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {isExpired ? "Link Expired" : "Link Expiring Soon"}
          </h1>
          <p className="text-gray-600 mb-6">
            {isExpired
              ? "This password reset link has expired. Please request a new password reset link."
              : "This password reset link will expire soon."}
          </p>

          {/* Timer */}
          {!isExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-semibold text-yellow-800">
                  Time Remaining
                </p>
              </div>
              <p className="text-3xl font-bold text-yellow-900">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onRequestNew}
              style={{ backgroundColor: "#00a63e" }}
              className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Request New Link
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
