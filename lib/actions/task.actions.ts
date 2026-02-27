import { getAuthToken } from "@/lib/auth/token";
import {
  TasksResponse,
  TaskResponse,
  TaskStatisticsResponse,
  ManagerTaskStatisticsResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskProgressRequest,
  ChangeTaskStatusRequest,
  AssignTaskRequest,
} from "@/lib/types/task.types";

// Remove trailing slash from API URL if present
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api").replace(/\/$/, "");

console.log("API_BASE_URL:", API_BASE_URL);
// Get all tasks with optional filtering
export const getAllTasks = async (
  page = 1,
  limit = 10,
  filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string | number;
    projectId?: string | number;
    managerId?: string | number;
    assigneeName?: string;
    projectName?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }
): Promise<TasksResponse> => {
  const token = getAuthToken();
  console.log("Authentication token:", token ? "Token exists" : "No token found");
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Build query string from filters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }

  console.log(`Fetching from: ${API_BASE_URL}/tasks/all-tasks?${queryParams.toString()}`);
  const response = await fetch(`${API_BASE_URL}/tasks/all-tasks?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch tasks");
  }

  return await response.json();
};

// Get task by ID
export const getTaskById = async (taskId: number): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/get-task/${taskId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch task");
  }

  return await response.json();
};

// Create a new task
export const createTask = async (taskData: CreateTaskRequest): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/create-task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create task");
  }

  return await response.json();
};

// Update a task
export const updateTask = async (taskId: number, taskData: UpdateTaskRequest): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/update-task/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update task");
  }

  return await response.json();
};

// Delete a task
export const deleteTask = async (taskId: number): Promise<{ success: boolean; message: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/delete-task/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete task");
  }

  return await response.json();
};

// Update task progress
export const updateTaskProgress = async (
  taskId: number,
  progressData: UpdateTaskProgressRequest
): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/update-task-progress/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(progressData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update task progress");
  }

  return await response.json();
};

// Change task status
export const changeTaskStatus = async (
  taskId: number,
  statusData: ChangeTaskStatusRequest
): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/change-task-status/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(statusData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to change task status");
  }

  return await response.json();
};

// Assign task to user
export const assignTaskToUser = async (
  taskId: number,
  assignData: AssignTaskRequest
): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/assign-task-to-user/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(assignData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to assign task");
  }

  return await response.json();
};

// Get tasks by assignee
export const getTasksByAssignee = async (
  assigneeId: number,
  page = 1,
  limit = 10
): Promise<TasksResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks/assignee/${assigneeId}?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch tasks by assignee");
  }

  return await response.json();
};

// Get tasks by project
export const getTasksByProject = async (
  projectId: number,
  page = 1,
  limit = 10
): Promise<TasksResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/tasks/project/${projectId}?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch tasks by project");
  }

  return await response.json();
};

// Get overdue tasks
export const getOverdueTasks = async (
  page = 1,
  limit = 10
): Promise<TasksResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/tasks/overdue?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch overdue tasks");
  }

  return await response.json();
};

// Submit deliverables for a task
export const submitDeliverables = async (
  taskId: number,
  formData: FormData
): Promise<TaskResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/submit-deliverables/${taskId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - let browser set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to submit deliverables");
  }

  return await response.json();
};

// Get task statistics
export const getTaskStatistics = async (): Promise<TaskStatisticsResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/statistics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch task statistics");
  }

  return await response.json();
};

// Get manager-specific task statistics
export const getManagerTaskStatistics = async (): Promise<ManagerTaskStatisticsResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/tasks/manager-statistics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch manager task statistics");
  }

  return await response.json();
};
