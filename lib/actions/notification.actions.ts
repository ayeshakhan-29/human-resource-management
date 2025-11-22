import { getAuthToken } from "@/lib/auth/token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api";

// Helper function to ensure proper URL construction
const getApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${baseUrl}${endpoint}`;
};

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'manager_assignment';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'manager_assignment';
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  message?: string;
}

export interface CreateNotificationResponse {
  success: boolean;
  data: Notification;
  message?: string;
}

// Get all notifications for the current user
export const getNotifications = async (): Promise<NotificationsResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl('notifications'), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch notifications");
  }

  return response.json();
};

// Create a new notification
export const createNotification = async (
  notificationData: CreateNotificationRequest
): Promise<CreateNotificationResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl('notifications'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notificationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create notification");
  }

  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<{ success: boolean; message: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl(`notifications/${notificationId}/read`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to mark notification as read");
  }

  return response.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl('notifications/read-all'), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to mark all notifications as read");
  }

  return response.json();
};

// Delete a notification
export const deleteNotification = async (notificationId: number): Promise<{ success: boolean; message: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl(`notifications/${notificationId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete notification");
  }

  return response.json();
};

// Send manager assignment notification
export const sendManagerAssignmentNotification = async (
  userId: number,
  projectName: string,
  assignedBy: string
): Promise<CreateNotificationResponse> => {
  return createNotification({
    userId,
    title: "Manager Role Assigned",
    message: `You have been assigned as a manager for the project "${projectName}" by ${assignedBy}. You now have access to the manager dashboard to oversee tasks and team members.`,
    type: "manager_assignment",
  });
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getApiUrl('notifications/unread-count'), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch unread count");
  }

  return response.json();
};