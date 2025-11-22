'use client';

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  Target, 
  Play,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  BarChart3,
  Download,
  Loader2
} from "lucide-react";
import { changeProjectStatus, deleteProject, updateProjectProgress } from "@/lib/actions/project.action";
import { getAllTasks } from "@/lib/actions/task.actions";
import { ProjectStatus, ProjectPriority } from "@/lib/types/project.types";
import { toast } from "sonner";

interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  progress: number;
  manager: {
    id: number;
    fullName: string;
  };
  client?: {
    fullName: string;
  };
  teamMembers?: Array<{ id: number; fullName?: string }>;
  tasks?: Array<{ status: string }>;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee?: {
    fullName: string;
  };
}

export default function ManagerProjectManagementPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'tasks'>('overview');
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch projects managed by this manager
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");
      
      const response = await fetch(`${baseUrl}projects/get-all-projects?managerId=${user?.id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const data = await response.json();
      if (response.ok && data?.success && Array.isArray(data.data)) {
        setProjects(data.data);
      } else {
        throw new Error(data?.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch tasks for a specific project
  const fetchProjectTasks = useCallback(async (projectId: number) => {
    try {
      const response = await getAllTasks(1, 100, { projectId: String(projectId) });
      if (response?.success && Array.isArray(response.data)) {
        setProjectTasks(response.data as Task[]);
      }
    } catch (err) {
      console.error('Error fetching project tasks:', err);
      setProjectTasks([]);
    }
  }, []);

  // Load all tasks for statistics
  const fetchAllTasks = useCallback(async () => {
    try {
      const response = await getAllTasks(1, 1000, { managerId: user?.id || "" });
      if (response?.success && Array.isArray(response.data)) {
        setAllTasks(response.data as Task[]);
      }
    } catch (err) {
      console.error('Error fetching all tasks:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
      fetchAllTasks();
    }
  }, [fetchProjects, fetchAllTasks, user?.id]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectTasks(selectedProject.id);
    } else {
      setProjectTasks([]);
    }
  }, [selectedProject, fetchProjectTasks]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Planning</Badge>;
      case 'active':
      case 'in-progress':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'on-hold':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Hold</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const urgentProjects = projects.filter(p => p.priority === 'urgent').length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setViewMode('overview');
  };

  const handleStatusChange = async (projectId: number, newStatus: string) => {
    try {
      setRefreshing(true);
      const response = await changeProjectStatus(projectId, { status: newStatus as ProjectStatus });
      
      if (response.success) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: newStatus as ProjectStatus } : p
        ));
        
        if (selectedProject?.id === projectId) {
          setSelectedProject(prev => prev ? { ...prev, status: newStatus as ProjectStatus } : null);
        }
        
        toast.success('Project status updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update project status');
      }
    } catch (err) {
      console.error('Error updating project status:', err);
      toast.error('Failed to update project status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleProgressUpdate = async (projectId: number, newProgress: number) => {
    try {
      setRefreshing(true);
      const response = await updateProjectProgress(projectId, newProgress);
      
      if (response.success) {
        // Update local state
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, progress: newProgress } : p
        ));
        
        if (selectedProject?.id === projectId) {
          setSelectedProject(prev => prev ? { ...prev, progress: newProgress } : null);
        }
        
        toast.success('Project progress updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update project progress');
      }
    } catch (err) {
      console.error('Error updating project progress:', err);
      toast.error('Failed to update project progress');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setRefreshing(true);
        await deleteProject(projectId);
        
        setProjects(prev => prev.filter(p => p.id !== projectId));
        
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
        
        toast.success('Project deleted successfully');
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error('Failed to delete project');
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProjects(), fetchAllTasks()]);
    setRefreshing(false);
  };

  const calculateProgress = (project: Project) => {
    const tasks = project.tasks || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Manager", href: "/manager" },
          { label: "Projects", href: "/manager/projects" },
          { label: "Manage Projects" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
              <p className="text-gray-600">Monitor and control your assigned projects</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalProjects}</div>
              <p className="text-xs text-blue-600">Under your management</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{activeProjects}</div>
              <p className="text-xs text-green-600">Currently running</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{completedProjects}</div>
              <p className="text-xs text-purple-600">Successfully finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{urgentProjects}</div>
              <p className="text-xs text-red-600">High priority</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Task Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{completedTasks}/{totalTasks}</div>
              <p className="text-xs text-orange-600">Tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Find and filter your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Select a project to manage</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-gray-600">Loading projects...</span>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
                    <p className="text-gray-600 text-sm">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'No projects match your current filters'
                        : 'You haven\'t been assigned as a manager to any projects yet.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 line-clamp-1">{project.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {project.teamMembers?.length || 0} members
                          </span>
                          <span className="font-medium">{calculateProgress(project)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{selectedProject.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {getStatusBadge(selectedProject.status)}
                          {getPriorityBadge(selectedProject.priority)}
                        </div>
                        <CardDescription className="text-base">
                          {selectedProject.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/manager/projects/${selectedProject.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProject(selectedProject.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {selectedProject.client && (
                        <div>
                          <span className="text-gray-600">Client:</span>
                          <div className="font-medium">{selectedProject.client.fullName}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Team Size:</span>
                        <div className="font-medium">{selectedProject.teamMembers?.length || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <div className="font-medium">{calculateProgress(selectedProject)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Tabs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={viewMode === 'overview' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('overview')}
                      >
                        Overview
                      </Button>
                      <Button
                        variant={viewMode === 'tasks' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('tasks')}
                      >
                        Tasks ({projectTasks.length})
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Overview Tab */}
                    {viewMode === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Timeline
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Start Date:</span>
                                <span className="font-medium">{formatDate(selectedProject.startDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>End Date:</span>
                                <span className="font-medium">{formatDate(selectedProject.endDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="font-medium">
                                  {Math.ceil(
                                    (new Date(selectedProject.endDate).getTime() - 
                                     new Date(selectedProject.startDate).getTime()) / 
                                    (1000 * 60 * 60 * 24)
                                  )} days
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Change Status</h4>
                            <div className="space-y-2">
                              <Select 
                                value={selectedProject.status} 
                                onValueChange={(value) => handleStatusChange(selectedProject.id, value)}
                                disabled={refreshing}
                              >
                                <SelectTrigger size="sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="planning">Planning</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-600">Update the project status</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            Update Progress
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={selectedProject.progress || 0}
                                onChange={(e) => {
                                  const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  setSelectedProject(prev => prev ? { ...prev, progress: value } : null);
                                }}
                                className="w-24"
                                disabled={refreshing}
                              />
                              <span className="text-sm text-gray-600">%</span>
                              <Button
                                size="sm"
                                onClick={() => handleProgressUpdate(selectedProject.id, selectedProject.progress || 0)}
                                disabled={refreshing}
                              >
                                {refreshing ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : null}
                                Update
                              </Button>
                            </div>
                            <div className="text-xs text-gray-600">
                              Set the project completion percentage (0-100%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tasks Tab */}
                    {viewMode === 'tasks' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Project Tasks</h4>
                          <Button 
                            size="sm"
                            onClick={() => window.location.href = `/manager/tasks/all-tasks?projectId=${selectedProject.id}`}
                          >
                            View All Tasks
                          </Button>
                        </div>
                        {projectTasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No tasks found for this project</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {projectTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex-1">
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-gray-600">
                                    {task.assignee?.fullName || "Unassigned"} • Due: {formatDate(task.dueDate)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getTaskStatusBadge(task.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
                  <p>Select a project from the list to view details and manage it</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
