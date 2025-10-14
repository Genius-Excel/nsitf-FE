"use client"

import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Shield, ClipboardCheck, HardHat, Scale, LogOut, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { clearUserFromStorage, getUserFromStorage, type User } from "@/lib/auth"
import { useEffect, useState } from "react"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User and Role",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Compliance",
    href: "/dashboard/compliance",
    icon: Shield,
  },
  {
    title: "Claims Inspection",
    href: "/dashboard/claims",
    icon: ClipboardCheck,
  },
  {
    title: "HSE",
    href: "/dashboard/hse",
    icon: HardHat,
  },
  {
    title: "Legal",
    href: "/dashboard/legal",
    icon: Scale,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUserFromStorage())
  }, [])

  const handleLogout = () => {
    clearUserFromStorage()
    router.push("/")
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="h-8 w-8 rounded-md bg-green-400 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">NSTIF</span>
          <span className="text-xs text-muted-foreground capitalize">{user?.role.replace("_", " ")}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-green-400 text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={() => router.push(`/${user?.role}${item.href}`)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.title}</span>
            </Button>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <div className="px-3 py-2 rounded-md bg-sidebar-accent/50">
          <p className="text-xs font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  )
}
