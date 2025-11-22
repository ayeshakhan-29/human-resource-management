"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllTasks } from "@/lib/actions/task.actions";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Eye, 
  Users,
  Calendar,
  Loader2,
  ListChecks,
  Plus
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
  };
  manager?: {
    id: number;
    fullName: string;
  };
  teamMembers?: { id: number; fullName?: string }[];
  tasks?: { status: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function ManagerProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [tasksCountMap, setTasksCountMap] = useState<Record<number, number>>({});

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");
      
      // Fetch projects where user is the manager
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
        const projs: Project[] = data.data;
        const ids = projs.map(p => p.id);
        const results = await Promise.all(ids.map(async (id) => {
          const resp = await getAllTasks(1, 200, { projectId: String(id) });
          if (resp?.success && Array.isArray(resp.data)) {
            const tasks = resp.data as { status: string }[];
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === "completed").length;
            const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
            return { id, total, percent };
          }
          return { id, total: 0, percent: 0 };
        }));
        const prog: Record<number, number> = {};
        const counts: Record<number, number> = {};
        for (const r of results) {
          prog[r.id] = r.percent;
          counts[r.id] = r.total;
        }
        setProgressMap(prog);
        setTasksCountMap(counts);
      } else {
        throw new Error(data?.message || "Failed to load projects");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
                         project.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const calculateProgress = (project: Project) => {
    if (progressMap[project.id] !== undefined) return progressMap[project.id];
    const tasks = project.tasks || [];
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading projects...</span>
      </div>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Manager", href: "/manager" },
          { label: "Projects" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">Projects you&#39;re managing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{projects.length}</div>
              <p className="text-xs text-blue-600">Under your management</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active</CardTitle>
              <ListChecks className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {projects.filter(p => p.status === "active" || p.status === "in-progress").length}
              </div>
              <p className="text-xs text-green-600">Currently running</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Completed</CardTitle>
              <ListChecks className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {projects.filter(p => p.status === "completed").length}
              </div>
              <p className="text-xs text-purple-600">Successfully finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">On Hold</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {projects.filter(p => p.status === "on-hold").length}
              </div>
              <p className="text-xs text-yellow-600">Temporarily paused</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>Filter and search your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by project name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground text-center">
                    {search || statusFilter !== "all"
                      ? "No projects match your current filters."
                      : "You haven&#39;t been assigned as a manager to any projects yet."}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || "No description"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{calculateProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {(tasksCountMap[project.id] ?? project.tasks?.length ?? 0)} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {project.teamMembers?.length || 0} members
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>

                    {project.client && (
                      <div className="text-sm">
                        <span className="text-gray-600">Client: </span>
                        <span className="font-medium">{project.client.fullName}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/manager/projects/${project.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/manager/tasks/all-tasks?projectId=${project.id}`)}
                      >
                        <ListChecks className="mr-2 h-4 w-4" />
                        Tasks
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}