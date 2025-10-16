// ResetPasswordFlow.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ResetEmailPage,
  CreateNewPasswordPage,
  PasswordSuccessPage,
  ExpiredLinkPage,
} from "./resetPasswordDesign";
import { ResetEmailFormData, NewPasswordFormData } from "@/lib/types";

const DEV_URL = process.env.NEXT_PUBLIC_API_URL || "";
const LINK_EXPIRY_TIME = 300; // 5 minutes in seconds

// ============== MAIN COMPONENT ==============
export default function ResetPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  // ============== STATE ==============
  const [currentPage, setCurrentPage] = useState<
    "reset-email" | "create-password" | "success" | "expired"
  >("reset-email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(LINK_EXPIRY_TIME);
  const [isExpired, setIsExpired] = useState(false);

  const [resetEmailData, setResetEmailData] = useState<ResetEmailFormData>({
    email: "",
  });

  const [newPasswordData, setNewPasswordData] = useState<NewPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  // ============== PASSWORD VALIDATION ==============
  const passwordStrength = {
    hasMinLength: newPasswordData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(newPasswordData.password),
    hasNumber: /[0-9]/.test(newPasswordData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordData.password),
  };

  const isPasswordValid =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUppercase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar &&
    newPasswordData.password === newPasswordData.confirmPassword;

  // ============== TIMER FOR CREATE PASSWORD PAGE ==============
  useEffect(() => {
    if (currentPage === "create-password" && token && !isExpired) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            setCurrentPage("expired");
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPage, token, isExpired]);

  // ============== CHECK TOKEN ON MOUNT ==============
  useEffect(() => {
    if (token) {
      // If token exists, show create password page
      setCurrentPage("create-password");
      // Start expiry timer
      setTimeRemaining(LINK_EXPIRY_TIME);
      setIsExpired(false);
    }
  }, [token]);

  // ============== API HANDLERS ==============

  // Handler 1: Send Reset Link (Password Reset Email Request)
  const handleSendResetLink = async () => {
    if (!resetEmailData.email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("email", resetEmailData.email);

      const response = await fetch(
        ` https://nsitf-be.geniusexcel.tech/api/auth/password-reset-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Success - show success message
        alert(`Reset link sent to ${resetEmailData.email}. Check your email.`);
        // Optionally navigate to a confirmation page or back to login
      } else {
        setError(
          data.error ||
            data.message ||
            "Failed to send reset link. Please try again."
        );
      }
    } catch (err) {
      console.error("Error sending reset link:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 2: Reset Password
  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (newPasswordData.password !== newPasswordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("password1", newPasswordData.password);
      formData.append("password2", newPasswordData.confirmPassword);

      const response = await fetch(
        ` https://nsitf-be.geniusexcel.tech/reset-password?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCurrentPage("success");
      } else {
        // Handle specific error cases
        if (response.status === 400) {
          // Token expired or invalid
          setCurrentPage("expired");
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
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 3: Request New Link from Expired Page
  const handleRequestNewLink = () => {
    setCurrentPage("reset-email");
    setTimeRemaining(LINK_EXPIRY_TIME);
    setIsExpired(false);
    setResetEmailData({ email: "" });
    setError("");
  };

  // Handler 4: Continue to Login
  const handleContinueToLogin = () => {
    router.push("/#");
  };

  // Handler 5: Back to Login
  const handleBackToLogin = () => {
    router.push("/#");
  };

  // ============== RENDER ==============
  if (currentPage === "reset-email") {
    return (
      <ResetEmailPage
        formData={resetEmailData}
        onFormChange={setResetEmailData}
        onSubmit={handleSendResetLink}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (currentPage === "create-password") {
    return (
      <CreateNewPasswordPage
        formData={newPasswordData}
        onFormChange={setNewPasswordData}
        onSubmit={handleResetPassword}
        isLoading={isLoading}
        error={error}
        passwordStrength={passwordStrength}
      />
    );
  }

  if (currentPage === "success") {
    return <PasswordSuccessPage onContinue={handleContinueToLogin} />;
  }

  if (currentPage === "expired") {
    return (
      <ExpiredLinkPage
        onRequestNew={handleRequestNewLink}
        onBackToLogin={handleBackToLogin}
        timeRemaining={timeRemaining}
        isExpired={isExpired}
      />
    );
  }

  return null;
}
