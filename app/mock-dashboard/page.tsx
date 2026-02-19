"use client";

import { useEffect, useState } from "react";
import { TutorialVideoModal } from "@/components/tutorial-video-modal";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ClipboardCheck,
  TrendingUp,
  Activity,
  LogOut,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Mock Dashboard for Testing Tutorial Video Feature
 * Matches the design and color scheme of the main application
 */
export default function MockDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roleName, setRoleName] = useState<string>("");

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Format role name for display
      const formattedRole = userData.role
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setRoleName(formattedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    toast.success("Logged out successfully!");
    router.push("/mock-login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Tutorial Video Modal - Auto-shows for new users */}
      <TutorialVideoModal />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/nsitf-logo.png"
                alt="NSITF Logo"
                width={40}
                height={40}
                priority
                className="object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold">
                  Nigerian Social Insurance Trust Fund
                </h1>
                <p className="text-xs text-muted-foreground">
                  Mock Dashboard - Tutorial Testing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {user.first_name}!
          </h2>
          <p className="text-muted-foreground mt-1">
            You are logged in as{" "}
            <span className="font-semibold text-green-600">{roleName}</span>
          </p>
        </div>

        {/* Tutorial Info Card */}
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tutorial Video Testing Mode
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              This is a mock dashboard designed for testing the tutorial video
              feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="mb-2">
                <strong>✨ What's happening:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>
                  The tutorial video modal should have appeared when you first
                  landed on this page
                </li>
                <li>The video starts at 11 seconds with autoplay enabled</li>
                <li>You can test the "Don't show me again" functionality</li>
                <li>Logout and login again to test the dismissal behavior</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mock Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Mock data for testing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Claims
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">567</div>
              <p className="text-xs text-muted-foreground">
                Mock data for testing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compliance Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">
                Mock data for testing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.3%</div>
              <p className="text-xs text-muted-foreground">
                Mock data for testing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Test Account Details</CardTitle>
            <CardDescription>
              Mock user data stored in localStorage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">User ID:</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {user.user_id}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Email:</span>
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Role:</span>
                <span className="text-muted-foreground">{roleName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Tutorial Video:</span>
                <span className="text-muted-foreground text-xs break-all max-w-md">
                  {user.tutorial_video}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Status:</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
            <CardDescription>
              How to test the tutorial video feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-green-600">1.</span>
                <span>
                  <strong>Tutorial Modal:</strong> The video should have
                  auto-appeared when you first loaded this page. If you
                  dismissed it, logout and login again as a new user to see it.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">2.</span>
                <span>
                  <strong>Test Dismissal:</strong> Click "Don't Show Me Again"
                  in the modal, then logout and login with the same role. The
                  modal should NOT appear.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">3.</span>
                <span>
                  <strong>Test Close:</strong> Click "Close (Show Again Later)"
                  button, refresh the page, and the modal should appear again.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">4.</span>
                <span>
                  <strong>Different Roles:</strong> Logout and login as a
                  different role. Each role is tracked separately, so you'll see
                  the tutorial again.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">5.</span>
                <span>
                  <strong>Reset:</strong> Use "Clear All Mock Data" on the login
                  page to completely reset all test data and dismissal flags.
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
