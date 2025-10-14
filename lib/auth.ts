// Simple authentication utilities for demo purposes
// In production, use a proper auth solution like Supabase Auth

export type UserRole = "admin" | "regional_manager"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Mock user database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@company.com": {
    password: "admin123",
    user: {
      id: "1",
      email: "admin@company.com",
      name: "Admin User",
      role: "admin",
    },
  },
  "manager@company.com": {
    password: "manager123",
    user: {
      id: "2",
      email: "manager@company.com",
      name: "Regional Manager",
      role: "regional_manager",
    },
  },
}

export async function login(email: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const userRecord = MOCK_USERS[email]
  if (userRecord && userRecord.password === password) {
    return userRecord.user
  }
  return null
}

export function saveUserToStorage(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export function getUserFromStorage(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      return JSON.parse(userStr)
    }
  }
  return null
}

export function clearUserFromStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}
