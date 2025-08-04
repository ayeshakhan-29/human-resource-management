export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface InviteEmployeePayload {
  fullName: string;
  email: string;
  role: string;
}

export interface InviteEmployeeResponse {
  message: string;
  userId: number;
  resetToken: string;
}

export interface SetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
  user?: User;
}
