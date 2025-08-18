import { getAuthToken } from "@/lib/auth/token";
import {
  EmployeesResponse,
  InviteEmployeeBody,
  InviteEmployeeResponse,
} from "@/lib/types/employee.types";
import { BankInfo, BankInfoResponse } from "@/lib/types/user.types";
import { UpdateBankDetailsResponse } from "@/lib/types/bank.types";
import { EmployeeInfoResponse } from "@/lib/types/employee.types";

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

  const data = await response.json();
  return data;
};

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

  const response = await fetch(`${API_BASE_URL}employee/${employeeId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update employee status");
  }

  return response.json();
};

export const getEmployeeBankDetails = async (employeeId: number) => {
  const token = await getAuthToken();
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!API_BASE_URL) {
    throw new Error("Backend URL is not configured");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}employee/${employeeId}/get-bank-details`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch bank details");
    }

    const data = await response.json();

    // Transform the API response to match our form structure
    if (data.success && data.data) {
      return {
        ...data.data,
        // Map IBAN to iban for the form
        iban: data.data.IBAN || "",
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching bank details:", error);
    throw error;
  }
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

export const EmployeeBankInfo = async (
  employeeId: number,
  bankInfo: BankInfo
): Promise<BankInfoResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}employee/${employeeId}/add-bank-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bankInfo),
      }
    );

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Bank info validation error:", responseData);
      throw new Error(
        responseData.message || "Failed to save bank information"
      );
    }

    return responseData;
  } catch (error: any) {
    console.error("Error in EmployeeBankInfo:", error);
    throw new Error(error.message || "Failed to save bank information");
  }
};

export const updateEmployeeBankDetails = async (
  employeeId: number,
  bankDetails: Partial<BankInfo>
): Promise<UpdateBankDetailsResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}employee/${employeeId}/update-bank-details`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bankDetails),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update bank details");
  }

  return response.json();
};

export const getEmployeeInfoById = async (
  employeeId: number
): Promise<EmployeeInfoResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/employee/${employeeId}/user-info`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to fetch employee information"
    );
  }

  return response.json();
};
