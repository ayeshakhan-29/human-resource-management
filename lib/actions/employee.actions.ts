import { getAuthToken } from "@/lib/auth/token";
import {
  EmployeesResponse,
  InviteEmployeeBody,
  InviteEmployeeResponse,
} from "@/lib/types/employee.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api";

export const getAllEmployees = async (): Promise<EmployeesResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/employee/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch employees");
  }

  return response.json();
};

/**
 * Updates an employee's status
 * @param employeeId - ID of the employee to update
 * @param status - New status to set
 * @returns Promise with the updated employee or error
 */
interface UpdateStatusResponse {
  success: boolean;
  data: {
    id: number;
    status: "active" | "inactive" | "suspended";
    updatedAt: string;
  };
}

export const updateEmployeeStatus = async (
  employeeId: number,
  status: "active" | "inactive" | "suspended"
): Promise<UpdateStatusResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/employee/${employeeId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update employee status");
  }

  return response.json();
};

export const inviteEmployee = async (
  employeeData: InviteEmployeeBody
): Promise<InviteEmployeeResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/invite-employee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(employeeData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to invite employee");
  }

  return response.json();
};
