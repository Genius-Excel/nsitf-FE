"use client";
import { EmailConfirmationPrompt } from "@/parts/signup-success";
import { Building2 } from "lucide-react";
import React from "react";

const SignUpSucessScreen = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-64">
      <div className="border rounded-lg p-4 shadow-md">
        <div className="w-full max-w-md mx-auto">
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
        </div>
        <EmailConfirmationPrompt email="" />
      </div>
    </div>
  );
};

export default SignUpSucessScreen;
