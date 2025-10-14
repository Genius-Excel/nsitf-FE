import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/lib/auth"
import { Shield, User } from "lucide-react"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = {
    admin: {
      label: "Admin",
      variant: "default" as const,
      icon: Shield,
    },
    regional_manager: {
      label: "Regional Manager",
      variant: "secondary" as const,
      icon: User,
    },
  }

  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
