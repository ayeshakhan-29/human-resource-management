"use client";
import { getAuthToken } from "@/lib/auth/token";
import {
  LoginResponse,
  LoginCredentials,
  ApiError,
  InviteEmployeePayload,
  InviteEmployeeResponse,
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

    // Generate a reset token for the invitation
    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Include the reset token in the payload
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
