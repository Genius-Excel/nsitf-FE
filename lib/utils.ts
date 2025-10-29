import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "./supabase/client";
import { toast } from "sonner";
import { parse, format } from "date-fns";
import { ComplianceEntry, DashboardMetrics } from "./types";
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Database } from "./database/types";

const supabase = createClient();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getUserId() {
  try {
    // Get the current session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!user) {
      return { data: null, error: "No authenticated user found." };
    }

    return { data: user.id, error: null };
  } catch (err) {
    //@ts-ignore
    return {
      data: null, //@ts-ignore
      error: `Unexpected error fetching user ID: ${err.message}`,
    };
  }
}

export async function getUserLocation() {
  try {
    // Fetch location data from GeoJS API
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Extract relevant location information
    const location = {
      ip: data.ip,
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      timezone: data.timezone,
      organization: data.organization,
    };

    return location;
  } catch (error) {
    console.error("Error fetching user location:", error);
    return null;
  }
}

export async function handleEmailConfirmationRedirect() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error.message);
    // Handle error, maybe redirect to an error page
    return;
  }

  if (session) {
    const userId = session.user.id;
    // Fetch user's role from your database (e.g., from a 'profiles' table)
    const { data: profile, error: profileError } = await supabase
      .from("profiles") // Assuming you have a profiles table with user roles
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError.message);
      // Handle error
      return;
    }

    if (profile && profile.role) {
      switch (profile.role) {
        case "admin":
          window.location.href = "/dashboard/admin";
          break;
        case "super_admin":
          window.location.href = "/dashboard/super_admin";
          break;
        case "volunteer":
          window.location.href = "/onboarding/volunteer";
          break;
        case "agency":
          window.location.href = "/onboarding/agency";
          break;
        default:
          window.location.href = "/dashboard";
      }
    } else {
      window.location.href = "/dashboard";
    }
  } else {
    window.location.href = "/login";
  }
}

interface Item {
  id: string;
  label: string;
  children?: Item[];
  subChildren?: Item[];
}

interface Skillset {
  id: string;
  label: string;
  parent_id: string | null;
}

