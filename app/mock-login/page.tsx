"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Mock Login Page for Testing Tutorial Video Feature
 *
 * This simulates a new user logging in with different roles.
 * Each role gets the tutorial video which will pop up on their dashboard.
 */
export default function MockLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  // Test video URL (starts at 11 seconds)
  const testVideoUrl = "https://www.youtube.com/watch?v=4n4rBrs5-LY";

  // Test accounts for different roles
  const testAccounts = {
    "admin@nsitf.test": {
      password: "admin123",
      role: "admin",
      displayName: "Admin User",
    },
    "manager@nsitf.test": {
      password: "manager123",
      role: "manager",
      displayName: "Manager User",
    },
    "branch@nsitf.test": {
      password: "branch123",
      role: "branch_data_officer",
      displayName: "Branch Officer",
    },
    "claims@nsitf.test": {
      password: "claims123",
      role: "claims_officer",
      displayName: "Claims Officer",
    },
    "compliance@nsitf.test": {
      password: "compliance123",
      role: "compliance_officer",
      displayName: "Compliance Officer",
    },
    "hse@nsitf.test": {
      password: "hse123",
      role: "hse_officer",
      displayName: "HSE Officer",
    },
    "legal@nsitf.test": {
      password: "legal123",
      role: "legal_officer",
      displayName: "Legal Officer",
    },
    "inspection@nsitf.test": {
      password: "inspection123",
      role: "inspection_officer",
      displayName: "Inspection Officer",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    // Check if credentials match test accounts
    const account = testAccounts[email as keyof typeof testAccounts];

    if (!account) {
      toast.error("Invalid email. Use one of the test accounts below.");
      setIsLoading(false);
      setShowTestAccounts(true);
      return;
    }

    if (account.password !== password) {
      toast.error("Invalid password. Check the test accounts list below.");
      setIsLoading(false);
      setShowTestAccounts(true);
      return;
    }

    // Simulate API delay
    setTimeout(() => {
      // Clear any existing tutorial dismissal to simulate new user
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("tutorial_dismissed_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        console.log(
          "[MockLogin] Cleared tutorial dismissal flags for new user simulation",
        );
      }

      // Create mock user data with tutorial_video
      const mockUserData = {
        user_id: `test_${account.role}_${Date.now()}`,
        email: email,
        first_name: account.displayName.split(" ")[0],
        last_name: account.displayName.split(" ")[1] || "User",
        role: account.role,
        tutorial_video: testVideoUrl,
        is_active: true,
        email_verified: true,
      };

      // Store mock token
      localStorage.setItem("access_token", "mock_token_for_testing");

      // Store user data (exactly like real login does)
      localStorage.setItem("user", JSON.stringify(mockUserData));

      console.log("🔍 [MockLogin] Stored mock user data:", mockUserData);
      console.log(
        "✅ [MockLogin] Tutorial video URL:",
        mockUserData.tutorial_video,
      );

      toast.success(`Login successful! Welcome ${account.displayName}`);

      // Redirect to mock dashboard
      router.push("/mock-dashboard");
    }, 800);
  };

  const handleFillTestAccount = (testEmail: string) => {
    const account = testAccounts[testEmail as keyof typeof testAccounts];
    setEmail(testEmail);
    setPassword(account.password);
    setShowTestAccounts(false);
    toast.success(`Filled credentials for ${account.displayName}`);
  };

  const handleClearData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");

    // Clear tutorial dismissals
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("tutorial_dismissed_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    toast.success("All mock data cleared!");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <Image
            src="/nsitf-logo.png"
            alt="NSITF Logo"
            width={56}
            height={56}
            priority
            className="object-contain"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Nigerian Social Insurance Trust Fund
          </h1>
          <p className="text-muted-foreground text-balance">
            Mock Login - Tutorial Video Testing
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter test credentials to simulate new user login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="test@nsitf.test"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Test Accounts Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowTestAccounts(!showTestAccounts)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {showTestAccounts ? "Hide" : "View"} Test Accounts
              </button>
            </div>

            {/* Test Accounts List */}
            {showTestAccounts && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-800 dark:text-green-200">
                    Click any account below to auto-fill credentials
                  </p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(testAccounts).map(([testEmail, account]) => (
                    <button
                      key={testEmail}
                      type="button"
                      onClick={() => handleFillTestAccount(testEmail)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {account.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {testEmail}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          {account.role.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Password: {account.password}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Data Button */}
            <div className="border-t pt-4">
              <Button
                type="button"
                onClick={handleClearData}
                variant="outline"
                className="w-full"
              >
                Clear All Mock Data
              </Button>
            </div>

            {/* Info Note */}
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                What happens after login:
              </h3>
              <ul className="text-xs text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
                <li>You're redirected to the mock dashboard</li>
                <li>Tutorial video modal pops up automatically</li>
                <li>Video starts at 11 seconds with autoplay</li>
                <li>Test the "Don't show again" functionality</li>
              </ul>
            </div>

            {/* Home Link */}
            <div className="text-center text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
