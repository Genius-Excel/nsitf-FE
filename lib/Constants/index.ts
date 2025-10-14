import { Role, User } from "../types";
import { Claim } from "../types";
import { ChartDataPoint } from "../types";

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
    amount: 250000,
    status: "Paid",
    date: "2025-09-15",
  },
  {
    id: "2",
    claimId: "CLM-002",
    employer: "XYZ Construction",
    claimant: "Mary Adebayo",
    type: "Disability",
    amount: 600000,
    status: "Pending",
    date: "2025-09-20",
  },
  {
    id: "3",
    claimId: "CLM-003",
    employer: "Tech Solutions Inc",
    claimant: "Ahmed Bello",
    type: "Death Claim",
    amount: 1000000,
    status: "Paid",
    date: "2025-09-22",
  },
  {
    id: "4",
    claimId: "CLM-004",
    employer: "Green Energy Ltd",
    claimant: "Grace Nwankwo",
    type: "Medical Refund",
    amount: 180000,
    status: "Under Review",
    date: "2025-09-25",
  },
  {
    id: "5",
    claimId: "CLM-005",
    employer: "Logistics Hub",
    claimant: "Ibrahim Hassan",
    type: "Loss of Productivity",
    amount: 350000,
    status: "Rejected",
    date: "2025-09-28",
  },
  {
    id: "6",
    claimId: "CLM-006",
    employer: "Food Processing Co",
    claimant: "Funmi Oladipo",
    type: "Medical Refund",
    amount: 220000,
    status: "Paid",
    date: "2025-10-01",
  },
  {
    id: "7",
    claimId: "CLM-007",
    employer: "Retail Stores Ltd",
    claimant: "Chidi Okonkwo",
    type: "Disability",
    amount: 450000,
    status: "Pending",
    date: "2025-10-02",
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
