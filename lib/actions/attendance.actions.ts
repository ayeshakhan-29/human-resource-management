import {
  AttendanceData,
  ClockInResponse,
  ClockOutResponse,
  AllAttendanceResponse,
  WeeklyAttendanceResponse,
} from "@/lib/types/attendance.types";
import { getAuthToken } from "../auth/token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api/";

// Helper function to ensure proper URL construction
const getApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${baseUrl}${endpoint}`;
};

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
const handleApiError = (
  error: unknown,
  defaultMessage: string
): { error: string; status?: number } => {
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

    const response = await fetch(getApiUrl('attendance/clock-in'), {
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

export async function clockOutAction(
  token: string | null,
  checkoutData?: {
    taskId: number;
    taskStatus: "planning" | "in-progress" | "testing" | "blocked" | "completed";
    workNote?: string;
    deliverableLink?: string;
    deliverables?: File[];
  }
): Promise<{
  data?: ClockOutResponse;
  error?: string;
  status?: number;
}> {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    // If there are files, use FormData, otherwise use JSON
    const files = checkoutData?.deliverables ?? [];
    const hasFiles = files.length > 0;
    const formData = new FormData();
    
    if (hasFiles) {
      if (!checkoutData) {
        throw new Error("Missing checkout data for file upload");
      }
      formData.append("taskId", checkoutData.taskId.toString());
      formData.append("taskStatus", checkoutData.taskStatus);
      if (checkoutData.workNote) formData.append("workNote", checkoutData.workNote);
      if (checkoutData.deliverableLink) formData.append("deliverableLink", checkoutData.deliverableLink);
      files.forEach((file) => {
        formData.append("deliverables", file);
      });
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    if (!hasFiles) {
      headers["Content-Type"] = "application/json";
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(getApiUrl('attendance/clock-out'), {
      method: "POST",
      headers,
      body: hasFiles ? formData : JSON.stringify(checkoutData || {}),
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

export async function getActiveTasksForCheckout(token?: string): Promise<{
  data?: { id: number; title: string; status: string; priority: string; project?: { id: number; name: string } }[];
  error?: string;
  status?: number;
}> {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(getApiUrl('attendance/active-tasks'), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Failed to fetch active tasks",
        response: errorData,
      };
    }

    const data = await response.json();
    return { data: data.data || [] };
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(
      error,
      "Failed to fetch active tasks. Please try again."
    );
    return { error: errorMessage, status };
  }
}

export async function getAllAttendance(token?: string): Promise<{
  data?: AllAttendanceResponse;
  error?: string;
  status?: number;
}> {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      getApiUrl('attendance/today-all-employees'),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || "Failed to fetch all attendance records"
      ) as ApiError;
      error.status = response.status;
      error.response = errorData;
      throw error;
    }

    const data: AllAttendanceResponse = await response.json();
    return { data };
  } catch (error) {
    return handleApiError(
      error,
      "An error occurred while fetching attendance records"
    );
  }
}

export async function getWeeklyAttendance(token?: string): Promise<{
  data?: WeeklyAttendanceResponse;
  error?: string;
  status?: number;
}> {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(getApiUrl('attendance/weekly'), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || "Failed to fetch weekly attendance",
        response: errorData,
      };
    }

    const data: WeeklyAttendanceResponse = await response.json();
    return { data };
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(
      error,
      "Failed to fetch weekly attendance. Please try again."
    );
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

    const response = await fetch(getApiUrl('attendance/today'), {
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
      const error = new Error(
        errorData.message || "Failed to fetch today's attendance"
      ) as ApiError;
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
