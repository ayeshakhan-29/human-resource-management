export interface UserInfo {
  id: number;
  employeeId: number;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

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
  userInfo: UserInfo | null;
}

export interface EmployeesResponse {
  success: boolean;
  data: Employee[];
}
