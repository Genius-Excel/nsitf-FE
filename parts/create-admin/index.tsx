"use client"
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { useCreateAdmin } from "@/services/auth";
import { toast } from "sonner";

// Zod schema for form validation
const adminSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be 50 characters or less"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be 50 characters or less"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        "Password must contain at least one letter and one number",
      ),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function CreateAdminForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSucess =()=>{
    toast.success("Account created")
      router.push("/");
  }
  const { createAdminData, createAdminError, createAdminPayload } = useCreateAdmin(handleSucess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Prepare form data
    const formData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    };

    try {
      const validatedData = adminSchema.parse(formData);

       createAdminPayload({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone_number: validatedData.phoneNumber,
        password: validatedData.password,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (createAdminError) {
        // Handle API errors from createAdminPayload
        setErrors({ general: createAdminError || "Failed to create admin account" });
      } else {
        // Handle unexpected errors
        setErrors({ general: "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const routeToLogin = () => {
    router.push("/");
  };

  return (
    <Card className="w-full max-w-md border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create Admin Account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter details to create a new admin account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter Phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.phoneNumber}
                </p>
              )}
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
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10 bg-secondary/50 border-border"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.general}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-500 text-white hover:bg-green-300"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <Button
            asChild
            variant="link"
            className="text-sm text-muted-foreground focus:ring-offset-2 mx-auto transition-colors duration-200"
            onClick={routeToLogin}
            aria-label="Back to login"
          >
            <Link href="/">Back to Login</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}