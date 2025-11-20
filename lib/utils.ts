import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { parse, format } from "date-fns";
import {
  ComplianceEntry,
  DashboardMetrics,
  HSERecord,
  SortConfig,
  FilterConfig,
} from "./types";
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Database } from "./database/types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// export const formatDate = (dateString: string): string => {
//   try {
//     const date = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date());
//     return format(date, "MMMM d, yyyy, h:mm a");
//   } catch (error) {
//     console.error("Error formatting date:", error);
//     return dateString; // Fallback to original string if parsing fails
//   }
// };

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
    registrationFees: 5500000,  // ← ADDED THIS (was missing)
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
    registrationFees: 4200000,  // ← ADDED THIS (was missing)
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
    registrationFees: 3000000,  // ← ADDED THIS (was missing)
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
    registrationFees: 3500000,  // ← ADDED THIS (was missing)
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
    registrationFees: 2800000,  // ← ADDED THIS (was missing)
    certificateFees: 2500000,
    period: "June 2025",
  },
];

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
    registrationFees: Number(row["Registration Fees"] || 0),
    certificateFees: Number(row["Certificate Fees"] || 0),
    period: row.Period,
  };
};

// Search/Filter functions
// export const filterEntries = (
//   entries: ComplianceEntry[],
//   searchTerm: string
// ): ComplianceEntry[] => {
//   return entries.filter(
//     (entry) =>
//       entry.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       entry.branch.toLowerCase().includes(searchTerm.toLowerCase())
//   );
// };

// Calculate achievement
// export const calculateAchievement = (
//   collected: number,
//   target: number
// ): number => {
//   return target > 0 ? (collected / target) * 100 : 0;
// };

// ============= FORMATTING =============

export const formatCurrency = (amount: number): string => {
  return `₦${(amount / 1000000).toFixed(2)}M`;
};

export const formatCurrencyFull = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// export const formatNumber = (num: number): string => {
//   return num.toLocaleString();
// };

// ============= SORTING =============

export const sortEntries = (
  entries: ComplianceEntry[],
  sortConfig: SortConfig | null
): ComplianceEntry[] => {
  if (!sortConfig) return entries;

  return [...entries].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === "asc" ? comparison : -comparison;
    }

    // Handle number comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

// ============= FILTERING =============

export const filterEntries = (
  entries: ComplianceEntry[],
  filterConfig: FilterConfig,
  searchTerm: string
): ComplianceEntry[] => {
  return entries.filter((entry) => {
    // Region filter
    if (
      filterConfig.regions.length > 0 &&
      !filterConfig.regions.includes(entry.region)
    ) {
      return false;
    }

    // Achievement range filter
    if (
      entry.achievement < filterConfig.achievementMin ||
      entry.achievement > filterConfig.achievementMax
    ) {
      return false;
    }

    // Period filter
    if (
      filterConfig.periodSearch &&
      !entry.period
        .toLowerCase()
        .includes(filterConfig.periodSearch.toLowerCase())
    ) {
      return false;
    }

    // Branch filter
    if (
      filterConfig.branchSearch &&
      !entry.branch
        .toLowerCase()
        .includes(filterConfig.branchSearch.toLowerCase())
    ) {
      return false;
    }

    // Global search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        entry.region.toLowerCase().includes(search) ||
        entry.branch.toLowerCase().includes(search) ||
        entry.period.toLowerCase().includes(search)
      );
    }

    return true;
  });
};

// ============= VALIDATION =============

export const validateEntry = (entry: Partial<ComplianceEntry>): string[] => {
  const errors: string[] = [];

  if (!entry.region?.trim()) {
    errors.push("Region is required");
  }

  if (!entry.target || entry.target <= 0) {
    errors.push("Target must be greater than 0");
  }

  if (entry.contributionCollected && entry.contributionCollected < 0) {
    errors.push("Contribution collected cannot be negative");
  }

  if (entry.employersRegistered && entry.employersRegistered < 0) {
    errors.push("Employers registered cannot be negative");
  }

  if (entry.employees && entry.employees < 0) {
    errors.push("Employees cannot be negative");
  }

  if (entry.certificateFees && entry.certificateFees < 0) {
    errors.push("Certificate fees cannot be negative");
  }

  return errors;
};

// ============= CALCULATIONS =============

export const calculateAchievement = (
  collected: number,
  target: number
): number => {
  return target > 0 ? (collected / target) * 100 : 0;
};

export const getAchievementColor = (achievement: number): string => {
  if (achievement >= 90) return "text-green-600 bg-green-50";
  if (achievement >= 70) return "text-yellow-600 bg-yellow-50";
  if (achievement >= 50) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
};

export const getAchievementTextColor = (achievement: number): string => {
  if (achievement >= 90) return "text-green-600";
  if (achievement >= 70) return "text-yellow-600";
  if (achievement >= 50) return "text-orange-600";
  return "text-red-600";
};

// ============= UNIQUE ID GENERATION =============

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============= DATE FORMATTING =============

export const formatDate = (date?: string | Date | null): string => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};
