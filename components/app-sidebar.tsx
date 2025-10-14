"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutDashboard, Users, Shield, ClipboardCheck, HardHat, Scale, LogOut, Building2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { clearUserFromStorage, getUserFromStorage, type User } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define navigation items with updated role-based access
const navigationItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "user"] },
  { title: "User and Role", href: "/dashboard/users", icon: Users, roles: ["admin", "manager"] },
  { title: "Compliance", href: "/dashboard/compliance", icon: Shield, roles: ["admin", "manager"] },
  { title: "Claims Inspection", href: "/dashboard/claims", icon: ClipboardCheck, roles: ["admin", "manager", "user"] },
  { title: "HSE", href: "/dashboard/hse", icon: HardHat, roles: ["admin", "manager", "user"] },
  { title: "Legal", href: "/dashboard/legal", icon: Scale, roles: ["admin", "manager"] },
]

// Utility to construct role-based routes
const getRoleBasedRoute = (role: string | undefined, href: string) => {
  return role ? `/${role}${href}` : href
}

// Navigation item component
interface NavItemProps {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  onClick: () => void
  isCollapsed: boolean
}

const NavItem: React.FC<NavItemProps> = ({ title, href, icon: Icon, isActive, onClick, isCollapsed }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 transition-colors",
            isActive ? "bg-green-500 text-white" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
          onClick={onClick}
          aria-label={title}
        >
          <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
          {!isCollapsed && <span className="text-sm">{title}</span>}
        </Button>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{title}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
)

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Fetch user data
  useEffect(() => {
    try {
      const storedUser = getUserFromStorage()
      setUser(storedUser)
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle logout with confirmation
  const handleLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      clearUserFromStorage()
      router.push("/")
    }
  }, [router])

  // Toggle sidebar collapse
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  // Filter navigation items based on user role
  const filteredNavItems = useMemo(() => {
    return navigationItems.filter((item) => !item.roles || item.roles.includes(user?.role || ""))
  }, [user?.role])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border animate-pulse">
        <div className="h-16 border-b border-sidebar-border p-4">
          <div className="h-8 w-8 bg-gray-300 rounded-md" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  // Fallback UI if no user
  if (!user) {
    return (
      <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="p-4 text-center text-sm text-muted-foreground">
          Unable to load user data. Please log in again.
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 dark:bg-gray-900",
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
            <span className="text-sm font-semibold text-sidebar-foreground dark:text-gray-200">NSTIF</span>
            <span className="text-xs text-muted-foreground capitalize dark:text-gray-400">
              {user?.role.replace("_", " ")}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === getRoleBasedRoute(user?.role, item.href)
          return (
            <NavItem
              key={item.href}
              title={item.title}
              href={getRoleBasedRoute(user?.role, item.href)}
              icon={item.icon}
              isActive={isActive}
              onClick={() => router.push(getRoleBasedRoute(user?.role, item.href))}
              isCollapsed={isCollapsed}
            />
          )
        })}
      </nav>

      {/* User Info & Logout */}
      {!isCollapsed && (
        <div className="border-t border-sidebar-border p-4 space-y-2">
          <div className="px-3 py-2 rounded-md bg-sidebar-accent/50 dark:bg-gray-800">
            <p className="text-xs font-medium text-sidebar-foreground dark:text-gray-200">{user?.name}</p>
            <p className="text-xs text-muted-foreground dark:text-gray-400">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-gray-700 dark:text-gray-200"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      )}
    </div>
  )
}