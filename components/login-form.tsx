"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getRoleDefaultRoute,
  normalizeRole,
  isValidRole,
} from "@/lib/role-routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLogin } from "@/services/auth";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSuccess = async (resData: any) => {
    console.log("🔍 [LoginForm] Login response:", resData);
    console.log(
      "🔍 [LoginForm] Login response keys:",
      Object.keys(resData || {})
    );
    toast.success("Logging Successful");

    // Store user data from login response
    // Handle different possible response structures
    let userData = null;

    if (resData?.user) {
      userData = resData.user;
    } else if (resData?.data?.user) {
      userData = resData.data.user;
    } else if (resData?.role) {
      // If user data is directly in resData
      userData = resData;
    }

    console.log("🔍 [LoginForm] Extracted user data:", userData);

    // Normalize role for consistent checking
    const normalizedRole = userData?.role
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const isRegionalUser =
      normalizedRole === "regional_officer" ||
      normalizedRole === "regional_manager";

    console.log("🔍 [LoginForm] Role check:", {
      originalRole: userData?.role,
      normalizedRole,
      isRegionalUser,
      hasRegionId: !!userData?.region_id,
    });

    // If regional user is missing region_id, fetch full profile
    if (userData && isRegionalUser && !userData.region_id) {
      console.log(
        "🔍 [LoginForm] Regional user missing region_id, fetching full profile..."
      );
      try {
        const token = localStorage.getItem("access_token");
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

        const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const profileResult = await response.json();
          console.log("🔍 [LoginForm] Profile API response:", profileResult);

          // Extract user data from profile response
          let fullUserData = null;
          if (Array.isArray(profileResult?.data)) {
            fullUserData = profileResult.data[0];
          } else if (profileResult?.data) {
            fullUserData = profileResult.data;
          } else if (Array.isArray(profileResult)) {
            fullUserData = profileResult[0];
          }

          if (fullUserData?.region_id) {
            console.log(
              "✅ [LoginForm] Got region_id from profile:",
              fullUserData.region_id
            );
            userData = { ...userData, ...fullUserData };
          }
        } else {
          console.warn(
            "⚠️ [LoginForm] Profile fetch failed with status:",
            response.status
          );
        }
      } catch (profileError) {
        console.error("❌ [LoginForm] Failed to fetch profile:", profileError);
      }
    }

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      console.log(
        "🔍 [LoginForm] Stored user data with keys:",
        Object.keys(userData)
      );
      console.log(
        "🔍 [LoginForm] region_id in stored data:",
        userData.region_id
      );
      console.log("🔍 [LoginForm] Setting user role:", userData.role);
      setUserRole(userData.role);
    } else {
      console.error("❌ [LoginForm] No user data found in response");
      toast.error(
        "Login successful but user data is missing. Please contact support."
      );
    }
  };

  const { loginData, loginPayload, loginIsLoading, loginError } =
    useLogin(handleSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const payload = {
      email: email,
      password: password,
    };
    loginPayload(payload);
  };

  useEffect(() => {
    if (loginError) {
      toast.error(loginError || "Could not sign in");
      setIsLoading(false);
    }
  }, [loginError]);

  // Route user after role is set from login response
  useEffect(() => {
    console.log("🔍 [LoginForm] userRole changed to:", userRole);
    if (userRole) {
      console.log("🔍 [LoginForm] Routing user with role:", userRole);

      // Validate and normalize the role
      if (!isValidRole(userRole)) {
        console.error("❌ [LoginForm] Invalid role detected:", userRole);
        toast.error("Invalid user role. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Get the default route for this role
      const defaultRoute = getRoleDefaultRoute(userRole);

      if (defaultRoute) {
        console.log("🔍 [LoginForm] Navigating to:", defaultRoute);
        router.push(defaultRoute);
      } else {
        console.warn(
          "⚠️ [LoginForm] No default route found for role:",
          userRole
        );
        console.log("🔍 [LoginForm] Falling back to /admin/dashboard");
        router.push("/admin/dashboard");
      }

      setIsLoading(false);
    }
  }, [userRole, router]);

  const routeToResetPassword = () => {
    router.push("/reset-password");
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 bg-secondary/50 border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="mt-4 p-3 bg-muted/30 rounded-md border border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Admin: admin@company.com / admin123</p>
              <p>Manager: manager@company.com / manager123</p>
              <p>Branch Officer: branch@company.com / branch123</p>
            </div>
          </div>
          <Button
            asChild
            variant="link"
            className={`text-sm text-muted-foreground focus:ring-offset-2 mx-auto transition-colors duration-200 `}
            onClick={routeToResetPassword}
            aria-label="Reset your password"
          >
            <Link href="/reset-password">Reset Password</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
