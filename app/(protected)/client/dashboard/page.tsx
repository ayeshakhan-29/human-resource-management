"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  onHold?: number;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  progress?: number;
  priority?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: {
    id: number;
    fullName: string;
    email: string;
  };
  tasks?: Array<{
    id: number;
    name: string;
    status: string;
    progress?: number;
  }>;
}

// Radial Progress Component
const RadialProgress = ({ 
  value, 
  size = 120, 
  strokeWidth = 8,
  color = "#3b82f6",
  label,
  sublabel
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color }}>{Math.round(value)}%</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</p>}
      </div>
    </div>
  );
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    onHold: 0,
  });
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    blocked: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use the backend URL from environment or default to localhost
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
        
        console.log('Fetching projects for client:', user?.email);
        console.log('API URL:', `${apiUrl}/projects/get-projects-by-client`);
        
        const response = await fetch(`${apiUrl}/projects/get-projects-by-client`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Projects data received:', data);
          
          const projectsData = data.data || [];
          setProjects(projectsData);

          const stats = projectsData.reduce(
            (acc: ProjectStats, project: Project) => {
              acc.total++;
              switch (project.status?.toLowerCase()) {
                case "active":
                  acc.active++;
                  break;
                case "completed":
                  acc.completed++;
                  break;
                case "planning":
                  acc.planning++;
                  break;
                case "on-hold":
                  acc.onHold = (acc.onHold || 0) + 1;
                  break;
              }
              return acc;
            },
            { total: 0, active: 0, completed: 0, planning: 0, onHold: 0 }
          );

          // Calculate task statistics from all projects
          const taskStats = projectsData.reduce(
            (acc: TaskStats, project: Project) => {
              if (project.tasks && project.tasks.length > 0) {
                project.tasks.forEach(task => {
                  acc.total++;
                  switch (task.status?.toLowerCase()) {
                    case "completed":
                      acc.completed++;
                      break;
                    case "in-progress":
                      acc.inProgress++;
                      break;
                    case "pending":
                      acc.pending++;
                      break;
                    case "blocked":
                      acc.blocked++;
                      break;
                  }
                });
              }
              return acc;
            },
            { total: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0 }
          );

          console.log('Calculated stats:', stats);
          console.log('Calculated task stats:', taskStats);
          setStats(stats);
          setTaskStats(taskStats);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch projects:', response.status, errorData);
        }
      } catch (error) {
        console.error("Failed to fetch project stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStats();
    } else {
      console.log('No user token available');
      setLoading(false);
    }
  }, [user]);

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const activeRate = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
  const planningRate = stats.total > 0 ? (stats.planning / stats.total) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "active": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "planning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "on-hold": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Client Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Welcome back, {user?.name || 'Client'}! Track your projects and monitor progress in real-time.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{taskStats.total}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{taskStats.completed}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{taskStats.inProgress}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Completion Rate</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Overall completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Radial Progress Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
            <CardDescription>Overall project completion status</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <RadialProgress 
              value={completionRate} 
              color="#10b981"
              label="Completed"
              sublabel={`${stats.completed} of ${stats.total} projects`}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Active Projects</CardTitle>
            <CardDescription>Projects currently in development</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <RadialProgress 
              value={activeRate} 
              color="#3b82f6"
              label="In Progress"
              sublabel={`${stats.active} active projects`}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Planning Phase</CardTitle>
            <CardDescription>Projects in planning stage</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <RadialProgress 
              value={planningRate} 
              color="#f59e0b"
              label="Planning"
              sublabel={`${stats.planning} projects`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects List */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Recent Projects
          </CardTitle>
          <CardDescription>
            Your latest projects and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No projects found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Projects will appear here once they are assigned to you
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => {
                const daysRemaining = calculateDaysRemaining(project.endDate);
                const isOverdue = daysRemaining !== null && daysRemaining < 0;
                const isUrgent = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;
                
                return (
                  <div 
                    key={project.id} 
                    className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md bg-white dark:bg-gray-800 transition-all duration-300"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1 truncate">
                            {project.name}
                          </h4>
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${getStatusColor(project.status)} text-xs font-medium px-2.5 py-1`}>
                        {project.status}
                      </Badge>
                      {project.priority && (
                        <Badge className={`${getPriorityColor(project.priority)} text-xs font-medium px-2.5 py-1`}>
                          {project.priority} priority
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium px-2.5 py-1">
                          Overdue
                        </Badge>
                      )}
                      {isUrgent && !isOverdue && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs font-medium px-2.5 py-1">
                          Due Soon
                        </Badge>
                      )}
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Start Date */}
                      {project.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(project.startDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* End Date */}
                      {project.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(project.endDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Days Remaining */}
                      {daysRemaining !== null && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Time Left</p>
                            <p className={`text-sm font-medium ${
                              isOverdue 
                                ? 'text-red-600 dark:text-red-400' 
                                : isUrgent 
                                ? 'text-orange-600 dark:text-orange-400' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {isOverdue 
                                ? `${Math.abs(daysRemaining)} days overdue` 
                                : `${daysRemaining} days left`
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Manager */}
                      {project.manager && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {project.manager.fullName}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Budget */}
                      {project.budget && (
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ${project.budget.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tasks Count */}
                      {project.tasks && project.tasks.length > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {project.tasks.filter(t => t.status === 'completed').length} / {project.tasks.length} completed
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {project.progress !== undefined && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Overall Progress
                          </span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
