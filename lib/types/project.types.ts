export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget: string;
  managerId: number;
  clientName: string;
  clientEmail: string;
  categories?: string;
  tags: string[];
  attachments: string[];
  progress: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manager: {
    id: number;
    fullName: string;
    email: string;
  };
};

export interface projectComment {
  userId: number;
  comment: string;
  timestamp: string;
}
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: string;
  managerId?: number;
  categories?: string;
  clientName?: string;
  clientEmail?: string;
  tags?: string[];
  attachments?: string[];
}
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: string;
  managerId?: number;
  categories?: string;
  clientName?: string;
  clientEmail?: string;
  tags?: string[];
  attachments?: string[];
}
export interface UpdateProjectProgressRequest {
  progress: number;
}

export interface ChangeProjectStatusRequest {
  status: ProjectStatus;
}
export interface AssignTaskRequest {
  assigneeId: number;
}

export interface ProjectsResponse {
  success: boolean;
  message?: string;
  data: Project[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}
