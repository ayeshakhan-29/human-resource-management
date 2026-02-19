'use client';

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
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
  Plus,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Settings,
  Download,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { getAllProjects, changeProjectStatus, deleteProject, updateProjectProgress } from "@/lib/actions/project.action";
import { getAllTasks, getTasksByProject, getTaskStatistics } from "@/lib/actions/task.actions";
import { Project as BackendProject, ProjectStatus, ProjectPriority } from "@/lib/types/project.types";
import { Task as BackendTask } from "@/lib/types/task.types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";




// Frontend Project interface for compatibility
interface FrontendProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  progress: number;
  teamSize: number;
  manager: string;
  budget: string;
  category: string;
  tasks: FrontendTask[];
}

interface FrontendTask {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}


export default function ProjectManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<FrontendProject | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'tasks'>('overview');
  const [projectTasks, setProjectTasks] = useState<FrontendTask[]>([]);
  const router = useRouter();

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Data state
  const [projects, setProjects] = useState<FrontendProject[]>([]);
  const [allTasks, setAllTasks] = useState<FrontendTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Convert backend project to frontend format
  const convertBackendProject = (backendProject: BackendProject): FrontendProject => {
    return {
      id: backendProject.id.toString(),
      name: backendProject.name,
      description: backendProject.description || '',
      status: backendProject.status,
      priority: backendProject.priority,
      startDate: backendProject.startDate,
      endDate: backendProject.endDate,
      progress: backendProject.progress,
      teamSize: 0, // This would need to be calculated from team members
      manager: backendProject.manager.fullName,
      budget: backendProject.budget || '$0',
      category: backendProject.categories || 'General',
      tasks: [], // Will be loaded separately
    };
  };

  // Convert backend task to frontend format
  const convertBackendTask = (backendTask: BackendTask): FrontendTask => {
    return {
      id: backendTask.id.toString(),
      name: backendTask.title,
      status: backendTask.status as 'pending' | 'in-progress' | 'completed' | 'blocked',
      assignee: backendTask.assignee?.fullName || 'Unassigned',
      dueDate: backendTask.dueDate || '',
      priority: backendTask.priority as 'low' | 'medium' | 'high' | 'urgent'
    };
  };

  // Fetch projects from backend
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllProjects(page, limit, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined,
        // enforce stable ordering across pages
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      if (response.success && response.data) {
        const convertedProjects = response.data.map(convertBackendProject);
        setProjects(convertedProjects);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.totalItems || convertedProjects.length);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, searchTerm, statusFilter, page, limit]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, searchTerm]);

  // Fetch tasks for a specific project
  const fetchProjectTasks = useCallback(async (projectId: string) => {
    try {
      const response = await getTasksByProject(parseInt(projectId), 1, 100);
      if (response.success && response.data) {
        const convertedTasks = response.data.map(convertBackendTask);
        return convertedTasks;
      }
      return [];
    } catch (err) {
      console.error('Error fetching project tasks:', err);
      return [];
    }
  }, []);

  // Load all tasks for statistics
  const fetchAllTasks = useCallback(async () => {
    try {
      const response = await getAllTasks(1, 1000); // Get all tasks for statistics
      if (response.success && response.data) {
        const convertedTasks = response.data.map(convertBackendTask);
        setAllTasks(convertedTasks);
      }
    } catch (err) {
      console.error('Error fetching all tasks:', err);
    }
  }, []);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchProjects();
    fetchAllTasks();
  }, [fetchAllTasks, fetchProjects]);

  // Load tasks when a project is selected
  useEffect(() => {
    const id = selectedProject?.id;
    if (id) {
      let cancelled = false;
      fetchProjectTasks(id).then(tasks => {
        if (!cancelled) setProjectTasks(tasks);
      });
      return () => { cancelled = true; };
    } else {
      setProjectTasks([]);
    }
  }, [selectedProject?.id, fetchProjectTasks]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Planning</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-blue-200">Active</Badge>;
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const urgentProjects = projects.filter(p => p.priority === 'urgent').length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;

  const handleProjectSelect = (project: FrontendProject) => {
    setSelectedProject(project);
    setViewMode('overview');
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      setRefreshing(true);
      console.log('Changing project status:', { projectId, newStatus });

      const response = await changeProjectStatus(parseInt(projectId), { status: newStatus as ProjectStatus });
      console.log('Status change response:', response);

      if (response.success) {
        // Update local state
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project status';
      toast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProgressUpdate = async (projectId: string, newProgress: number) => {
    try {
      setRefreshing(true);
      const response = await updateProjectProgress(parseInt(projectId), newProgress);

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

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setRefreshing(true);
      const response = await deleteProject(parseInt(projectToDelete));

      if (response.success) {
        // Update local state
        setProjects(prev => prev.filter(p => p.id !== projectToDelete));

        if (selectedProject?.id === projectToDelete) {
          setSelectedProject(null);
        }

        toast.success('Project and associated tasks deleted successfully');
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);

        // Refresh local view
        router.refresh();
      } else {
        throw new Error(response.message || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };


  const handleEditTasks = (project: FrontendProject) => {
    // Store the selected project in localStorage to pass to task management page
    localStorage.setItem('selectedProjectForTasks', JSON.stringify(project));
    // Navigate to task management page
    window.location.href = '/admin/tasks/manage-tasks';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProjects(), fetchAllTasks()]);
    setRefreshing(false);
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Projects", href: "/admin/projects" },
          { label: "Project Management" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600">Monitor, manage, and control all company projects</p>
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalProjects}</div>
              <p className="text-xs text-blue-600">All projects</p>
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

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">On Hold</CardTitle>
              <Pause className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {projects.filter(p => p.status === 'on-hold').length}
              </div>
              <p className="text-xs text-yellow-600">Paused projects</p>
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages} • {limit} per page</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
            <CardDescription>Find and manage projects</CardDescription>
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

              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
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
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'No projects match your current filters'
                        : 'No projects available. Create your first project to get started.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedProject?.id === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(project.status)}
                            {getPriorityBadge(project.priority)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{project.manager}</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        {/* <Progress value={project.progress} className="mt-2" /> */}
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
                      <div>
                        <CardTitle className="text-2xl mb-2">{selectedProject.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusBadge(selectedProject.status)}
                          {getPriorityBadge(selectedProject.priority)}
                          <Badge variant="outline">{selectedProject.category}</Badge>
                        </div>
                        <CardDescription className="text-base">
                          {selectedProject.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTasks(selectedProject)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Tasks
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Manager:</span>
                        <div className="font-medium">{selectedProject.manager}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Team Size:</span>
                        <div className="font-medium">{selectedProject.teamSize}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget:</span>
                        <div className="font-medium">{selectedProject.budget}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <div className="font-medium">{selectedProject.progress}%</div>
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
                            <h4 className="font-medium mb-2">Timeline</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Start Date:</span>
                                <span className="font-medium">{formatDate(selectedProject.startDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>End Date:</span>
                                <span className="font-medium">{formatDate(selectedProject.endDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Quick Actions</h4>
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
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Update Progress
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={selectedProject.progress}
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
                                onClick={() => handleProgressUpdate(selectedProject.id, selectedProject.progress)}
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
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditTasks(selectedProject)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Tasks
                            </Button>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Task
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {projectTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{task.name}</div>
                                <div className="text-sm text-gray-600">
                                  {task.assignee} • Due: {formatDate(task.dueDate)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getTaskStatusBadge(task.status)}
                                {/* <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button> */}
                              </div>
                            </div>
                          ))}
                        </div>
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

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteProject}
          title="Delete Project"
          description="Are you sure you want to delete this project? This will also delete all associated tasks. This action cannot be undone."
          confirmText="Delete Project"
          variant="destructive"
          loading={refreshing}
        />
      </div>
    </>
  );
}