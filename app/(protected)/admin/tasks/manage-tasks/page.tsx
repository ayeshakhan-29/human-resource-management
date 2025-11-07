"use client";

import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/header";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllTasks, updateTask, deleteTask } from "@/lib/actions/task.actions";
import { getAllUsers } from "@/lib/actions/employee.actions";
import { Task, TasksResponse } from "@/lib/types/task.types";
import { tasks as centralizedTasks, projects } from "@/lib/project-task-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { ListChecks, Plus, Search, Filter, CheckCircle, AlertCircle, Calendar, Users, Edit, Save, Trash2 } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string;
  dueDate: string;
  project: string;
  subtasks: Array<{ id: string; title: string; done: boolean }>;
}


// Use centralized tasks and projects
const getMockTasks = (selectedProjectId?: string): TaskItem[] => {
  const allTasks = projects.flatMap(project =>
    project.tasks.map(task => ({
      id: task.id,
      title: task.name,
      description: '', // No description in centralized data
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      project: project.name,
      subtasks: [],
    }))
  );

  // If a specific project is selected, filter tasks for that project
  if (selectedProjectId) {
    return allTasks.filter(task => {
      const project = projects.find(p => p.name === task.project);
      return project && project.id === selectedProjectId;
    });
  }

  return allTasks;
};

