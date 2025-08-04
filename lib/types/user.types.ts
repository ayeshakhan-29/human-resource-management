export type OnboardingStep =
  | "invited"
  | "profile-completed"
  | "work-info-completed"
  | "bank-info-completed"
  | "active";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "employee" | "hr";
  onboardingStep: OnboardingStep;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  cnic?: string;
  dateOfBirth?: string;
}

export interface WorkInfo {
  employeeId?: string;
  department?: string;
  position?: string;
  manager?: string;
  joiningDate?: string;
  employmentType?: string;
  salary?: string;
}

export interface BankInfo {
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  branchCode?: string;
  branchAddress?: string;
}

export interface InviteUserRequest {
  fullName: string;
  email: string;
  role: "admin" | "employee" | "hr";
}
