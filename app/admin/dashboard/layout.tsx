"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardNavbarUser } from "@/components/dashboard-navbar-user";
import { cn } from "@/lib/utils";
import { getUserFromStorage } from "@/lib/auth";
import { LoadingState } from "@/components/design-system/LoadingState";
import { TutorialVideoModal } from "@/components/tutorial-video-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const user = getUserFromStorage();

      if (!user) {
        // No user found, redirect to login
        console.log("No authenticated user found, redirecting to login...");
        router.push("/");
      } else {
        // User is authenticated
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  // Toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <LoadingState message="Verifying authentication..." />;
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <div
          className={cn(
            "flex flex-col flex-1 transition-all duration-300",
            isSidebarCollapsed ? "ml-16" : "ml-64",
          )}
        >
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 py-2 z-20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebarCollapse}
                aria-label={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                <PanelLeft className="h-6 w-6 text-gray-600" />
              </Button>
              <div className="space-y-1">
                <h2 className="text-xl text-green-700 font-semibold">
                  Nigeria Social Insurance Trust Fund
                </h2>
                <p className="text-gray-400 text-sm">
                  Automated and Digitalized Actuarial Data Structure
                </p>
              </div>
            </div>
            <DashboardNavbarUser />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50">
            <TutorialVideoModal />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
