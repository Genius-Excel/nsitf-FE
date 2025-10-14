import { Role, User } from "../types";

export const ROLES: Role[] = [
  { id: 'Admin', label: 'Admin', description: 'Full system access and user management' },
  { id: 'Actuary', label: 'Actuary', description: 'Access to compliance, claims, and reports' },
  { id: 'Inspector', label: 'Inspector', description: 'Inspection scheduling and reporting' },
  { id: 'Legal', label: 'Legal', description: 'Legal cases and demand notices' },
  { id: 'HSE Officer', label: 'HSE Officer', description: 'Health, Safety & Environment records' },
  { id: 'Compliance Officer', label: 'Compliance Officer', description: 'Contribution tracking and compliance' },
  { id: 'Economy Officer', label: 'Economy Officer', description: 'Informal sector data management' },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Adewale Johnson', email: 'adewale@nsitf.gov.ng', role: 'Admin', status: 'Active', date_added: '2024-01-15' },
  { id: '2', name: 'Chioma Okonkwo', email: 'chioma.o@nsitf.gov.ng', role: 'Actuary', status: 'Active', date_added: '2024-02-10' },
  { id: '3', name: 'Ibrahim Musa', email: 'ibrahim.m@nsitf.gov.ng', role: 'Inspector', status: 'Active', date_added: '2024-03-05' },
  { id: '4', name: 'Ngozi Eze', email: 'ngozi.e@nsitf.gov.ng', role: 'Legal', status: 'Active', date_added: '2024-03-20' },
  { id: '5', name: 'Olumide Balogun', email: 'olumide.b@nsitf.gov.ng', role: 'HSE Officer', status: 'Active', date_added: '2024-04-12' },
  { id: '6', name: 'Fatima Abdullahi', email: 'fatima.a@nsitf.gov.ng', role: 'Compliance Officer', status: 'Inactive', date_added: '2024-05-08' },
];