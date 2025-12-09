"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const handleSuccess = () => {
    toast.success("Logging Successful");
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
  useEffect(() => {
    if (loginData) {
      // Extract user data - API returns array with single user object
      const userData = Array.isArray(loginData) ? loginData[0] : loginData;

      if (userData) {
        // Store the user object (not the array)
        localStorage.setItem("user", JSON.stringify(userData));
        setUserRole(userData.role);
      }
    }
    if (userRole) {
      // Route users based on their role
      if (userRole === "Branch Officer") {
        router.push("/branch/dashboard");
      } else {
        // All other users route to /admin/dashboard
        router.push("/admin/dashboard");
      }
      setIsLoading(false);
    }
  }, [loginData, userRole, router]);

  const routeToResetPassword = () => {
    router.push("/reset-password");
  };

  return (
    <Card className="w-full max-w-md border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-muted-foreground">
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
