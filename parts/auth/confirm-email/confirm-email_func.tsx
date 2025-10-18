"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, AlertCircle, Loader2, Building2 } from "lucide-react";
import { useGetConfirmEmail } from "@/services/auth";

const EMAIL_SUCCESS = "Email successfully confirmed!";

export default function EmailConfirmationFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const { filterVerifyToken, isVerifyingToken, verifiedTokenData, verifyTokenError } =
    useGetConfirmEmail({ enabled: !!token });

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  // Verify email on mount
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided. Please request a new confirmation email.");
      return;
    }

    setStatus("loading");
    filterVerifyToken(token);

    if (verifyTokenError) {
      setStatus("error");
      setMessage(verifyTokenError || "We couldn't verify your email address. The link may have expired or is invalid.");
    } else if (verifiedTokenData === EMAIL_SUCCESS) {
      setStatus("success");
      setMessage(verifiedTokenData);
    }
  }, [token, verifiedTokenData, verifyTokenError, filterVerifyToken]);

  const handleContinueToLogin = () => {
    router.push("/");
  };

  const handleResendEmail = () => {
    router.push("/resend-email");
  };

  // Loading State
  if (status === "loading" || isVerifyingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <div className="h-12 w-12 rounded-lg bg-green-400 flex items-center justify-center border border-primary/20 text-white">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Nigerian Social Insurance Trust Fund
            </h1>
            <p className="text-muted-foreground text-balance">
              Secure access to compliance, claims, and legal management
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Verifying Your Email</h1>
            <p className="text-gray-600 mb-4">Please wait while we confirm your email address...</p>
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
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <div className="h-12 w-12 rounded-lg bg-green-400 flex items-center justify-center border border-primary/20 text-white">
              <Building2 className="h-6 w-6" aria-hidden="true" />
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
              <Check className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Confirmed!</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <button
              type="button"
              onClick={handleContinueToLogin}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              aria-label="Continue to login page"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="h-12 w-12 rounded-lg bg-green-400 flex items-center justify-center border border-primary/20 text-white">
            <Building2 className="h-6 w-6" aria-hidden="true" />
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
            <AlertCircle className="w-10 h-10 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h1>
          <p className="text-gray-600 mb-8">{message}</p>
          {message?.toLowerCase().includes("expired") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Email confirmation links expire after 24 hours for security reasons.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleResendEmail}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              aria-label="Resend confirmation email"
            >
              Resend Confirmation Email
            </button>
            <button
              type="button"
              onClick={handleContinueToLogin}
              className="w-full py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              aria-label="Back to login page"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}