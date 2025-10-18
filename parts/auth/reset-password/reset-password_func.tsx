// app/reset-password/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Check,
  AlertCircle,
  Clock,
  Building2,
  Loader2,
} from "lucide-react";

const LINK_EXPIRY_TIME = 86400; // 24 hours in seconds

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<
    "form" | "success" | "expired" | "loading"
  >("loading");
  const [timeRemaining, setTimeRemaining] = useState(LINK_EXPIRY_TIME);
  const [isExpired, setIsExpired] = useState(false);

  // Password validation
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUppercase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar &&
    password === confirmPassword;

  // Check token on mount
  useEffect(() => {
    if (!token) {
      setStatus("expired");
      setError("No reset token provided");
    } else {
      setStatus("form");
      setTimeRemaining(LINK_EXPIRY_TIME);
    }
  }, [token]);

  // Timer for expiry
  useEffect(() => {
    if (status === "form" && token && !isExpired) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            setStatus("expired");
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, token, isExpired]);

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      setStatus("expired");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("password1", password);
      formDataToSend.append("password2", confirmPassword);

      const response = await fetch(
        `https://nsitf-be.geniusexcel.tech/api/auth/reset-password?token=${encodeURIComponent(
          token
        )}`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        if (response.status === 400) {
          const errorMessage = data.error || data.message || "";

          if (
            errorMessage.toLowerCase().includes("token") ||
            errorMessage.toLowerCase().includes("expired") ||
            errorMessage.toLowerCase().includes("invalid")
          ) {
            setStatus("expired");
          } else {
            setError(
              errorMessage || "Failed to reset password. Please try again."
            );
          }
        } else {
          setError(
            data.error ||
              data.message ||
              "Failed to reset password. Please try again."
          );
        }
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isPasswordValid) {
      handleResetPassword();
    }
  };

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (status === "success") {
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

          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 mb-8">
              Your password has been changed successfully.
              <br />
              You can now log in with your new password.
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              style={{ backgroundColor: "#00a63e" }}
              className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expired State
  if (status === "expired") {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

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

          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {isExpired ? "Link Expired" : "Invalid Link"}
            </h1>
            <p className="text-gray-600 mb-6">
              {isExpired
                ? "This password reset link has expired. Please request a new password reset link."
                : error || "This password reset link is invalid or has already been used."}
            </p>

            {!isExpired && timeRemaining > 0 && (
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

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push("/forget-password")}
                style={{ backgroundColor: "#00a63e" }}
                className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Request New Link
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form State
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyPress}
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

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading || !password || !confirmPassword}
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
}