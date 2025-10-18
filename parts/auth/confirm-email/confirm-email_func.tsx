// EmailConfirmationFlow.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, AlertCircle, Loader2, Mail, Building2 } from "lucide-react";

const BACKEND_URL = "https://nsitf-be.geniusexcel.tech";

export default function EmailConfirmationFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify email on mount
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("error");
      setMessage("No verification token provided");
      setIsVerifying(false);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      console.log("Verifying email with token...");

      const response = await fetch(
        `${BACKEND_URL}/api/auth/confirm-email?token=${encodeURIComponent(
          verificationToken
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email successfully confirmed");
      } else {
        setStatus("error");
        setMessage(data.error || data.message || "Failed to confirm email");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      setStatus("error");
      setMessage("Network error. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinueToLogin = () => {
    router.push("/");
  };

  const handleResendEmail = () => {
    // Redirect to a page where they can request a new confirmation email
    router.push("/resend-email");
  };

  // Loading State
  if (status === "loading" || isVerifying) {
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
            {/* Loading Icon */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying Your Email
            </h1>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your email address...
            </p>
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
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Email Confirmed!
            </h1>
            <p className="text-gray-600 mb-8">
              {message ||
                "Your email has been successfully verified. You can now log in to your account."}
            </p>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleContinueToLogin}
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

  // Error State
  if (status === "error") {
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
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-8">
              {message ||
                "We couldn't verify your email address. The link may have expired or is invalid."}
            </p>

            {/* Error Details */}
            {message.toLowerCase().includes("expired") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Email confirmation links expire after
                  24 hours for security reasons.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResendEmail}
                style={{ backgroundColor: "#00a63e" }}
                className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Resend Confirmation Email
              </button>
              <button
                type="button"
                onClick={handleContinueToLogin}
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

  return null;
}
