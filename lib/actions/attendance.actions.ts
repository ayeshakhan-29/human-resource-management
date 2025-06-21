"use server";

import {
  AttendanceData,
  ClockInResponse,
  ClockOutResponse,
} from "@/lib/types/attendance.types";
import { getAuthToken } from "../auth/token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api";

interface ApiError extends Error {
  status?: number;
  response?: {
    message?: string;
    [key: string]: unknown;
  };
  message: string;
  stack?: string;
}

// Helper to handle API errors
const handleApiError = (error: unknown, defaultMessage: string): { error: string; status?: number } => {
  const apiError = error as ApiError;
  
  console.error("API Error:", {
    message: apiError.message,
    status: apiError.status,
    response: apiError.response,
    stack: apiError.stack,
  });

  return {
    error: apiError.response?.message || apiError.message || defaultMessage,
    status: apiError.status,
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
  } catch (error) {
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
  } catch (error) {
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

export async function getTodaysAttendance(token?: string): Promise<{
  data?: AttendanceData;
  error?: string;
  status?: number;
}> {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/attendance/today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store", // Prevent caching to get fresh data
    });

    if (!response.ok) {
      // If 404, return empty data instead of error (no attendance record for today)
      if (response.status === 404) {
        return { data: undefined };
      }

      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || "Failed to fetch today's attendance") as ApiError;
      error.status = response.status;
      error.response = errorData;
      throw error;
    }

    const data = (await response.json()) as AttendanceData;

    // Ensure the response has the expected format
    if (!data || typeof data !== "object") {
      throw new Error("Invalid attendance data received from server");
    }

    return { data };
  } catch (error: unknown) {
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
