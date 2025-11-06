import {
  Role,
  User,
  HSEActivity,
  ChartDataPoint,
  Claim,
  LegalCase,
  DemandNotice,
  ComplianceEntry
} from "@/lib/types";


export const ROLES: Role[] = [
  {
    id: "Admin",
    label: "Admin",
    description: "Full system access and user management",
  },
  {
    id: "Actuary",
    label: "Actuary",
    description: "Access to compliance, claims, and reports",
  },
  {
    id: "Inspector",
    label: "Inspector",
    description: "Inspection scheduling and reporting",
  },
  {
    id: "Legal",
    label: "Legal",
    description: "Legal cases and demand notices",
  },
  {
    id: "HSE Officer",
    label: "HSE Officer",
    description: "Health, Safety & Environment records",
  },
  {
    id: "Compliance Officer",
    label: "Compliance Officer",
    description: "Contribution tracking and compliance",
  },
  {
    id: "Economy Officer",
    label: "Economy Officer",
    description: "Informal sector data management",
  },
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Adewale Johnson",
    email: "adewale@nsitf.gov.ng",
    role: "Admin",
    status: "Active",
    date_added: "2024-01-15",
  },
  {
    id: "2",
    name: "Chioma Okonkwo",
    email: "chioma.o@nsitf.gov.ng",
    role: "Actuary",
    status: "Active",
    date_added: "2024-02-10",
  },
  {
    id: "3",
    name: "Ibrahim Musa",
    email: "ibrahim.m@nsitf.gov.ng",
    role: "Inspector",
    status: "Active",
    date_added: "2024-03-05",
  },
  {
    id: "4",
    name: "Ngozi Eze",
    email: "ngozi.e@nsitf.gov.ng",
    role: "Legal",
    status: "Active",
    date_added: "2024-03-20",
  },
  {
    id: "5",
    name: "Olumide Balogun",
    email: "olumide.b@nsitf.gov.ng",
    role: "HSE Officer",
    status: "Active",
    date_added: "2024-04-12",
  },
  {
    id: "6",
    name: "Fatima Abdullahi",
    email: "fatima.a@nsitf.gov.ng",
    role: "Compliance Officer",
    status: "Inactive",
    date_added: "2024-05-08",
  },
];

