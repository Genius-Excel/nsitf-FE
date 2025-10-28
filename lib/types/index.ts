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
  amount: number;
  status: "Paid" | "Pending" | "Under Review" | "Rejected";
  date: string;
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

export interface HSEActivity {
  id: string;
  type:
    | "OSH Awareness"
    | "Safety Audit"
    | "Accident Investigation"
    | "Letter Issued";
  organization: string;
  date: string;
  status: "Completed" | "Under Investigation" | "Follow-up Required";
  details?: string;
  recommendations?: string;
  icon: React.ReactNode;
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
  value: number;
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
