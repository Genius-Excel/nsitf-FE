export type UserRole =
  | "admin"
  | "manager"
  | "user"
  | "regional_manager"
  | "claims_officer"
  | "compliance_officer"
  | "hse_officer"
  | "HSE Officer" // API returns this exact string
  | "actuary_officer"
  | "Actuary" // API returns this exact string
  | "legal_officer"
  | "inspection_officer"
  | "branch_data_officer"
  | "Branch Officer"; // API returns this exact string

export interface User {
  id?: string; // For compatibility with mock data
  user_id?: string; // API returns user_id
  email: string;
  name?: string; // For compatibility with mock data
  first_name?: string; // API returns first_name
  last_name?: string; // API returns last_name
  username?: string; // Some APIs return username
  role: UserRole;
  region_id?: string; // Region ID for regional officers
  permissions?: string[]; // Backend permissions like "can_upload_claims", "can_upload_hse", etc.
  phone_number?: string;
  alternative_number?: string | null;
  profile_image?: string | null;
  email_verified?: boolean;
  is_active?: boolean;
  last_login?: string;
  date_joined?: string;
  tutorial_video?: string; // Tutorial video URL for user's role (from backend)
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
  "branch@company.com": {
    password: "branch123",
    user: {
      id: "3",
      email: "branch@company.com",
      name: "Branch Data Officer",
      role: "branch_data_officer",
    },
  },
};

export async function login(
  email: string,
  password: string,
): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const userRecord = MOCK_USERS[email];
  if (userRecord && userRecord.password === password) {
    return userRecord.user;
  }
  return null;
}

export function saveUserToStorage(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function getUserFromStorage(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  }
  return null;
}

export function clearUserFromStorage() {
  if (typeof window !== "undefined") {
    // Clear user data
    localStorage.removeItem("user");

    // Clear authentication token
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("access_token");

    // Clear any other auth-related data
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");

    // Clear session storage as well
    sessionStorage.clear();

    // Force a hard refresh to clear any cached state
    window.location.href = "/";
  }
}
