"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Briefcase,
  Settings,
  Search,
  User,
  BarChart,
  LogOut,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Mountain,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import Image from "next/image";

type UserRole = "admin" | "volunteer" | "agency" | "super_admin" | null;

interface Profile {
  role: UserRole;
  full_name: string | null;
}

const ROUTES = {
  admin: {
    dashboard: "/dashboard/admin",
    projects: "/dashboard/admin/projects",
    volunteers: "/dashboard/admin/volunteers",
    agencies: "/dashboard/admin/agencies",
    settings: "/dashboard/admin/settings",
    profile: "/dashboard/admin/profile",
  },
  super_admin: {
    dashboard: "/dashboard/super_admin",
    projects: "/dashboard/super_admin/projects",
    volunteers: "/dashboard/super_admin/volunteers",
    agencies: "/dashboard/super_admin/agencies",
    settings: "/dashboard/super_admin/settings",
    profile: "/dashboard/super_admin/profile",
    invite_admin: "/dashboard/super_admin/invite_admin",
  },
  volunteer: {
    dashboard: "/dashboard/volunteer",
    projects: "/dashboard/volunteer/projects",
    profile: "/dashboard/volunteer/profile",
    findOpportunity: "/dashboard/volunteer/find-opportunity",
    settings: "/dashboard/volunteer/settings",
    requests: "/dashboard/volunteer/requests",
  },
  agency: {
    dashboard: "/dashboard/agency",
    projects: "/dashboard/agency/projects",
    profile: "/dashboard/agency/profile",
    analytics: "/dashboard/agency/analytics",
    settings: "/dashboard/agency/settings",
  },
  guest: {
    home: "/",
    login: "/login",
  },
};

const MENU_ITEMS = {
  admin: [
    { path: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { path: ROUTES.admin.projects, label: "Projects", icon: Briefcase },
    { path: ROUTES.admin.volunteers, label: "Volunteers", icon: Users },
    { path: ROUTES.admin.agencies, label: "Agencies", icon: Home },
    { path: ROUTES.admin.settings, label: "Settings", icon: Settings },
  ],
  super_admin: [
    {
      path: ROUTES.super_admin.dashboard,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { path: ROUTES.super_admin.projects, label: "Projects", icon: Briefcase },
    { path: ROUTES.super_admin.volunteers, label: "Volunteers", icon: Users },
    { path: ROUTES.super_admin.agencies, label: "Agencies", icon: Home },
    { path: ROUTES.super_admin.settings, label: "Settings", icon: Settings },
    {
      path: ROUTES.super_admin.invite_admin,
      label: "Invite Admin",
      icon: Settings,
    },
  ],
  volunteer: [
    {
      path: ROUTES.volunteer.dashboard,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { path: ROUTES.volunteer.projects, label: "My Projects", icon: Briefcase },
    { path: ROUTES.volunteer.profile, label: "Profile", icon: User },
    { path: ROUTES.volunteer.requests, label: "Requests", icon: User },
    {
      path: ROUTES.volunteer.findOpportunity,
      label: "Find Opportunity",
      icon: Search,
    },
    { path: ROUTES.volunteer.settings, label: "Settings", icon: Settings },
  ],
  agency: [
    {
      path: ROUTES.agency.dashboard,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { path: ROUTES.agency.projects, label: "Projects", icon: Briefcase },
    { path: ROUTES.agency.profile, label: "Profile", icon: User },
    { path: ROUTES.agency.analytics, label: "Analytics", icon: BarChart },
    { path: ROUTES.agency.settings, label: "Settings", icon: Settings },
  ],
  guest: [
    { path: ROUTES.guest.home, label: "Home", icon: Home },
    { path: ROUTES.guest.login, label: "Login", icon: LogOut },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [userRole, setUserRole] = React.useState<UserRole>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (!session) {
        setUserRole(null);
        setUserName(null);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = (await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single()) as { data: Profile | null; error: any };

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        setUserRole(null);
        setUserName(null);
      } else {
        setUserRole(profile.role || null);
        setUserName(profile.full_name);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(//@ts-ignore
      (_event, session) => {
        if (session) {
          fetchUser();
        } else {
          setUserRole(null);
          setUserName(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = debounce(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push(ROUTES.guest.home);
    } else {
      console.error("Logout error:", error);
    }
    setLoading(false);
  }, 300);

  // Helper to determine if a menu item is active
  const isActive = (itemPath: string, currentPath: string) => {
    // Exact match for dashboard to avoid always-active issue
    if (itemPath.includes("dashboard")) {
      return currentPath === itemPath;
    }
    // Allow sub-routes for projects (e.g., /projects/[id])
    if (itemPath.includes("projects")) {
      return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
    }
    // Exact match for other routes
    return currentPath === itemPath;
  };

  const getMenuItems = (role: UserRole) => {
    const items = MENU_ITEMS[role || "guest"];
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-sm text-white dark:text-gray-100 bg-[#0ea5e9] mb-6 mt-2 p-2 rounded">
          {role
            ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
            : "Navigation"}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item, index) => (
              <SidebarMenuItem key={item.path}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <SidebarMenuButton
                    asChild
                    className={`text-sm transition-colors ${
                      isActive(item.path, pathname)
                        ? "bg-gray-100 dark:bg-gray-800 text-[#0284C7] dark:text-blue-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0284C7] dark:hover:text-blue-400"
                    }`}
                    aria-current={
                      isActive(item.path, pathname) ? "page" : undefined
                    }
                  >
                    <Link href={item.path}>
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className="bg-white dark:bg-gray-900">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-sm">
                  <Image
                    src="/svg/logo.svg"
                    alt="Diaspora Logo"
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                  />
                  <span className="hidden md:inline text-sm font-bold text-gray-900 dark:text-gray-100">
                    DiasporaBase
                  </span>
                  <ChevronDown className="h-4 w-4 ml-auto text-gray-500 dark:text-gray-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width] text-xs">
                <DropdownMenuItem>
                  <span>About Us</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Contact</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="bg-gray-200 dark:bg-gray-700" />
      <SidebarContent className="px-2">
        {loading ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm text-gray-900 dark:text-gray-100">
              Loading...
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({
                  length: MENU_ITEMS[userRole || "guest"].length,
                }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton>
                      <div className="h-4 w-4 rounded-full bg-muted" />
                      <div className="h-4 w-24 rounded bg-muted" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          getMenuItems(userRole)
        )}
      </SidebarContent>
      <SidebarSeparator className="bg-gray-200 dark:bg-gray-700" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-sm">
                  <User className="h-4 w-4 mr-2 text-[#0284C7] dark:text-blue-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {userName || "Guest"}
                  </span>
                  <ChevronUp className="h-4 w-4 ml-auto text-gray-500 dark:text-gray-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] text-xs"
              >
                {userRole && (
                  <>
                    <DropdownMenuItem>
                      <Link href={ROUTES[userRole].profile} className="w-full">
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={ROUTES[userRole].settings} className="w-full">
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} disabled={loading}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </>
                )}
                {!userRole && (
                  <DropdownMenuItem>
                    <Link href={ROUTES.guest.login} className="w-full">
                      <span>Login</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