export const mockClaims: Claim[] = [
  {
    id: "1",
    claimId: "CLM-001",
    employer: "ABC Manufacturing Ltd",
    claimant: "John Chioke",
    type: "Medical Refund",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
  {
    id: "2",
    claimId: "CLM-002",
    employer: "XYZ Construction",
    claimant: "Mary Adebayo",
    type: "Disability",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
  {
    id: "3",
    claimId: "CLM-003",
    employer: "Tech Solutions Inc",
    claimant: "Ahmed Bello",
    type: "Death Claim",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
  {
    id: "4",
    claimId: "CLM-004",
    employer: "Green Energy Ltd",
    claimant: "Grace Nwankwo",
    type: "Medical Refund",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
  {
    id: "5",
    claimId: "CLM-005",
    employer: "Logistics Hub",
    claimant: "Ibrahim Hassan",
    type: "Loss of Productivity",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
  {
    id: "6",
    claimId: "CLM-006",
    employer: "Food Processing Co",
    claimant: "Funmi Oladipo",
    type: "Medical Refund",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
  {
    id: "7",
    claimId: "CLM-007",
    employer: "Retail Stores Ltd",
    claimant: "Chidi Okonkwo",
    type: "Disability",
    amountRequested: 250000,
    amountPaid: 200000,
    status: "Paid",
    dateProcessed: "2024-01-15",
    datePaid: "2024-01-20",
    sector: "Manufacturing",
    class: "Class A",
    date: "Q1 2024",
  },
];

export const chartData: ChartDataPoint[] = [
  { month: "Jan", processed: 45, target: 50 },
  { month: "Feb", processed: 50, target: 50 },
  { month: "Mar", processed: 45, target: 50 },
  { month: "Apr", processed: 60, target: 50 },
  { month: "May", processed: 55, target: 50 },
  { month: "Jun", processed: 55, target: 50 },
  { month: "Jul", processed: 62, target: 60 },
  { month: "Aug", processed: 55, target: 50 },
  { month: "Sep", processed: 60, target: 50 },
];

export const mockHSEActivities: HSEActivity[] = [
  {
    id: "1",
    type: "OSH Awareness",
    organization: "ABC Manufacturing Ltd",
    date: "2025-09-15",
    status: "Completed",
    details:
      "Comprehensive occupational safety and health awareness training completed. All employees attended the session.",
    icon: "🛡️",
  },
  {
    id: "2",
    type: "Safety Audit",
    organization: "XYZ Construction",
    date: "2025-09-20",
    status: "Completed",
    details:
      "Comprehensive safety audit revealed 3 minor violations. Corrective action plan submitted and approved.",
    icon: "✓",
  },
  {
    id: "3",
    type: "Accident Investigation",
    organization: "Tech Solutions Inc",
    date: "2025-09-22",
    status: "Under Investigation",
    details:
      "Workplace accident reported on site. Investigation in progress. Preliminary findings suggest equipment malfunction.",
    icon: "⚠️",
  },
  {
    id: "4",
    type: "Letter Issued",
    organization: "Green Energy Ltd",
    date: "2025-09-25",
    status: "Follow-up Required",
    details:
      "Safety compliance letter issued. Organization has 30 days to submit corrective measures plan.",
    icon: "📋",
  },
];

export const cases: LegalCase[] = [
  {
    id: "LEG-001",
    title: "Delta Manufacturing Ltd",
    description: "Breach of contract and cancellation",
    created: "On 2025-09-05",
    filed: "On 2021-04-05",
    amountClaimed: "₦2,340,000",
    nextHearing: "2025-10-20",
    status: "pending",
  },
  {
    id: "LEG-002",
    title: "Sunrise Textiles",
    description: "Intellectual Compensation Dispute",
    created: "On 2025-02-02",
    filed: "On 2025-08-02",
    amountClaimed: "₦1,890,000",
    nextHearing: "",
    status: "closed",
    outcome: "Employer agreed to pay full amount in installments",
  },
  {
    id: "LEG-003",
    title: "Tech Park Solutions",
    description: "Labor Contract Issues",
    created: "On 2025-09-08",
    filed: "On 2025-08-22",
    amountClaimed: "₦2,340,000",
    nextHearing: "2025-11-05",
    status: "pending",
  },
  {
    id: "LEG-004",
    title: "Coastal Logistics",
    description: "Late Payment Penalties",
    created: "On 2025-02-08",
    filed: "On 2025-08-18",
    amountClaimed: "₦950,000",
    nextHearing: "",
    status: "assigned-obtained",
    outcome:
      "Court ruled in favor of 05/2017. Full payment received within 10 days.",
  },
];

export const demandNotices: DemandNotice[] = [
  {
    id: "DN 2025-079",
    title: "Green Manufacturing Co",
    company: "Green Manufacturing Co",
    amount: "₦1,290,500",
    date: "2025-09-29",
  },
  {
    id: "DN 2025-071",
    title: "White Constructions Ltd",
    company: "White Constructions Ltd",
    amount: "₦2,109,800",
    date: "2025-09-10",
  },
  {
    id: "DN 2025-072",
    title: "Metro Retail Stores",
    company: "Metro Retail Stores",
    amount: "₦850,000",
    date: "2025-10-01",
  },
];

export const STORAGE_KEY = "compliance_entries";
export const REGIONS_KEY = "compliance_regions";

export const DEFAULT_REGIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Enugu",
];

export const DUMMY_DATA: ComplianceEntry[] = [
  {
    id: "1",
    region: "Lagos",
    branch: "Ikeja",
    contributionCollected: 15000000,
    target: 20000000,
    achievement: 75,
    employersRegistered: 450,
    employees: 5600,
    certificateFees: 5000000,
    period: "June 2025",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    region: "Abuja",
    branch: "Wuse",
    contributionCollected: 12000000,
    target: 15000000,
    achievement: 80,
    employersRegistered: 380,
    employees: 4200,
    certificateFees: 4200000,
    period: "June 2025",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    region: "Port Harcourt",
    branch: "GRA",
    contributionCollected: 8500000,
    target: 10000000,
    achievement: 85,
    employersRegistered: 220,
    employees: 2800,
    certificateFees: 2500000,
    period: "June 2025",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============= EXCEL COLUMN MAPPINGS =============

export const REQUIRED_COLUMNS = [
  "Branch",
  "Contribution Collected",
  "Target",
  "Employers Registered",
  "Employees",
  "Certificate Fees",
  "Period",
];

export const COLUMN_TYPES: Record<string, string> = {
  Branch: "string",
  "Contribution Collected": "number",
  Target: "number",
  "Employers Registered": "number",
  Employees: "number",
  "Certificate Fees": "number",
  Period: "string",
};

// ============= ACHIEVEMENT THRESHOLDS =============

export const ACHIEVEMENT_LEVELS = {
  EXCELLENT: 90,
  GOOD: 70,
  AVERAGE: 50,
  POOR: 0,
};

// ============= KEYBOARD SHORTCUTS =============

export const KEYBOARD_SHORTCUTS = {
  ADD_REGION: "ctrl+n",
  EXPORT: "ctrl+e",
  SEARCH: "ctrl+f",
  CLOSE_MODAL: "escape",
};