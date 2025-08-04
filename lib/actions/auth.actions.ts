"use client";
import { getAuthToken } from "@/lib/auth/token";
import {
  LoginResponse,
  LoginCredentials,
  ApiError,
  InviteEmployeePayload,
  InviteEmployeeResponse,
  SetPasswordRequest,
  SetPasswordResponse,
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

    return data as LoginResponse;
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Network Error",
      message: "An error occurred during login. Please try again later.",
    };
  }
}

export async function inviteEmployeeAction(
  payload: InviteEmployeePayload
): Promise<InviteEmployeeResponse | ApiError> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return { error: "Backend URL is not configured" };
  }

  try {
    const token = getAuthToken();
    if (!token) {
      return {
        error: "Authentication required",
        message: "Please log in to perform this action",
      };
    }

    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const payloadWithResetToken = {
      ...payload,
      resetToken,
      resetUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/set-password?token=${resetToken}`,
    };

    const response = await fetch(`${backendUrl}auth/invite-employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payloadWithResetToken),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: "Invitation failed",
        message: data.message || "Failed to send invitation. Please try again.",
      };
    }

    return data as InviteEmployeeResponse;
  } catch (error) {
    console.error("Invitation error:", error);
    return {
      error: "Network Error",
      message:
        "An error occurred while sending the invitation. Please try again later.",
    };
  }
}

export async function setPasswordAction(
  request: SetPasswordRequest
): Promise<SetPasswordResponse | ApiError> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    console.error("Backend URL is not configured");
    return { 
      error: "Configuration Error",
      message: "Backend service is not properly configured. Please try again later." 
    };
  }

  console.log("Initiating set password request...");
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${backendUrl}auth/set-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: request.token,
        newPassword: request.newPassword,
        confirmPassword: request.confirmPassword
      }),
      cache: "no-store",
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));
    
    console.log(`Password set response [${response.status} in ${responseTime}ms]:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.ok ? "[SUCCESS]" : data
    });

    if (!response.ok) {
      const errorMessage = data.message || response.statusText || "Failed to update password";
      console.error("Password update failed:", {
        status: response.status,
        error: data.error,
        message: errorMessage,
        validationErrors: data.errors
      });
      
      return {
        error: data.error || "Password Update Failed",
        message: errorMessage,
        status: response.status,
        ...(data.errors && { errors: data.errors })
      };
    }

    console.log("Password updated successfully");
    return data as SetPasswordResponse;
    
  } catch (error) {
    console.error("Network/Request Error in setPasswordAction:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      error: "Network Error",
      message: "Unable to connect to the server. Please check your internet connection and try again.",
      code: "NETWORK_ERROR"
    };
  }
}