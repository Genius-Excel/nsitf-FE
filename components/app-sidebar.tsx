"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  ClipboardCheck,
  HardHat,
  Scale,
  LogOut,
  Building2,
  FileCheck,
  ShieldCheck,
  FileText,
  ChartBar,
  Activity,
  LineChart,
  AlertTriangle,
  Wallet,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { clearUserFromStorage, getUserFromStorage } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetUserProfile } from "@/services/auth";
import { hasPermission } from "@/lib/permissions";
import {
  getRoleModules,
  normalizeRole,
  validRoles,
  type Role,
} from "@/lib/role-routing";

// Define User type for TypeScript
interface User {
  email: string;
  id: string;
  name: string;
  role: string;
  permissions?: string[];
}

// Define navigation item type
interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  roles?: Role[];
  permission?: string;
}

// Define navigation items with role-based access
const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager"] as Role[],
    permission: "view_dashboard", // Requires view_dashboard permission
  },
  {
    title: "User and Role",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin", "manager"] as Role[],
  },
  {
    title: "Compliance",
    href: "/dashboard/compliance",
    icon: Shield,
    roles: [
      "admin",
      "manager",
      "regional_manager",
      "regional_officer",
      "compliance_officer",
    ] as Role[],
  },
  {
    title: "Claims and compensation",
    href: "/dashboard/claims",
    icon: FileText,
    roles: [
      "admin",
      "manager",
      "regional_manager",
      "regional_officer",
      "actuary",
      "claims_officer",
    ] as Role[],
  },
  {
    title: "Inspection",
    href: "/dashboard/inspections",
    icon: ShieldCheck,
    roles: [
      "admin",
      "manager",
      "regional_manager",
      "regional_officer",
      "inspection_officer",
      "inspector_officer",
    ] as Role[],
  },
  {
    title: "HSE",
    href: "/dashboard/hse",
    icon: HardHat,
    roles: [
      "admin",
      "manager",
      "regional_manager",
      "regional_officer",
      "hse_officer",
    ] as Role[],
  },
  {
    title: "Legal",
    href: "/dashboard/legal",
    icon: Scale,
    roles: [
      "admin",
      "manager",
      "regional_manager",
      "regional_officer",
      "legal_officer",
    ] as Role[],
  },
  {
    title: "KPI Analytics",
    href: "/dashboard/kpi",
    icon: Activity,
    roles: ["admin", "manager"] as Role[],
  },
  {
    title: "Valuation & Forecasting",
    href: "/dashboard/valuation",
    icon: LineChart,
    roles: ["admin", "manager"] as Role[],
  },
  {
    title: "Risk Analysis",
    href: "/dashboard/risk",
    icon: AlertTriangle,
    roles: ["admin", "manager"] as Role[],
  },
  {
    title: "Investment & Treasury",
    href: "/dashboard/investment",
    icon: Wallet,
    roles: ["admin", "manager"] as Role[],
  },
];

// Utility to construct role-based routes
// Branch data officers get their dedicated branch routes, others use admin routes
const getRoleBasedRoute = (role: Role | undefined, href: string) => {
  if (role === "branch_data_officer") {
    // Branch officers use their specific routes directly
    return href;
  }
  if (role === "regional_manager") {
    // Regional managers use manager routes
    return href === "/dashboard" ? "/manager/dashboard" : `/manager${href}`;
  }
  return role && validRoles.includes(role) ? `/admin${href}` : href;
};

// Utility to get user initials
const getInitials = (name: string) => {
  const names = name.trim().split(" ");
  const initials =
    names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0].slice(0, 2);
  return initials.toUpperCase();
};

// Navigation item component
interface NavItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  title,
  href,
  icon: Icon,
  isActive,
  onClick,
  isCollapsed,
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 transition-colors px-3 py-2",
            isActive
              ? "bg-green-500 text-white hover:bg-green-600"
              : "text-sidebar-foreground hover:bg-green-50 hover:text-green-700",
            isCollapsed && "justify-center px-2"
          )}
          onClick={onClick}
          aria-label={title}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
          {!isCollapsed && <span className="text-sm">{title}</span>}
        </Button>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{title}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