export async function getSkillsets(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from("skillsets")
      .select("id, label, parent_id")
      .order("id"); // Optional: Ensures consistent ordering

    if (error) {
      throw new Error(`Error fetching skillsets: ${error.message}`);
    }

    // Transform flat skillsets into hierarchical structure
    const topLevel = data.filter((s: Skillset) => s.parent_id === null);
    const transformedItems: Item[] = topLevel.map((top: Skillset) => {
      const children = data
        .filter((s: Skillset) => s.parent_id === top.id)
        .map((child: Skillset) => ({
          id: child.id,
          label: child.label,
          subChildren: data
            .filter((s: Skillset) => s.parent_id === child.id)
            .map((subChild: Skillset) => ({
              id: subChild.id,
              label: subChild.label,
            })),
        }));
      return {
        id: top.id,
        label: top.label,
        children,
      };
    });

    return transformedItems;
  } catch (error: any) {
    toast.error(error.message);
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<{
  data: number | null;
  error: string | null;
}> {
  try {
    const { data: userId, error: userIdError } = await getUserId();
    if (userIdError) return { data: null, error: userIdError };
    if (!userId)
      return { data: null, error: "Please log in to check notifications." };

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error)
      return {
        data: null,
        error: "Error counting notifications: " + error.message,
      };

    return { data: count, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

// export type Profile = Database['public']['Tables']['profiles']['Row'];

// export const fetchProfile = async (): Promise<{
//   userId: string | null;
//   profile: Profile | null;
//   error: string | null;
// }> => {
//   const supabase = createClientComponentClient<Database>();

//   try {
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError || !user) {
//       const errorMsg = 'Please log in to view the dashboard.';
//       console.error('fetchProfile: Error fetching user:', userError?.message);
//       toast.error(errorMsg);
//       return { userId: null, profile: null, error: errorMsg };
//     }

//     const { data: profileData, error: profileError } = await supabase
//       .from('profiles')
//       .select(`
//         id,
//         full_name,
//         email,
//         role,
//         phone,
//         date_of_birth,
//         address,
//         skills,
//         availability,
//         experience,
//         residence_country,
//         residence_state,
//         origin_country,
//         origin_state,
//         origin_lga,
//         organization_name,
//         contact_person_first_name,
//         contact_person_last_name,
//         contact_person_email,
//         contact_person_phone,
//         website,
//         organization_type,
//         description,
//         tax_id,
//         focus_areas,
//         environment_cities,
//         environment_states,
//         volunteer_countries,
//         volunteer_states,
//         volunteer_lgas,
//         receives_updates,
//         is_active,
//         profile_picture,
//         updated_at,
//         notification_preferences,
//         deleted_at
//       `)
//       .eq('id', user.id)
//       .single();

//     if (profileError || !profileData) {
//       const errorMsg = 'Profile not found.';
//       console.error('fetchProfile: Error fetching profile:', profileError?.message);
//       toast.error(errorMsg);
//       return { userId: user.id, profile: null, error: errorMsg };
//     }

//     return {
//       userId: user.id,
//       profile: profileData as Profile,
//       error: null,
//     };
//   } catch (err: any) {
//     console.error('fetchProfile: Unexpected error:', err.message);
//     toast.error(err.message);
//     return { userId: null, profile: null, error: err.message };
//   }
// };

// lib/checkAgencyStatus.ts
interface Volunteer {
  id: string;
  role: string;
  is_active?: boolean;
  [key: string]: any;
}

export function checkAgencyStatus(volunteer: Volunteer): {
  status: "success" | "error";
  message: string;
  isAgencyActive?: boolean;
} {
  try {
    if (!volunteer || typeof volunteer !== "object") {
      return { status: "error", message: "Invalid volunteer data provided" };
    }
    if (volunteer.role.toLowerCase() !== "agency") {
      return { status: "error", message: "User is not an agency" };
    }
    if (typeof volunteer.is_active !== "boolean") {
      return {
        status: "error",
        message: "Agency active status is not defined or invalid",
      };
    }
    return {
      status: "success",
      message: `Agency is ${volunteer.is_active ? "active" : "inactive"}`,
      isAgencyActive: volunteer.is_active,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: `Error checking agency status: ${error.message}`,
    };
  }
}

export function checkIfAgencyIsActive() {
  //@ts-ignore
  const { data: userIdData, error: userError } = getUserId();

  if (userError || !userIdData?.userId) {
    toast.error("Please login again");
    return Promise.resolve(false); // Return resolved Promise<boolean>
  }

  return supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", userIdData.userId)
    .single() //@ts-ignore
    .then(({ data: profile, error: profileError }) => {
      if (profileError || !profile) {
        toast.error("Failed to fetch user profile");
        return false;
      }

      const isAgencyActive =
        profile.role === "agency" && profile.is_active === true;

      if (!isAgencyActive) {
        toast.error(
          "Agency account is not active. Contact admin for approval."
        );
        return false;
      }

      return true;
    }) //@ts-ignore
    .catch((err) => {
      console.error("Unexpected error:", err);
      toast.error("An error occurred checking agency status");
      return false;
    });
}

//please do not remove the functions below.

export const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    Admin: "bg-blue-100 text-blue-700",
    Actuary: "bg-purple-100 text-purple-700",
    Inspector: "bg-cyan-100 text-cyan-700",
    Legal: "bg-orange-100 text-orange-700",
    "HSE Officer": "bg-amber-100 text-amber-700",
    "Compliance Officer": "bg-pink-100 text-pink-700",
    "Economy Officer": "bg-indigo-100 text-indigo-700",
  };
  return colors[role] || "bg-gray-100 text-gray-700";
};

export const getStatusBadgeColor = (status: string): string => {
  const colors: Record<string, string> = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    "Under Review": "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};

export const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    "Medical Refund": "bg-green-50 border-l-4 border-green-500",
    Disability: "bg-blue-50 border-l-4 border-blue-500",
    "Death Claim": "bg-purple-50 border-l-4 border-purple-500",
    "Loss of Productivity": "bg-yellow-50 border-l-4 border-yellow-500",
  };
  return colors[type] || "bg-gray-50 border-l-4 border-gray-500";
};

export const getTypeTextColor = (type: string): string => {
  const colors: Record<string, string> = {
    "Medical Refund": "text-green-700",
    Disability: "text-blue-700",
    "Death Claim": "text-purple-700",
    "Loss of Productivity": "text-yellow-700",
  };
  return colors[type] || "text-gray-700";
};

export const getActivityStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    "Under Investigation": "bg-yellow-100 text-yellow-700",
    "Follow-up Required": "bg-blue-100 text-blue-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};

export function getLocalStorageItem(key: string) {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
}

export function getAccessToken() {
  if (typeof window !== "undefined") {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData["access-token"] || null;
      }
      return null;
    } catch (error) {
      console.error("Error accessing or parsing localStorage:", error);
      return null;
    }
  }
  return null;
}

export const formatDate = (dateString: string): string => {
  try {
    const date = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date());
    return format(date, "MMMM d, yyyy, h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to original string if parsing fails
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-blue-500";
    case "closed":
      return "bg-green-500";
    case "assigned-obtained":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "closed":
      return "Closed";
    case "assigned-obtained":
      return "Assigned Obtained";
    default:
      return status;
  }
};

