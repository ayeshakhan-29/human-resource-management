import { getAuthToken } from "./auth/token";
import { toast } from "sonner";

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");

export interface ApiOptions extends RequestInit {
    params?: Record<string, string>;
}

interface ApiError {
    status: number;
    info: unknown;
    message: string;
}

declare global {
    interface Window {
        isRedirectingToLogin?: boolean;
    }
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...restOptions } = options;

    // Build URL with params if any
    let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    // Get token
    const token = getAuthToken();

    // Prepare headers
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...customHeaders,
    });

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(url, {
            ...restOptions,
            headers,
        });

        if (response.status === 401) {
            // Global 401 handling
            handleUnauthorized();
            const errorData = await response.json().catch(() => ({}));
            throw { status: 401, info: errorData, message: 'Unauthorized' } as ApiError;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, info: errorData, message: 'An error occurred' } as ApiError;
        }

        return await response.json();
    } catch (error: unknown) {
        const apiError = error as ApiError;
        if (apiError.status === 401) throw error;

        console.error('API Call Error:', error);
        throw error;
    }
}

function handleUnauthorized() {
    if (typeof window !== 'undefined') {
        // Prevent multiple toasts/redirects
        if (window.isRedirectingToLogin) return;
        window.isRedirectingToLogin = true;

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        toast.error('Session expired. Please login again.');

        // Slight delay to allow toast to be seen
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    }
}
