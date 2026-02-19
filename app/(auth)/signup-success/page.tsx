"use client";
import { EmailConfirmationPrompt } from "@/parts/signup-success";
import Image from "next/image";
import React from "react";

const SignUpSucessScreen = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-64">
      <div className="border rounded-lg p-4 shadow-md">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <Image
              src="/nsitf-logo.png"
              alt="NSITF Logo"
              width={64}
              height={64}
              priority
              className="object-contain"
            />
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Nigerian Social Insurance Trust Fund
            </h1>
            <p className="text-muted-foreground text-balance">
              Secure access to Automated and Digital Actuarial Data Structure
            </p>
          </div>
        </div>
        <EmailConfirmationPrompt email="" />
      </div>
    </div>
  );
};

export default SignUpSucessScreen;
