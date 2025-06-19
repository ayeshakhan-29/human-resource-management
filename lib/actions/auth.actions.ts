"use server";

import {
  LoginResponse,
  LoginCredentials,
  ApiError,
} from "@/lib/types/auth.types";

export async function loginUserAction(
  credentials: LoginCredentials
): Promise<LoginResponse | ApiError> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return { error: "Backend URL is not configured" };
  }

  try {
    const response = await fetch(`${backendUrl}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: "Login failed",
        message: data.message || "Please check your credentials and try again.",
      };
    }

    // Return the response data which includes token and user info
    // The client component will handle storing this in localStorage
    return data as LoginResponse;
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Network Error",
      message: "An error occurred during login. Please try again later.",
    };
  }
}
