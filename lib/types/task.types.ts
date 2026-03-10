// Task types based on backend model

export type TaskStatus = 'pending' | 'in-progress' | 'in-review' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: number;
  projectId?: number;
  createdBy?: number;
  tags?: string[];
  attachments?: string[];
  comments?: TaskComment[];
  progress: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  assignee?: {
    id: number;
    fullName: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
    description?: string;
  };
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface TaskComment {
  userId: number;
  comment: string;
  timestamp: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  assigneeId?: number;
  managerId?: number;
  projectId?: number;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: number;
  projectId?: number;
  tags?: string[];
  attachments?: string[];
  progress?: number;
}

export interface UpdateTaskProgressRequest {
  progress: number;
}

export interface ChangeTaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigneeId: number;
}

export interface TasksResponse {
  success: boolean;
  message?: string;
  data: Task[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: Task;
}

export interface TaskStatisticsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    inProgress: number;
    inReview: number;
    completed: number;
    blocked: number;
    overdue: number;
  };
}

export interface ManagerTaskStatisticsResponse {
  success: boolean;
  data: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    activeProjects: number;
  };
}