export interface UserInfo {
  id: number;
  employeeId: number;
  phone?: string;
  address?: string;
  dob?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
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
  fullName: string;
  email: string;
  contactNumber: string;
  cnic: string;
  dob: string;
  address: string;

  // Work Information
  employeeId: string;
  department: string;
  position: string;
  reportingManager: string;
  startDate: string;
  team: string;
  employmentType: string;
  salary: string | number;
  probationEndDate: string;

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
  // Personal Information
  fullName: "",
  email: "",
  contactNumber: "",
  cnic: "",
  dob: "",
  address: "",

  // Work Information
  employeeId: "",
  department: "",
  position: "",
  reportingManager: "",
  startDate: "",
  team: "",
  employmentType: "",
  salary: "",
  probationEndDate: "",

  // Bank Information
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  branchCode: "",
  branchAddress: "",

  // Emergency Contact
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",

  // Additional Information
  notes: "",
};

export interface InviteEmployeeBody {
  fullName: string;
  email: string;
  role: string;
  cnic: string;
  contactNumber: string;
  address: string;
  dob: string;
  startDate: string;
  department: string;
  reportingManager: string;
  probationEndDate: string;
  employmentStatus: string;
  salary: number;
  designation: string;
  team: string;
}

export interface InviteEmployeeResponse {
  message: string;
  userId: number;
  resetToken: string;
}
