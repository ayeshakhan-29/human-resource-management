'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Save,
  X,
  UserPlus
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  progress: number;
  teamSize: number;
  manager: string;
  budget: string;
  category: string;
  tasks: Task[];
  teamMembers: TeamMember[];
}

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
}

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design and improved UX",
    status: "active",
    priority: "high",
    startDate: "2024-01-15",
    endDate: "2024-04-30",
    progress: 65,
    teamSize: 8,
    manager: "Sarah Johnson",
    budget: "$45,000",
    category: "Development",
    tasks: [
      { id: "1", name: "Design Mockups", description: "Create wireframes and design mockups", status: "completed", assignee: "Alex Chen", dueDate: "2024-02-01", priority: "high" },
      { id: "2", name: "Frontend Development", description: "Develop responsive frontend components", status: "in-progress", assignee: "Mike Davis", dueDate: "2024-03-15", priority: "high" },
      { id: "3", name: "Backend API", description: "Build RESTful API endpoints", status: "pending", assignee: "Lisa Wang", dueDate: "2024-03-30", priority: "medium" }
    ],
    teamMembers: [
      { id: "1", name: "Sarah Johnson", role: "Project Manager", email: "sarah@company.com", status: "active" },
      { id: "2", name: "Alex Chen", role: "UI/UX Designer", email: "alex@company.com", status: "active" },
      { id: "3", name: "Mike Davis", role: "Frontend Developer", email: "mike@company.com", status: "active" },
      { id: "4", name: "Lisa Wang", role: "Backend Developer", email: "lisa@company.com", status: "active" }
    ]
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "iOS and Android mobile application for customer engagement",
    status: "planning",
    priority: "urgent",
    startDate: "2024-03-01",
    endDate: "2024-08-15",
    progress: 15,
    teamSize: 12,
    manager: "Mike Chen",
    budget: "$120,000",
    category: "Development",
    tasks: [
      { id: "1", name: "Requirements Gathering", description: "Collect and document project requirements", status: "completed", assignee: "Mike Chen", dueDate: "2024-03-15", priority: "high" },
      { id: "2", name: "UI/UX Design", description: "Design mobile app interface and user experience", status: "in-progress", assignee: "Emma Wilson", dueDate: "2024-04-15", priority: "high" }
    ],
    teamMembers: [
      { id: "1", name: "Mike Chen", role: "Project Manager", email: "mike.chen@company.com", status: "active" },
      { id: "2", name: "Emma Wilson", role: "Mobile Designer", email: "emma@company.com", status: "active" }
    ]
  }
];

