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

  const url = `${API_BASE_URL}/auth/invite-employee`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(employeeData),
    });

    const responseText = await response.text();

    let errorData;
    try {
      errorData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      errorData = { message: "Invalid JSON response from server" };
    }

    if (!response.ok) {
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(
          (err: any) =>
            `${err.field ? `${err.field}: ` : ""}${
              err.message || "Validation error"
            }`
        );
        const errorMessage = errorMessages.join("\n");
        throw new Error(errorMessage);
      }

      const errorMessage =
        errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return errorData as InviteEmployeeResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to invite employee: ${error.message}`);
    }
    throw new Error("An unknown error occurred while inviting employee");
  }
};