export default function ManageTasksPage() {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [selected, setSelected] = useState<TaskItem | null>(null);
  const [editing, setEditing] = useState<TaskItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ id: number; fullName: string }[]>([]);

  // Fetch tasks and users on mount or when selectedProject changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse: TasksResponse = await getAllTasks(1, 1000, selectedProject ? { projectName: selectedProject.name } : undefined);
        if (tasksResponse.success) {
          setTasks(tasksResponse.data);
        }
        const usersResponse = await getAllUsers();
        if (usersResponse.success) {
          setUsers(usersResponse.data);
        }
      } catch (error) {
        toast.error("Failed to load data, please try again later!!");
      }
    };
    fetchData();
  }, [selectedProject]);

  // Check if we're editing tasks for a specific project
  useEffect(() => {
    const projectData = localStorage.getItem('selectedProjectForTasks');
    if (projectData) {
      try {
        const project = JSON.parse(projectData);
        setSelectedProject(project);
        // Clear localStorage after reading
        localStorage.removeItem('selectedProjectForTasks');
      } catch (error) {
        console.error('Error parsing project data:', error);
      }
    }
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    return { total, completed, inProgress, pending, blocked };
  }, [tasks]);

  const assignees = useMemo(() => {
    return ['Unassigned', ...users.map(u => u.fullName)];
  }, [users]);

  const filtered = useMemo(() => {
    // Convert backend Task[] to TaskItem[] for display
    const taskItems: TaskItem[] = tasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.fullName || 'Unassigned',
      dueDate: task.dueDate || '',
      project: task.project?.name || 'No Project',
      subtasks: [],
    }));

    // Filter by selected project if one is selected
    const projectFiltered = selectedProject
      ? taskItems.filter(t => t.project === selectedProject.name)
      : taskItems;

    return projectFiltered.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.project.toLowerCase().includes(search.toLowerCase()) ||
        t.assignee.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === "all" || t.assignee === assigneeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, selectedProject]);

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
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const saveEdits = async () => {
    if (!editing) return;
    try {
      // Find the user id for the selected assignee name
      const assigneeUser = users.find(u => u.fullName === editing.assignee);
      const assigneeId = assigneeUser ? assigneeUser.id : undefined;

      const updatedTask = await updateTask(parseInt(editing.id), {
        title: editing.title,
        description: editing.description,
        status: editing.status,
        priority: editing.priority,
        dueDate: editing.dueDate,
        assigneeId: assigneeId,
      });

      // Update the task in the local tasks state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === parseInt(editing.id) ? updatedTask.data : task
        )
      );

      // Convert Task to TaskItem for display
      const taskItem: TaskItem = {
        id: updatedTask.data.id.toString(),
        title: updatedTask.data.title,
        description: updatedTask.data.description || '',
        status: updatedTask.data.status,
        priority: updatedTask.data.priority,
        assignee: updatedTask.data.assignee?.fullName || '',
        dueDate: updatedTask.data.dueDate || '',
        project: updatedTask.data.project?.name || '',
        subtasks: [],
      };
      setSelected(taskItem);
      setEditing(null);
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const onSelect = (t: TaskItem) => {
    setSelected(t);
    setEditing({ ...t });
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(parseInt(id));

      // Remove the task from the local tasks state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== parseInt(id)));

      if (selected?.id === id) {
        setSelected(null);
        setEditing(null);
      }
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const router = useRouter();
  const handleNewTask = () => {

    router.push("/admin/tasks/add");
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tasks", href: "/admin/tasks" },
          { label: "Manage Tasks" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedProject ? `Manage Tasks - ${selectedProject.name}` : 'Manage Tasks'}
          </h1>
          <p className="text-gray-600">
            {selectedProject ? `Track, update, and oversee tasks for ${selectedProject.name}` : 'Track, update, and oversee all tasks'}
          </p>
          {selectedProject && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProject(null)}
              >
                View All Tasks
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin/projects/all-projects'}
              >
                Back to Projects
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total</CardTitle>
              <ListChecks className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-600">All tasks</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
              <p className="text-xs text-green-600">Done</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">In Progress</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.inProgress}</div>
              <p className="text-xs text-yellow-600">Ongoing</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <p className="text-xs text-gray-600">Queued</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>Find tasks by attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search title, project, assignee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>


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
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="w-full sm:w-auto " onClick={handleNewTask}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  {selectedProject ? `Managing tasks for project: ${selectedProject.name}` : 'Select a task to manage'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Assignee</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((t) => (
                        <TableRow
                          key={t.id}
                          className={`cursor-pointer hover:bg-gray-50 ${selected?.id === t.id ? "bg-blue-50" : ""}`}
                          onClick={() => onSelect(t)}
                        >
                          <TableCell className="font-medium">{t.title}</TableCell>
                          <TableCell>{t.assignee}</TableCell>
                          <TableCell>{statusBadge(t.status)}</TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            No tasks found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{selected.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        {statusBadge(selected.status)}
                        {priorityBadge(selected.priority)}
                        <Badge variant="outline">{selected.project || 'No Project'}</Badge>
                      </div>
                      <CardDescription className="text-base">
                        {selected.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing({ ...selected })}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTask(selected.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Assignee:</span>
                      <div className="font-medium">{selected.assignee}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <div className="font-medium">{formatDate(selected.dueDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span>
                      <div className="font-medium capitalize">{selected.priority}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium capitalize">{selected.status}</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {editing && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Assignee</Label>
                          {/* <Input
                            value={editing.assignee}
                            onChange={(e) => setEditing({ ...editing, assignee: e.target.value })}
                          /> */}
                          <Select value={editing.assignee} onValueChange={(v) => setEditing({ ...editing, assignee: v })}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                              <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Unassigned">Unassigned</SelectItem>
                              {assignees.filter(a => a !== 'Unassigned').map((a) => (
                                <SelectItem key={a} value={a}>
                                  {a}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                        </div>

                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={editing.description}
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={editing.dueDate}
                            onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={editing.priority}
                            onValueChange={(v) => setEditing({ ...editing, priority: v as TaskItem["priority"] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={editing.status}
                            onValueChange={(v) => setEditing({ ...editing, status: v as TaskItem["status"] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                        <Button onClick={saveEdits}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  )}

                  {!editing && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Subtasks</h4>
                      <div className="space-y-2">
                        {selected.subtasks.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={s.done} readOnly />
                              <span className={s.done ? "line-through text-gray-500" : ""}>{s.title}</span>
                            </div>
                          </div>
                        ))}
                        {selected.subtasks.length === 0 && (
                          <div className="text-sm text-gray-500">No subtasks</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ListChecks className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Task Selected</h3>
                  <p>Select a task from the list to view and manage it</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}  