export default function ManageProjectPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'edit' | 'tasks' | 'team'>('overview');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', description: '', assignee: '', dueDate: '', priority: 'medium' as const });
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Planning</Badge>;
      case 'active':
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Filter projects based on search and filters
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter(p => p.status === 'active').length;
  const completedProjects = mockProjects.filter(p => p.status === 'completed').length;
  const urgentProjects = mockProjects.filter(p => p.priority === 'urgent').length;
  const totalTasks = mockProjects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = mockProjects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'completed').length, 0);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setEditingProject({ ...project });
    setViewMode('overview');
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    // Update project status
    const updatedProjects = mockProjects.map(p => 
      p.id === projectId ? { ...p, status: newStatus as any } : p
    );
    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, status: newStatus as any });
    }
    console.log(`Updated project ${projectId} status to ${newStatus}`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      // TODO: Delete project from backend
      console.log(`Deleting project ${projectId}`);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setEditingProject(null);
      }
    }
  };

  const handleSaveProject = () => {
    if (editingProject) {
      setSelectedProject(editingProject);
      setViewMode('overview');
      console.log('Project updated:', editingProject);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(selectedProject ? { ...selectedProject } : null);
    setViewMode('overview');
  };

  const handleAddTask = () => {
    if (newTask.name && newTask.assignee && newTask.dueDate && selectedProject) {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        description: newTask.description,
        status: 'pending',
        assignee: newTask.assignee,
        dueDate: newTask.dueDate,
        priority: newTask.priority
      };
      
      const updatedProject = {
        ...selectedProject,
        tasks: [...selectedProject.tasks, task]
      };
      
      setSelectedProject(updatedProject);
      setEditingProject(updatedProject);
      setNewTask({ name: '', description: '', assignee: '', dueDate: '', priority: 'medium' });
      setShowAddTask(false);
    }
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.role && newMember.email && selectedProject) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name,
        role: newMember.role,
        email: newMember.email,
        status: 'active'
      };
      
      const updatedProject = {
        ...selectedProject,
        teamMembers: [...selectedProject.teamMembers, member],
        teamSize: selectedProject.teamSize + 1
      };
      
      setSelectedProject(updatedProject);
      setEditingProject(updatedProject);
      setNewMember({ name: '', role: '', email: '' });
      setShowAddMember(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (selectedProject) {
      const updatedTasks = selectedProject.tasks.filter(t => t.id !== taskId);
      const updatedProject = { ...selectedProject, tasks: updatedTasks };
      setSelectedProject(updatedProject);
      setEditingProject(updatedProject);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (selectedProject) {
      const updatedMembers = selectedProject.teamMembers.filter(m => m.id !== memberId);
      const updatedProject = { 
        ...selectedProject, 
        teamMembers: updatedMembers,
        teamSize: selectedProject.teamSize - 1
      };
      setSelectedProject(updatedProject);
      setEditingProject(updatedProject);
    }
  };

  const handleNewProject = () => {
    router.push('/admin/projects/add');
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Projects", href: "/admin/projects" },
          { label: "Manage Projects" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
          <p className="text-gray-600">Monitor, edit, and control all company projects</p>
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

              <Button className="w-full sm:w-auto" onClick={handleNewProject}>
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
                <div className="space-y-3">
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
                                             <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                         <div 
                           className="bg-blue-600 h-2 rounded-full"
                           style={{ width: `${project.progress}%` }}
                         ></div>
                       </div>
                    </div>
                  ))}
                </div>
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
                          onClick={() => setViewMode('edit')}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
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
                        Tasks ({selectedProject.tasks.length})
                      </Button>
                      <Button
                        variant={viewMode === 'team' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('team')}
                      >
                        Team ({selectedProject.teamMembers.length})
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
                              >
                                <SelectTrigger size="sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="planning">Planning</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Tab */}
                    {viewMode === 'edit' && editingProject && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input
                              value={editingProject.name}
                              onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={editingProject.category} onValueChange={(value) => setEditingProject({...editingProject, category: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={editingProject.description}
                            onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={editingProject.startDate}
                              onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={editingProject.endDate}
                              onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Budget</Label>
                            <Input
                              value={editingProject.budget}
                              onChange={(e) => setEditingProject({...editingProject, budget: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProject}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tasks Tab */}
                    {viewMode === 'tasks' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Project Tasks</h4>
                          <Button size="sm" onClick={() => setShowAddTask(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </div>
                        
                        {showAddTask && (
                          <Card className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label>Task Name</Label>
                                <Input
                                  value={newTask.name}
                                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                                  placeholder="Enter task name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Assignee</Label>
                                <Input
                                  value={newTask.assignee}
                                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                                  placeholder="Enter assignee name"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                  type="date"
                                  value={newTask.dueDate}
                                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({...newTask, priority: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              <Label>Description</Label>
                              <Textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                placeholder="Enter task description"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddTask}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                              </Button>
                            </div>
                          </Card>
                        )}

                        <div className="space-y-3">
                          {selectedProject.tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{task.name}</div>
                                <div className="text-sm text-gray-600">
                                  {task.description}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {task.assignee} • Due: {formatDate(task.dueDate)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getTaskStatusBadge(task.status)}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Team Tab */}
                    {viewMode === 'team' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Project Team</h4>
                          <Button size="sm" onClick={() => setShowAddMember(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                          </Button>
                        </div>
                        
                        {showAddMember && (
                          <Card className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={newMember.name}
                                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                  placeholder="Enter member name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                  value={newMember.role}
                                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                                  placeholder="Enter role"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={newMember.email}
                                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                                  placeholder="Enter email"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddMember}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Member
                              </Button>
                            </div>
                          </Card>
                        )}

                        <div className="space-y-3">
                          {selectedProject.teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-600">
                                  {member.role} • {member.email}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                                  {member.status}
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
      </div>
    </>
  );
}
