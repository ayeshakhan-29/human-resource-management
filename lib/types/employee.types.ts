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
  status: "active" | "inactive" | "suspended";
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

export interface EmployeeFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  cnic: string;
  zipCode: string;

  // Work Information
  employeeId: string;
  department: string;
  position: string;
  manager: string;
  startDate: string;
  employmentType: string;
  workLocation: string;
  salary: string;

  // Bank Information
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchCode: string;
  branchAddress: string;
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;

  // Additional Information
  notes: string;
}

export const initialEmployeeFormData: EmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  employeeId: "",
  department: "",
  position: "",
  manager: "",
  startDate: "",
  employmentType: "",
  workLocation: "",
  salary: "",
  cnic: "",
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  branchCode: "",
  branchAddress: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  notes: "",
};
