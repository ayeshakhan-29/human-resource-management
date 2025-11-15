import { getAuthToken } from "@/lib/auth/token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api";

// Helper function to ensure proper URL construction
const getApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${baseUrl}${endpoint}`;
};

export interface DeleteClientResponse {
  message: string;
}

export interface Client {
  id: number;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  userInfo: {
    contactNumber: string | null;
    address: string | null;
    companyName: string | null;
  } | null;
}

export interface UpdateClientData {
  fullName?: string;
  email?: string;
  status?: string;
  contactNumber?: string;
  companyName?: string;
  address?: string;
}

export interface UpdateClientResponse {
  message: string;
  client: Client;
}

export const getClientById = async (clientId: number): Promise<Client> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl(`clients/${clientId}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch client");
  }

  const data = await response.json();
  return data.client;
};

export const updateClient = async (
  clientId: number,
  updateData: UpdateClientData
): Promise<UpdateClientResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl(`clients/${clientId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update client");
  }

  return response.json();
};

export interface ChangePasswordResponse {
  message: string;
}

export const changeClientPassword = async (
  clientId: number,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl(`clients/${clientId}/password`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to change password");
  }

  return response.json();
};

export const deleteClient = async (clientId: number): Promise<DeleteClientResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl(`clients/${clientId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete client");
  }

  return response.json();
};