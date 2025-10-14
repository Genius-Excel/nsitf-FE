"use client"

import { useEffect, useState } from "react"
import { User as UserIcon } from "lucide-react"
import { getUserFromStorage, type User } from "@/lib/auth"
import { cn } from "@/lib/utils"

// Sample avatar background colors
const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-teal-500",
]

// Utility to get random color
const getRandomColor = () => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)]
}

// Utility to get user initials
const getInitials = (name: string) => {
  const names = name.trim().split(" ")
  const initials = names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0].slice(0, 2)
  return initials.toUpperCase()
}

// Utility to format date and time
const formatDateTime = (date: Date) => {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }
  return {
    date: date.toLocaleDateString("en-US", dateOptions),
    time: date.toLocaleTimeString("en-US", timeOptions),
  }
}

export function DashboardNavbarUser() {
  const [user, setUser] = useState<User | null>(null)
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()))
  const [avatarBg, setAvatarBg] = useState(getRandomColor())

  // Fetch user data
  useEffect(() => {
    try {
      const storedUser = getUserFromStorage()
      setUser(storedUser)
      //@ts-ignore
      if (!storedUser?.image) {
        setAvatarBg(getRandomColor())
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }, [])

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatDateTime(new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-4 p-4 bg-sidebar border-b border-sidebar-border">
      {/* Date and Time */}
      <div className="flex flex-col text-sm text-sidebar-foreground">
        <span className="font-medium">{dateTime.date}</span>
        <span className="text-muted-foreground">{dateTime.time}</span>
      </div>

      {/* User Image or Avatar */}
      <div className="ml-auto flex items-center gap-3">
        {user? (
          <>
            {user.image ? (
              <img
                src={user.image}
                alt={`${user.name}'s avatar`}
                className="h-10 w-10 rounded-full object-cover"
                aria-label={`Profile image of ${user.name}`}
              />
            ) : (
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm",
                  avatarBg
                )}
                aria-label={`Avatar with initials for ${user.name}`}
              >
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </>
        ) : (
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm",
              avatarBg
            )}
            aria-label="Default user avatar"
          >
            <UserIcon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}