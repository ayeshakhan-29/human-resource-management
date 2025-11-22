"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Download,
  Target,
  CheckCircle,
  RefreshCw,
  FolderKanban,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { getAllTasks } from "@/lib/actions/task.actions";
import { toast } from "sonner";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  progress: number;
  manager: {
    fullName: string;
  };
  client?: {
    fullName: string;
    email?: string;
  };
  teamMembers?: Array<{ id: number; fullName?: string }>;
  tasks?: Array<{ status: string }>;
}

interface Task {
  id: number;
  status: string;
  project?: {
    id: number;
    name: string;
  };
  assignee?: {
    fullName: string;
  };
}

export default function ProjectReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");

      const projectsResponse = await fetch(`${baseUrl}projects/get-all-projects`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const projectsData = await projectsResponse.json();
      if (projectsResponse.ok && projectsData?.success) {
        setProjects(projectsData.data);
      }

      const tasksResponse = await getAllTasks(1, 1000);
      if (tasksResponse?.success) {
        setTasks(tasksResponse.data as Task[]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load project reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "active" || p.status === "in-progress").length;
    const completedProjects = projects.filter(p => p.status === "completed").length;
    const onHoldProjects = projects.filter(p => p.status === "on-hold").length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const blockedTasks = tasks.filter(t => t.status === "blocked").length;
    
    const avgProgress = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0;

    const tasksCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const today = new Date();
    const overdueProjects = projects.filter(p => {
      if (p.status === "completed") return false;
      const endDate = new Date(p.endDate);
      return endDate < today;
    }).length;

    const teamPerformance = new Map<string, { completed: number; inProgress: number; pending: number; total: number }>();
    tasks.forEach(task => {
      const assignee = task.assignee?.fullName || "Unassigned";
      if (!teamPerformance.has(assignee)) {
        teamPerformance.set(assignee, { completed: 0, inProgress: 0, pending: 0, total: 0 });
      }
      const stats = teamPerformance.get(assignee)!;
      stats.total++;
      if (task.status === "completed") stats.completed++;
      else if (task.status === "in-progress") stats.inProgress++;
      else if (task.status === "pending") stats.pending++;
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      blockedTasks,
      avgProgress,
      tasksCompletionRate,
      teamPerformance: Array.from(teamPerformance.entries()).map(([name, stats]) => ({
        name,
        ...stats,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      })).sort((a, b) => b.completionRate - a.completionRate),
    };
  }, [projects, tasks]);

  const handleExport = () => {
    const csvHeaders = ["Project ID", "Project Name", "Status", "Priority", "Progress", "Manager", "Client", "Team Size", "Start Date", "End Date"];
    const csvRows = projects.map(p => [
      p.id,
      `"${p.name}"`,
      p.status,
      p.priority,
      `${p.progress}%`,
      `"${p.manager.fullName}"`,
      `"${p.client?.fullName || "N/A"}"`,
      p.teamMembers?.length || 0,
      p.startDate,
      p.endDate,
    ]);

    const allRows = [csvHeaders, ...csvRows];
    const csvContent = allRows.map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `project-reports-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in-progress":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case "on-hold":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Hold</Badge>;
      case "planning":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Planning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const RadialProgress = ({ progress, size = 120, strokeWidth = 10 }: { progress: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = () => {
      if (progress >= 75) return "#10b981";
      if (progress >= 50) return "#3b82f6";
      if (progress >= 25) return "#f59e0b";
      return "#ef4444";
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{progress}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading reports...</span>
      </div>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Projects", href: "/admin/projects" },
          { label: "Project Reports" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Reports</h1>
              <p className="text-gray-600">Comprehensive project analytics and insights</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchData} variant="outline" size="lg">
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Download className="h-5 w-5 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* TOP SECTION - Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Total Projects</CardTitle>
              <FolderKanban className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalProjects}</div>
              <p className="text-xs text-blue-700 font-medium">All projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-800">Active</CardTitle>
              <Target className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.activeProjects}</div>
              <p className="text-xs text-green-700 font-medium">In progress</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.completedProjects}</div>
              <p className="text-xs text-purple-700 font-medium">Finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-red-800">Overdue</CardTitle>
              <Clock className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{stats.overdueProjects}</div>
              <p className="text-xs text-red-700 font-medium">Past deadline</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-indigo-800">Tasks Completed</CardTitle>
              <CheckCircle className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900">{stats.tasksCompletionRate}%</div>
              <p className="text-xs text-indigo-700 font-medium">{stats.completedTasks}/{stats.totalTasks} tasks</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-800">Avg Progress</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900">{stats.avgProgress}%</div>
              <p className="text-xs text-emerald-700 font-medium">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE SECTION - Project Progress & Task Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Project Progress
              </CardTitle>
              <CardDescription>Visual progress tracking with radial charts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {projects.slice(0, 8).map((project) => (
                  <div key={project.id} className="flex flex-col items-center text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <RadialProgress progress={project.progress || 0} size={100} strokeWidth={8} />
                    <h4 className="font-semibold text-sm text-gray-900 mt-3 line-clamp-2">{project.name}</h4>
                    {getStatusBadge(project.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Task Breakdown
              </CardTitle>
              <CardDescription>Task distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Completed</span>
                      <span className="text-sm font-bold text-green-600">{stats.completedTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">In Progress</span>
                      <span className="text-sm font-bold text-blue-600">{stats.inProgressTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Pending</span>
                      <span className="text-sm font-bold text-yellow-600">{stats.pendingTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Blocked</span>
                      <span className="text-sm font-bold text-red-600">{stats.blockedTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.blockedTasks / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{stats.totalTasks}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Team Performance
            </CardTitle>
            <CardDescription>Individual team member task completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Team Member</TableHead>
                    <TableHead className="font-semibold text-center">Total Tasks</TableHead>
                    <TableHead className="font-semibold text-center">Completed</TableHead>
                    <TableHead className="font-semibold text-center">In Progress</TableHead>
                    <TableHead className="font-semibold text-center">Pending</TableHead>
                    <TableHead className="font-semibold text-center">Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.teamPerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No team performance data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.teamPerformance.map((member, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-center">{member.total}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800 border-green-200">{member.completed}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">{member.inProgress}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">{member.pending}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: `${member.completionRate}%` }}
                              />
                            </div>
                            <span className="font-bold text-sm">{member.completionRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Timeline / Schedule Graph */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Project Timeline
            </CardTitle>
            <CardDescription>Project schedules and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => {
                const startDate = new Date(project.startDate);
                const endDate = new Date(project.endDate);
                const today = new Date();
                const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const timeProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
                const isOverdue = today > endDate && project.status !== "completed";

                return (
                  <div key={project.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{formatDate(project.startDate)}</span>
                          <span>→</span>
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {formatDate(project.endDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(project.status)}
                        {isOverdue && <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Time Progress: {timeProgress}%</span>
                        <span>Work Progress: {project.progress}%</span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="absolute bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full opacity-50"
                          style={{ width: `${timeProgress}%` }}
                        />
                        <div
                          className="absolute bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>🔵 Time elapsed</span>
                        <span>🟢 Work completed</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM SECTION - Issues & Risks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Issues & Risks
              </CardTitle>
              <CardDescription className="text-red-700">Projects requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.filter(p => {
                  const isOverdue = new Date(p.endDate) < new Date() && p.status !== "completed";
                  const isBlocked = tasks.some(t => t.project?.id === p.id && t.status === "blocked");
                  return isOverdue || isBlocked || p.priority === "urgent";
                }).length === 0 ? (
                  <div className="text-center py-8 text-green-600 font-medium">
                    ✅ No critical issues detected
                  </div>
                ) : (
                  projects.filter(p => {
                    const isOverdue = new Date(p.endDate) < new Date() && p.status !== "completed";
                    const isBlocked = tasks.some(t => t.project?.id === p.id && t.status === "blocked");
                    return isOverdue || isBlocked || p.priority === "urgent";
                  }).map((project) => {
                    const isOverdue = new Date(project.endDate) < new Date() && project.status !== "completed";
                    const blockedTasks = tasks.filter(t => t.project?.id === project.id && t.status === "blocked").length;

                    return (
                      <div key={project.id} className="p-4 bg-white border border-red-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          <Badge className="bg-red-100 text-red-800 border-red-200">{project.priority}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700">
                          {isOverdue && (
                            <div className="flex items-center gap-2 text-red-600">
                              <Clock className="h-4 w-4" />
                              <span>Overdue since {formatDate(project.endDate)}</span>
                            </div>
                          )}
                          {blockedTasks > 0 && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>{blockedTasks} blocked task{blockedTasks > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>Manager: {project.manager.fullName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Deliverables & Documents
              </CardTitle>
              <CardDescription>Project documentation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>Progress: {project.progress}%</span>
                        </div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Details */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Client Details
            </CardTitle>
            <CardDescription>Project client information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => p.client).map((project) => (
                <div key={project.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{project.client?.fullName}</h4>
                      <div className="text-sm text-gray-600 mb-2">Project: {project.name}</div>
                      {project.client?.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>{project.client.email}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {projects.filter(p => p.client).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No client information available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
