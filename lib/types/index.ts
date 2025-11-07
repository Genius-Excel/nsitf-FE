export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  date_added?: string;
  first_name?: string | undefined;
  last_name?: string | undefined;
  phone_number?: string;
  department?: string;
  region?: string;
  created_at?: string;
  updated_at?: string;
  account_status?: string;
}

export interface Claim {
  id: string;
  claimId: string;
  employer: string;
  claimant: string;
  type:
    | "Medical Refund"
    | "Disability"
    | "Death Claim"
    | "Loss of Productivity";
  amountRequested: number;
  amountPaid: number;

  status: "Paid" | "Pending" | "Under Review" | "Rejected";
  dateProcessed: string;
  datePaid: string;
  sector: string;
  class: string;
  date: string;
}

export interface InspectionRecord {
  id: string;
  branch: string;
  inspectionsConducted: number;
  debtEstablished: number;
  debtRecovered: number;
  performanceRate: number; // percentage
  demandNotice: number;
  period: string; // e.g., "Q1 2024", "Jan 2024"
}

export interface InspectionStatCard {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  icon: React.ReactNode;
  bgColor: string;
}

export interface UpcomingInspection {
  id: number;
  employer: string;
  location: string;
  date: string;
  inspector: string;
  status: "Scheduled" | "Pending";
}

export interface MonthlyChartData {
  month: string;
  debtsEstablished: number;
  debtsRecovered: number;
}

export interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  branch: string;
}

export interface Role {
  id: string;
  label: string;
  description: string;
}
export interface ChartDataPoint {
  month: string;
  processed: number;
  target: number;
}


export interface HSERecord {
  id: string;
  region: string;
  branch: string;
  totalActualOSH: number;
  targetOSH: number;
  performanceRate: number; // percentage
  oshEnlightenment: number;
  oshInspectionAudit: number;
  accidentInvestigation: number;
  activitiesPeriod: string; // e.g., "Q3 2024", "Jan 2024"
}

export interface HSEStatCard {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  icon: React.ReactNode;
  bgColor: string;
}

export interface HSEActivity {
  id: string;
  type: "Letter Issued" | "OSH Awareness" | "Safety Audit" | "Accident Investigation";
  organization: string;
  date: string;
  status: "Completed" | "Under Investigation" | "Follow-up Required";
  details?: string;
  recommendations?: string;
  icon: string;
}

export interface HSEFormData {
  type: string;
  organization: string;
  date: string;
  status: string;
  details: string;
  recommendations: string;
}

export interface StatCard {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  change: string;
}

export interface ResetEmailFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface LegalCase {
  id: string;
  title: string;
  description: string;
  created: string;
  filed: string;
  amountClaimed: string;
  nextHearing: string;
  status: "pending" | "closed" | "assigned-obtained";
  outcome?: string;
}

export interface DemandNotice {
  id: string;
  title: string;
  company: string;
  amount: string;
  date: string;
}

export interface DemandNoticeFormProps {
  onClose: () => void;
  onSubmit: (data: DemandNoticeData) => void;
}

export interface DemandNoticeData {
  noticeId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  amountDue: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  attachments: File[];
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  alternative_number: string | null;
  email_verified: boolean;
  role: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  permissions: string[];
}

export interface EditProfileFormData {
  email: string;
}

// ============= CORE TYPES =============

export interface ComplianceEntry {
  id: string;
  region: string;
  branch: string;
  contributionCollected: number;
  target: number;
  achievement: number;
  employersRegistered: number;
  employees: number;
  registrationFees: number;
  certificateFees: number;
  period: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  totalActualContributions: number;
  contributionsTarget: number;
  performanceRate: number;
  totalEmployers: number;
  totalEmployees: number;
  // totalCertificateFees: number;
}

export interface UploadError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ParseProgress {
  stage: "idle" | "reading" | "parsing" | "validating" | "complete" | "error";
  percentage: number;
  message: string;
}

export interface Notification {
  type: "success" | "error" | "info" | "warning";
  message: string;
  id: string;
}

// ============= SORTING & FILTERING =============

export type SortField = 
  | "region" 
  | "branch" 
  | "contributionCollected" 
  | "target" 
  | "performanceRate" 
  | "employersRegistered" 
  | "employees"
  | "registrationFees" 
  | "certificateFees" 
  | "period";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  regions: string[];
  achievementMin: number;
  achievementMax: number;
  periodSearch: string;
  branchSearch: string;
}

// ============= STORAGE =============

export interface StorageAdapter {
  get: (key: string) => Promise<{ value: string } | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export interface FormData {
  region: string;
  branch: string;
  contributionCollected: number;
  target: number;
  employersRegistered: number;
  employees: number;
  period: string;
}

declare global {
  export interface Window {
    storage: {
      get: (
        key: string,
        shared?: boolean
      ) => Promise<{ key: string; value: string; shared: boolean } | null>;
      set: (
        key: string,
        value: string,
        shared?: boolean
      ) => Promise<{ key: string; value: string; shared: boolean } | null>;
      delete: (
        key: string,
        shared?: boolean
      ) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list: (
        prefix?: string,
        shared?: boolean
      ) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