export function AppSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    filterUserData,
    gettingUserData,
    refetchUserData,
    userData,
    userDataError,
  } = useGetUserProfile({ enabled: true }); // Fetch only if no user

  // Fetch and process user data
  useEffect(() => {
    try {
      if (userDataError) {
        setError("Failed to fetch user data. Please try again.");
        setIsLoading(false);
        return;
      }
      if (userData) {
        // Normalize role: trim, lowercase, replace spaces with underscores
        const normalizedRole = userData[0].role
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        const fetchedUser: User = {
          email: userData[0].email,
          id: userData[0].user_id,
          name: `${userData[0].first_name} ${userData[0].last_name}`,
          role: normalizedRole,
        };
        // Validate role
        if (!validRoles.includes(fetchedUser.role as Role)) {
          setError(
            `Invalid user role detected: ${normalizedRole}. Expected one of: ${validRoles.join(
              ", "
            )}`
          );
          console.error("Role validation failed:", {
            originalRole: userData[0].role,
            normalizedRole,
            validRoles,
          });
          setIsLoading(false);
          return;
        }
        setUser(fetchedUser);
        setError(null);
      }
    } catch (error) {
      setError("An unexpected error occurred while fetching user data.");
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userDataError]);

  // Handle logout with dialog
  const handleLogout = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    try {
      setIsDialogOpen(false);
      // clearUserFromStorage will handle the redirect and clear all data
      await clearUserFromStorage();
    } catch (error) {
      setError("Failed to log out. Please try again.");
      console.error("Logout error:", error);
    }
  }, []);

  const cancelLogout = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // Toggle sidebar collapse
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  // Filter navigation items based on user role and permissions
  const filteredNavItems = useMemo(() => {
    if (!user?.role) return [];

    // Normalize the role to handle different naming conventions
    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole) {
      console.error("❌ [AppSidebar] Invalid role:", user.role);
      return [];
    }

    // Get allowed modules for this specific role
    const allowedModules = getRoleModules(user.role);

    return navigationItems.filter((item) => {
      // For specific officer roles with restricted modules, only show their designated module(s)
      if (allowedModules.length > 0 && allowedModules.length < 5) {
        // This is a restricted role (not admin/manager)
        return allowedModules.some((module) =>
          item.title.toLowerCase().includes(module.toLowerCase())
        );
      }

      // For other roles (admin, manager, regional_manager, etc.), apply normal filtering
      // Check role-based access with defensive null check
      const hasRoleAccess =
        !item.roles ||
        (user?.role &&
          validRoles.includes(normalizedRole) &&
          item.roles.includes(normalizedRole));

      if (!hasRoleAccess) return false;

      // Check permission-based access if permission is specified
      if (item.permission) {
        return hasPermission(
          normalizedRole,
          item.permission,
          user?.permissions
        );
      }

      return true;
    });
  }, [user?.role, user?.permissions]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-sidebar border-r border-sidebar-border animate-pulse z-10">
        <div className="h-16 border-b border-sidebar-border p-4">
          <div className="h-8 w-8 bg-gray-300 rounded-md" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  // Error or no user state
  if (error || !user) {
    return (
      <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-sidebar border-r border-sidebar-border z-10">
        <div className="p-4 text-center text-sm text-muted-foreground">
          {error || "Unable to load user data. Please log in again."}
          <Button
            variant="link"
            onClick={() => router.push("/")}
            className="mt-2"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 dark:bg-gray-900 z-10",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="h-8 w-8 rounded-md bg-green-400 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground dark:text-gray-200">
                NSITF
              </span>
              <span className="text-xs text-muted-foreground capitalize dark:text-gray-400">
                {user.role}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="ml-auto"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? ">" : "<"}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const roleBasedHref = getRoleBasedRoute(
              user.role as Role,
              item.href
            );
            const isActive = pathname === roleBasedHref;
            return (
              <NavItem
                key={item.href}
                title={item.title}
                href={roleBasedHref}
                icon={item.icon}
                isActive={isActive}
                onClick={() => router.push(roleBasedHref)}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto border-t border-sidebar-border p-2 bg-white">
          {isCollapsed ? (
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        router.push("/admin/dashboard/user-profile")
                      }
                      className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mx-auto hover:bg-green-600 transition-colors cursor-pointer"
                      aria-label={`View profile for ${user.name}`}
                    >
                      {getInitials(user.name)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">View Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-gray-700 dark:text-gray-200"
                      onClick={handleLogout}
                      aria-label="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin/dashboard/user-profile")}
                className="w-full px-2 py-1 rounded-md bg-sidebar-accent/50 dark:bg-gray-800 hover:bg-sidebar-accent dark:hover:bg-gray-700 transition-colors cursor-pointer text-left"
                aria-label="View profile"
              >
                <p className="text-xs font-medium text-sidebar-foreground dark:text-gray-200">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  {user.email}
                </p>
              </button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white bg-red-500 hover:bg-red-400 dark:hover:bg-gray-700 dark:text-gray-200"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-sidebar text-sidebar-foreground border-sidebar-border bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to log in again to
              access the dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelLogout}
              className="text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
              aria-label="Cancel logout"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
              aria-label="Confirm logout"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
