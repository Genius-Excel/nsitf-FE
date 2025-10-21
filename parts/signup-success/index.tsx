import React from "react";
import { Button } from "@/components/ui/button";
import { X, Mail } from "lucide-react";
import { cn } from "@/lib/utils"; // Utility for conditional Tailwind classes

interface EmailConfirmationPromptProps {
  email: string;
  onDismiss?: () => void; // Renamed from onClose to clarify it's for dismissing the banner
}

export const EmailConfirmationPrompt: React.FC<EmailConfirmationPromptProps> = ({
  email,
  onDismiss,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-green-50 border-l-4 border-green-600 p-4 rounded-lg shadow-md mb-6 mx-auto max-w-3xl",
        "transform transition-all duration-300 opacity-100 translate-y-0"
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center space-x-3">
        <Mail className="w-6 h-6 text-green-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            Check your email to confirm your account
          </p>
          <p className="text-sm text-gray-600">
            We’ve sent a confirmation email to{" "}
            <strong className="text-gray-900">{email}</strong>. Please check your
            inbox (and spam/junk folder).
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={onDismiss}
        className="p-2 hover:bg-green-100 rounded-full"
        aria-label="Dismiss confirmation prompt"
      >
        <X className="w-5 h-5 text-gray-600" />
      </Button>
    </div>
  );
};