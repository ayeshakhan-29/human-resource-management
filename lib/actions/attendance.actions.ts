"use server";

import {
  AttendanceData,
  ClockInResponse,
  ClockOutResponse,
} from "@/lib/types/attendance.types";
import { getAuthToken } from "../auth/token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api";

// Helper to handle API errors
const handleApiError = (error: any, defaultMessage: string) => {
  console.error("API Error:", {
    message: error.message,
    status: error.status,
    response: error.response,
    stack: error.stack,
  });

  return {
    error: error.response?.message || error.message || defaultMessage,
    status: error.status,
  };
};

export async function clockInAction(token: string): Promise<{
  data?: ClockInResponse;
  error?: string;
  status?: number;
}> {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}attendance/clock-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Failed to clock in",
        response: errorData,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    const { error: errorMessage, status } = handleApiError(
      error,
      "Failed to clock in. Please try again."
    );

    // If unauthorized, clear auth data
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return { error: errorMessage, status };
  }
}

export async function clockOutAction(token: string | null): Promise<{
  data?: ClockOutResponse;
  error?: string;
  status?: number;
}> {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/attendance/clock-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Failed to clock out",
        response: errorData,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    const { error: errorMessage, status } = handleApiError(
      error,
      "Failed to clock out. Please try again."
    );

    // If unauthorized, clear auth data
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return { error: errorMessage, status };
  }
}

// Add more attendance-related actions here as needed
// export async function getAttendanceRecords() {...}

export async function getTodaysAttendance(): Promise<{
  data?: AttendanceData;
  error?: string;
  status?: number;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/attendance/today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Failed to fetch attendance",
        response: errorData,
      };
    }

    const data = await response.json();
    console.log("Today's attendance:", data);
    return { data };
  } catch (error: any) {
    const { error: errorMessage, status } = handleApiError(
      error,
      "Failed to fetch today's attendance."
    );

    // If unauthorized, clear auth data
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return { error: errorMessage, status };
  }
}
