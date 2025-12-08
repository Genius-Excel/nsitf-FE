export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  date_added: string;
}

export interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  department: string;
  organizational_level: string;
  region_id: string;
  branch_id: string;
}

export interface Role {
  id: string;
  label: string;
  description: string;
}