import { getAuthToken } from "@/lib/auth/token";
import {
  NotificationsResponse,
  NotificationResponse,
  MarkAsReadResponse,
  Notification,
} from "@/lib/types/notification.types";

// Remove trailing slash from API URL if present
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api").replace(/\/$/, "");

// Get all notifications for the current user
export const getNotifications = async (userId: string | number): Promise<NotificationsResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch notifications");
  }

  return await response.json();
};

// Get unread notifications count for the current user
export const getUnreadNotificationsCount = async (userId: string | number): Promise<number> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch notifications");
  }

  const data: NotificationsResponse = await response.json();
  return data.data.filter((n: Notification) => !n.isRead).length;
};

// Mark a notification as read
export const markAsRead = async (notificationId: number): Promise<MarkAsReadResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to mark notification as read");
  }

  return await response.json();
};
