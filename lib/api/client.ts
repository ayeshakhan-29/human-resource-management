// Client-side API client with token management

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get token from localStorage (runs on client-side only)
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      const parsedUser = JSON.parse(user);
      return parsedUser.token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Create headers with auth token
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const token = this.getToken();
    const headers: Record<string, string> = { ...this.defaultHeaders };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const error = {
        status: response.status,
        message: data.message || 'Something went wrong',
        ...data,
      };
      throw error;
    }

    return data as T;
  }

  // HTTP methods
  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: this.getHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }

  public async post<T>(
    endpoint: string, 
    body?: any, 
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: this.getHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  public async put<T>(
    endpoint: string, 
    body: any, 
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: this.getHeaders(options?.headers),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  public async delete<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: this.getHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
