"use client";

import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/header";
import { getAllTasks } from "@/lib/actions/task.actions";
import { Task, TaskStatus, TaskPriority } from "@/lib/types/task.types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import { useRouter } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListChecks, Plus, Search, Filter, Calendar, Users, BarChart3 } from "lucide-react";

interface TaskItem {
  id: string | number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  project: string;
}

export default function ManagerAllTasksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, search, assigneeFilter]);

  // Fetch tasks from backend (filtered for manager's projects)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const filters: Record<string, string> = {};
        
        if (statusFilter !== "all") filters.status = statusFilter;
        if (priorityFilter !== "all") filters.priority = priorityFilter;
        if (search) filters.search = search;
        
        // Add manager filter - only show tasks from projects managed by this user
        filters.managerId = user?.id || "";
        filters.sortBy = 'createdAt';
        filters.sortOrder = 'DESC';
        
        const response = await getAllTasks(page, limit, filters);
        
        // Transform backend tasks to match the TaskItem interface
        const transformedTasks = response.data.map((task: Task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          assignee: task.assignee?.fullName || "Unassigned",
          dueDate: task.dueDate || new Date().toISOString(),
          project: task.project?.name || "No Project",
        }));
        
        setTasks(transformedTasks);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.totalItems || transformedTasks.length);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Failed to load tasks, please try again later!!");
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchTasks();
    }
  }, [page, limit, statusFilter, priorityFilter, search, user?.id]);
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    return { total, completed, inProgress, pending, blocked };
  }, [tasks]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.assignee));
    return Array.from(set);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesAssignee = assigneeFilter === "all" || t.assignee === assigneeFilter;
      return matchesAssignee;
    });
  }, [tasks, assigneeFilter]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const statusBadge = (status: TaskItem["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
      case "blocked":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const priorityBadge = (priority: TaskItem["priority"]) => {
    switch (priority) {
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

  const handleNewTask = () => {
    router.push("/manager/tasks/add");
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Manager", href: "/manager" },
          { label: "Task Management", href: "/manager/tasks" },
          { label: "All Tasks" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">My Team&#39;s Tasks</h1>
          <p className="text-gray-600">Manage tasks from projects you oversee</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Tasks</CardTitle>
              <ListChecks className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalItems}</div>
              <p className="text-xs text-blue-600">In your projects</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
              <p className="text-xs text-green-600">Done this period</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">In Progress</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.inProgress}</div>
              <p className="text-xs text-yellow-600">Currently active</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <p className="text-xs text-gray-600">Awaiting start</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Blocked</CardTitle>
              <Filter className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.blocked}</div>
              <p className="text-xs text-red-600">Need attention</p>
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
            <CardDescription>Filter tasks in your managed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, description, project, assignee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
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

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Team Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {assignees.map((a, index) => (
                    <SelectItem key={`${a}-${index}`} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="w-full sm:w-auto" onClick={handleNewTask}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Tasks</CardTitle>
            <CardDescription>
              {loading
                ? "Loading tasks..."
                : `Showing ${filtered.length} items on this page • ${totalItems} total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Assignee</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        Loading tasks...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No tasks found in your managed projects.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow 
                        key={t.id} 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => router.push(`/manager/tasks/${t.id}`)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{t.title}</span>
                            <span className="text-sm text-gray-600 line-clamp-1">{t.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>{t.project}</TableCell>
                        <TableCell>{t.assignee}</TableCell>
                        <TableCell>{formatDate(t.dueDate)}</TableCell>
                        <TableCell>{priorityBadge(t.priority as "low" | "medium" | "high" | "urgent")}</TableCell>
                        <TableCell>{statusBadge(t.status as "pending" | "in-progress" | "completed" | "blocked")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages} • {totalItems} total</div>
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
      </div>
    </>
  );
}