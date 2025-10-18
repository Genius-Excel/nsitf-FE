// ResendConfirmationEmail.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, Building2 } from "lucide-react";

const BACKEND_URL = "https://nsitf-be.geniusexcel.tech";

export default function ResendConfirmationEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Adjust this endpoint based on your backend API
      // You may need to create this endpoint or use an existing one
      const response = await fetch(
        `${BACKEND_URL}/api/auth/resend-confirmation-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.error || "Failed to resend confirmation email");
      }
    } catch (err) {
      console.error("Error resending confirmation email:", err);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
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
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Resend Confirmation Email
            </h1>
            <p className="text-sm text-gray-600">
              Enter your email to receive a new confirmation link
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-700">
                Confirmation email sent! Please check your inbox (and spam
                folder).
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="user@nsitf.gov.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-200"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleResendEmail();
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isLoading || !email}
              style={{ backgroundColor: "#00a63e" }}
              className="w-full py-3 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Sending..." : "Resend Confirmation Email"}
            </button>

            <div className="text-center pt-4">
              <button
                onClick={() => router.push("/")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
