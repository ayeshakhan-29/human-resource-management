'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  AlertCircle,
  FileUp,
  TrendingUp,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  message: string;
  type: 'status_change' | 'task_completed' | 'overdue' | 'file_upload' | 'task_assigned' | 'general';
  isRead: boolean;
  projectId?: number;
  taskId?: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const notificationIcons = {
  status_change: TrendingUp,
  task_completed: CheckCircle2,
  overdue: AlertCircle,
  file_upload: FileUp,
  task_assigned: Bell,
  general: Bell,
};

const notificationColors = {
  status_change: 'text-blue-500',
  task_completed: 'text-green-500',
  overdue: 'text-red-500',
  file_upload: 'text-purple-500',
  task_assigned: 'text-yellow-500',
  general: 'text-gray-500',
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter();
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate to relevant page
    if (notification.projectId) {
      router.push(`/dashboard/projects/${notification.projectId}`);
    } else if (notification.taskId) {
      router.push(`/dashboard/tasks/${notification.taskId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'px-4 py-3 cursor-pointer hover:bg-accent transition-colors border-b',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('mt-1', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className={cn(
            'text-sm',
            !notification.isRead && 'font-semibold'
          )}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!notification.isRead && (
          <div className="mt-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}