// export const getRoleBadgeColor = (role: string): string => {
//   const colors: Record<string, string> = {
//     admin: "bg-purple-100 text-purple-700",
//     actuary: "bg-blue-100 text-blue-700",
//     inspector: "bg-green-100 text-green-700",
//     legal: "bg-orange-100 text-orange-700",
//     "hse officer": "bg-yellow-100 text-yellow-700",
//     "compliance officer": "bg-pink-100 text-pink-700",
//   };
//   return colors[role.toLowerCase()] || "bg-gray-100 text-gray-700";
// };

export const formatProfileDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const STORAGE_KEY = "compliance-data";

export const REGIONS = [
  "Lagos",
  "Abuja",
  "Kano",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
  "Kaduna",
];

export const DUMMY_DATA: ComplianceEntry[] = [
  {
    id: "1",
    region: "Lagos",
    branch: "Ikeja",
    contributionCollected: 15000000,
    target: 20000000,
    achievement: 75.0,
    employersRegistered: 450,
    employees: 5600,
    certificateFees: 7500000,
    period: "June 2025",
  },
  {
    id: "2",
    region: "Abuja",
    branch: "Central",
    contributionCollected: 12000000,
    target: 15000000,
    achievement: 80.0,
    employersRegistered: 380,
    employees: 4800,
    certificateFees: 5000000,
    period: "June 2025",
  },
  {
    id: "3",
    region: "Kano",
    branch: "Kano Central",
    contributionCollected: 8500000,
    target: 10000000,
    achievement: 85.0,
    employersRegistered: 280,
    employees: 3500,
    certificateFees: 30000000,
    period: "June 2025",
  },
  {
    id: "4",
    region: "Port Harcourt",
    branch: "GRA",
    contributionCollected: 11000000,
    target: 13000000,
    achievement: 84.6,
    employersRegistered: 320,
    employees: 4200,
    certificateFees: 6000000,
    period: "June 2025",
  },
  {
    id: "5",
    region: "Ibadan",
    branch: "Bodija",
    contributionCollected: 7500000,
    target: 9000000,
    achievement: 83.3,
    employersRegistered: 250,
    employees: 3200,
    certificateFees: 2500000,
    period: "June 2025",
  },
];

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₦${(amount / 1000000).toFixed(2)}M`;
};

// Calculate dashboard metrics
export const calculateMetrics = (
  entries: ComplianceEntry[]
): DashboardMetrics => {
  const totalActualContributions = entries.reduce(
    (sum, e) => sum + e.contributionCollected,
    0
  );
  const contributionsTarget = entries.reduce((sum, e) => sum + e.target, 0);
  const performanceRate =
    contributionsTarget > 0
      ? (totalActualContributions / contributionsTarget) * 100
      : 0;
  const totalEmployers = entries.reduce(
    (sum, e) => sum + e.employersRegistered,
    0
  );
  const totalEmployees = entries.reduce((sum, e) => sum + e.employees, 0);

  return {
    totalActualContributions,
    contributionsTarget,
    performanceRate,
    totalEmployers,
    totalEmployees,
  };
};

// Storage operations
export const loadFromStorage = async (): Promise<ComplianceEntry[]> => {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result?.value) {
      return JSON.parse(result.value);
    }
    return DUMMY_DATA;
  } catch (error) {
    console.log("No existing data found, using dummy data");
    return DUMMY_DATA;
  }
};

export const saveToStorage = async (
  entries: ComplianceEntry[]
): Promise<void> => {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to save data:", error);
  }
};

// Validation functions
export const validateExcelRow = (row: any, index: number): string | null => {
  if (
    !row.Region ||
    !row.Branch ||
    !row["Contribution Collected"] ||
    !row.Target ||
    !row["Employers Registered"] ||
    !row.Employees ||
    !row.Period
  ) {
    return `Row ${index + 2}: Missing required fields`;
  }
  return null;
};

export const parseExcelRow = (row: any, index: number): ComplianceEntry => {
  const achievement =
    row.Target > 0 ? (row["Contribution Collected"] / row.Target) * 100 : 0;

  return {
    id: `${Date.now()}-${index}`,
    region: row.Region,
    branch: row.Branch,
    contributionCollected: Number(row["Contribution Collected"]),
    target: Number(row.Target),
    achievement,
    employersRegistered: Number(row["Employers Registered"]),
    employees: Number(row.Employees),
    certificateFees: Number(row["Certificate Fees"] || 0),
    period: row.Period,
  };
};

// Search/Filter functions
export const filterEntries = (
  entries: ComplianceEntry[],
  searchTerm: string
): ComplianceEntry[] => {
  return entries.filter(
    (entry) =>
      entry.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Calculate achievement
export const calculateAchievement = (
  collected: number,
  target: number
): number => {
  return target > 0 ? (collected / target) * 100 : 0;
};
