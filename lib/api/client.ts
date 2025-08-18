// Client-side API client with token management

// User interface for the token response
interface UserToken {
  id: number;
  email: string;
  role: string;
  token: string;
  [key: string]: unknown;
}

// Response data type for token operations
interface TokenResponse {
  token: string | null;
  user: UserToken | null;
}

// Error response type
interface ApiError extends Error {
  status?: number;
  response?: unknown;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Ensure base URL ends with a single slash
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    // Remove any trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, "");

    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    if (typeof window !== 'undefined') {
      console.log("API Client initialized with base URL:", this.baseUrl);
    }
  }

  
  // Get token from localStorage (runs on client-side only)
  private getToken(): TokenResponse {
    if (typeof window === "undefined") {
      console.log("Running on server side, no access to localStorage");
      return { token: null, user: null };
    }

    try {
      // First try to get token directly from localStorage
      const token = localStorage.getItem("token");
      let user: UserToken | null = null;

      // If no token in root, try to get it from user object
      if (!token) {
        console.log("No token in root, checking user object...");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            user = JSON.parse(userStr);
            if (user?.token) {
              console.log("Found token in user object");
              return { token: user.token, user };
            }
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
        console.warn("No auth token found in localStorage");
        return { token: null, user: null };
      }

      console.log("Found token in localStorage");
      return { token, user };
    } catch (error) {
      console.error("Error getting auth token:", error);
      return { token: null, user: null };
    }
  }

  // Create headers with auth token
  private getHeaders(customHeaders?: HeadersInit): {
    headers: HeadersInit;
    token: string | null;
  } {
    const headers: Record<string, string> = { ...this.defaultHeaders };
    const { token, user } = this.getToken();

    console.log("Current auth state:", {
      hasToken: !!token,
      hasUser: !!user,
      tokenSource: token ? "found" : "not found",
    });

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Added Authorization header to request:", {
        header: `Bearer ${token.substring(0, 10)}...`,
      });
    } else {
      console.warn("No auth token available for request");
      // Log the current localStorage state for debugging
      if (typeof window !== "undefined") {
        console.log("LocalStorage state:", {
          token: localStorage.getItem("token"),
          user: localStorage.getItem("user"),
        });
      }
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return { headers, token };
  }

  // Handle response
  private async handleResponse<T>(
    response: Response,
    endpoint: string
  ): Promise<T> {
    const responseText = await response.text();
    let data: Record<string, unknown> = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error(
        `Failed to parse JSON response from ${endpoint}:`,
        responseText
      );
      data = { message: "Invalid response from server" };
    }

    console.log(`[${endpoint}] Response ${response.status}:`, {
      status: response.status,
      statusText: response.statusText,
      data: data,
    });

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string' 
        ? (data as { message: string }).message 
        : "Something went wrong";
      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      error.response = data;

      // Log specific auth errors
      if (response.status === 401) {
        console.error("Authentication error - Possible issues:", {
          token: this.getToken(),
          url: response.url,
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }

    return data as T;
  }

  // HTTP methods
  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    const { headers, token } = this.getHeaders(options?.headers);

    console.log(`[GET] ${fullUrl}`, {
      headers,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(fullUrl, {
      ...options,
      method: "GET",
      headers,
    });

    return this.handleResponse<T>(response, `GET ${endpoint}`);
  }

  public async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    const { headers, token } = this.getHeaders(options?.headers);

    console.log("Current auth state:", headers, token);

    console.log(`[POST] ${fullUrl}`, {
      headers,
      hasToken: !!token,
      body,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(fullUrl, {
      ...options,
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response, `POST ${endpoint}`);
  }

  public async put<T>(
    endpoint: string,
    body: unknown,
    options?: RequestInit
  ): Promise<T> {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    const { headers, token } = this.getHeaders(options?.headers);

    console.log(`[PUT] ${fullUrl}`, {
      headers,
      hasToken: !!token,
      body,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(fullUrl, {
      ...options,
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response, `PUT ${endpoint}`);
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    const { headers, token } = this.getHeaders(options?.headers);

    console.log(`[DELETE] ${fullUrl}`, {
      headers,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(fullUrl, {
      ...options,
      method: "DELETE",
      headers,
    });

    return this.handleResponse<T>(response, `DELETE ${endpoint}`);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
