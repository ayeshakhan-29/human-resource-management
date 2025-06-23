export interface Employee {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userInfo: any | null;
}

export interface EmployeesResponse {
  success: boolean;
  data: Employee[];
}
