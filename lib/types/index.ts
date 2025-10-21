export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  date_added: string;
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