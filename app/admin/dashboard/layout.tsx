"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardNavbarUser } from "@/components/dashboard-navbar-user";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" && window.innerWidth >= 640
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 640
  );

  // Toggle sidebar visibility for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Toggle sidebar collapse for desktop
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      {isSidebarOpen && (
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      )}
      <SidebarInset>
        <header
          className={cn(
            "flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 py-2 z-20 relative",
            isSidebarOpen ? "ml-16 sm:ml-64" : "ml-0"
          )}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:block"
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
        <main
          className={cn(
            "flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50 transition-all duration-300",
            isSidebarOpen ? "ml-16 sm:ml-64" : "ml-0"
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
