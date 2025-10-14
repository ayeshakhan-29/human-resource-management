import { getAuthToken } from "../auth/token";
import {
  ProjectsResponse,
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ChangeProjectStatusRequest,
} from "../types/project.types";

// Remove trailing slash from API URL if present
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api").replace(/\/$/, "");

// Ensure we're using the full URL for API calls
const getFullApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `http://localhost:5001/api`;
  return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

// Get all projects with optional filtering
export const getAllProjects = async (
  page = 1,
  limit = 10,
  filters?: {
    status?: string;
    priority?: string;
    categories?: string;
    projectName?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }
): Promise<ProjectsResponse> => {
  const token = getAuthToken();
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

  const url = getFullApiUrl(`/projects/get-all-projects?${queryParams.toString()}`);
  console.log(`Fetching projects from: ${url}`);
  console.log(`Token present: ${!!token}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log(`Error data:`, errorData);
    throw new Error(errorData.message || "Failed to fetch projects");
  }

  return await response.json();
};

// Create a new project
export const createProject = async (projectData: CreateProjectRequest): Promise<ProjectResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getFullApiUrl('/projects/create-project'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create project");
  }

  return await response.json();
};

// Update an existing project
export const updateProject = async (
  projectId: number | string,
  projectData: UpdateProjectRequest
): Promise<ProjectResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getFullApiUrl(`/projects/update-project/${projectId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update project");
  }

  return await response.json();
};

// Change project status
export const changeProjectStatus = async (
  projectId: number | string,
  payload: ChangeProjectStatusRequest
): Promise<ProjectResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = getFullApiUrl(`/projects/change-project-status/${projectId}`);
  console.log(`Changing project status: ${url}`);
  console.log(`Payload:`, payload);
  console.log(`Token present: ${!!token}`);
  console.log(`Token value:`, token?.substring(0, 20) + '...');

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  console.log(`Response status: ${response.status}`);
  console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    // Clone the response so we can read it multiple times
    const responseClone = response.clone();
    
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      console.log(`Error data:`, errorData);
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      console.log(`Failed to parse error response as JSON:`, parseError);
      try {
        const textResponse = await responseClone.text();
        console.log(`Raw response text:`, textResponse);
        errorMessage = `${errorMessage} - ${textResponse}`;
      } catch (textError) {
        console.log(`Failed to read response as text:`, textError);
      }
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};

// Delete a project
export const deleteProject = async (projectId: number | string): Promise<ProjectResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(getFullApiUrl(`/projects/delete-project/${projectId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete project");
  }

  return await response.json();
};
