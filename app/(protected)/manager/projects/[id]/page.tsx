"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getAllTasks } from "@/lib/actions/task.actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderKanban,
  Calendar,
  Users,
  ListChecks,
  ArrowLeft,
  Loader2,
  User,
  Building2,
  Clock,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  client?: {
    id: number;
    fullName: string;
    email?: string;
  };
  manager?: {
    id: number;
    fullName: string;
    email?: string;
  };
  teamMembers?: Array<{
    id: number;
    fullName?: string;
    email?: string;
  }>;
  tasks?: Array<{ status: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee?: {
    fullName: string;
  };
}

export default function ProjectViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");

        const response = await fetch(`${baseUrl}projects/get-project-by-id/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        const data = await response.json();
        if (response.ok && data?.success) {
          setProject(data.data);
        } else {
          throw new Error(data?.message || "Failed to load project");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        toast.error("Failed to load project details");
        router.push("/manager/projects");
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const response = await getAllTasks(1, 100, { projectId });
        if (response?.success && Array.isArray(response.data)) {
          setTasks(response.data as Task[]);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setTasksLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
      fetchTasks();
    }
  }, [projectId, router]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "on-hold":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Hold</Badge>;
      case "planning":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Planning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Manager", href: "/manager" },
          { label: "Projects", href: "/manager/projects" },
          { label: project.name },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push("/manager/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        {/* Project Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FolderKanban className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {getStatusBadge(project.status)}
              </div>
              <p className="text-gray-600 mt-2">{project.description || "No description provided"}</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Project Progress</CardTitle>
            <CardDescription className="text-blue-700">Overall completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 font-medium">
                  {taskStats.completed} of {taskStats.total} tasks completed
                </span>
                <span className="font-bold text-blue-900">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="font-medium">{formatDate(project.startDate)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="font-medium">{formatDate(project.endDate)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-medium">
                  {Math.ceil(
                    (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* People Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                People
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.client && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Client
                    </p>
                    <p className="font-medium">{project.client.fullName}</p>
                    {project.client.email && (
                      <p className="text-sm text-gray-600">{project.client.email}</p>
                    )}
                  </div>
                  <Separator />
                </>
              )}
              {project.manager && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Manager
                    </p>
                    <p className="font-medium">{project.manager.fullName}</p>
                    {project.manager.email && (
                      <p className="text-sm text-gray-600">{project.manager.email}</p>
                    )}
                  </div>
                  <Separator />
                </>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members ({project.teamMembers?.length || 0})
                </p>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {project.teamMembers.map((member) => (
                      <div key={member.id} className="text-sm">
                        <p className="font-medium">{member.fullName || "Unknown"}</p>
                        {member.email && <p className="text-gray-600">{member.email}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No team members assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{taskStats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{taskStats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{taskStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{taskStats.blocked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Project Tasks
                </CardTitle>
                <CardDescription>All tasks associated with this project</CardDescription>
              </div>
              <Button onClick={() => router.push(`/manager/tasks/add?projectId=${projectId}`)}>
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ListChecks className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No tasks found for this project</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Assignee</TableHead>
                      <TableHead className="font-semibold">Due Date</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{task.title}</span>
                            <span className="text-sm text-gray-600 line-clamp-1">
                              {task.description}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{task.assignee?.fullName || "Unassigned"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {formatDate(task.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/manager/tasks/${task.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
