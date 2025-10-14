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