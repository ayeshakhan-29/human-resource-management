import { LeaveRequest, LeaveType, LeaveResponse } from "@/lib/types/leave.types";
import { getAuthToken } from "../auth/token";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api/";

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
}

const handleApiError = (error: unknown, defaultMessage: string) => {
    const apiError = error as ApiError;
    return {
        error: apiError.response?.message || apiError.message || defaultMessage,
        status: apiError.status,
    };
};

// --- Leave Types (Admin Config) ---

export async function getAllLeaveTypes(token?: string): Promise<{ data?: LeaveType[]; error?: string }> {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl('leaves/types'), {
            headers: { Authorization: `Bearer ${authToken}` },
            cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to fetch leave types");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to fetch leave types");
    }
}

export async function createLeaveTypeAction(data: Partial<LeaveType>, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl('leaves/types'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to create leave type");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to create leave type");
    }
}

export async function updateLeaveTypeAction(id: number, data: Partial<LeaveType>, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl(`leaves/types/${id}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to update leave type");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to update leave type");
    }
}

// --- Employee Actions ---

export async function applyLeaveAction(data: Partial<LeaveRequest>, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl('leaves/apply'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to submit leave application");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to submit leave application");
    }
}

export async function getMyLeavesAction(token?: string) {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl('leaves/my-leaves'), {
            headers: { Authorization: `Bearer ${authToken}` },
            cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to fetch my leaves");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to fetch my leaves");
    }
}

// --- Admin Actions ---

export async function getTodaysLeavesAction(params?: Record<string, string | number | boolean | undefined>, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString();
        const response = await fetch(getApiUrl(`leaves/admin/today?${query}`), {
            headers: { Authorization: `Bearer ${authToken}` },
            cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to fetch today's leaves");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to fetch today's leaves");
    }
}

export async function getAllLeavesAdminAction(params?: Record<string, string | number | boolean | undefined>, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString();
        const response = await fetch(getApiUrl(`leaves/admin/all?${query}`), {
            headers: { Authorization: `Bearer ${authToken}` },
            cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to fetch all leaves");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to fetch all leaves");
    }
}

export async function approveLeaveAction(id: number, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl(`leaves/admin/${id}/approve`), {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to approve leave");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to approve leave");
    }
}

export async function rejectLeaveAction(id: number, rejectionReason: string, token?: string) {
    try {
        const authToken = token || getAuthToken();
        const response = await fetch(getApiUrl(`leaves/admin/${id}/reject`), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({ rejectionReason }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to reject leave");
        return { data: result.data };
    } catch (error) {
        return handleApiError(error, "Failed to reject leave");
    }
}
