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
}
