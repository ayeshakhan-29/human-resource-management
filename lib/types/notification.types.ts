export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  userId: number;
  taskId?: number;
  createdAt: string;
  updatedAt: string;
  task?: {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
  };
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

export interface NotificationResponse {
  success: boolean;
  data: Notification;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}
