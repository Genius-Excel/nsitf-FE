"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, Building2 } from "lucide-react";
import { useResendConfirmationEmail } from "@/services/auth"; // Fixed typo in hook name

export default function ResendConfirmationEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError]= useState("")
  const [isResendLoading, setIsresendLoading] = useState(false)
  const [isResendSuccess, setisResendSuccess] = useState<string | null>(null)
  const [errorMessage, SeterrorMessage] = useState<string | null>(null)

  const handleSuccess =()=>{
        setEmail("");
        setIsresendLoading(resendConfirmationIsLoading)
        setisResendSuccess("success")
  }
  const {
    resendConfirmationData, resendConfirmationError, resendConfirmationIsLoading, resendConfirmationIsSuccess, resendConfirmationPayload
  } = useResendConfirmationEmail(handleSuccess);

  const handleResendEmail = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    resendConfirmationPayload({"email":email})
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
          {isResendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-700">
                Confirmation email sent! Please check your inbox (and spam
                folder).
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-200"
                disabled={isResendLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isResendLoading || !email}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResendLoading ? "Sending..." : "Resend Confirmation Email"}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}