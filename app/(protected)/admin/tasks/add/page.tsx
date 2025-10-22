"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTask } from "@/lib/actions/task.actions";
import { CreateTaskRequest } from "@/lib/types/task.types";
import { toast } from "sonner";
import { getAllUsers } from "@/lib/actions/employee.actions";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks, Save, AlertCircle } from "lucide-react";

export default function AddTaskPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    managerId: "",
    assigneePosition: "",
    managerPosition: "",
    dueDate: "",
    priority: "medium" as const,
    status: "pending" as const,
    estimatedHours: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: number; fullName: string; position?: string }[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          const mapped = response.data.map((u) => ({ id: u.id, fullName: u.fullName, position: u.userInfo?.position }));
          setUsers(mapped);
          const posSet = new Set<string>();
          mapped.forEach((u) => { if (u.position) posSet.add(u.position); });
          setPositions(Array.from(posSet));
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users. Please refresh the page.");
      }
    };

    const fetchProjects = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const res = await fetch(`${baseUrl}projects/get-all-projects`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data?.success && Array.isArray(data.data)) {
          setProjects(data.data);
        } else {
          throw new Error(data?.message || "Failed to load projects");
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects. Please refresh the page.");
      }
    };

    fetchUsers();
    fetchProjects();
  }, []);
  const handleChange = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.projectId) e.project = "Project is required";
    if (!form.assigneeId) e.assignee = "Assignee is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: hook up to backend action
    try {
      setLoading(true);

      // Prepare the request payload
      const taskData: CreateTaskRequest = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate,
        projectId: form.projectId ? parseInt(form.projectId) : undefined,
        assigneeId: form.assigneeId ? parseInt(form.assigneeId) : undefined,
        managerId: form.managerId ? parseInt(form.managerId) : undefined,
        estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : undefined
      };

      // Call the API to create the task
      const response = await createTask(taskData);

      toast.success("Task created successfully");

      // Navigate back to the tasks list
      router.push("/admin/tasks/all-tasks");
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setForm({
      title: "",
      description: "",
      projectId: "",
      assigneeId: "",
      managerId: "",
      assigneePosition: "",
      managerPosition: "",
      dueDate: "",
      priority: "medium",
      status: "pending",
      estimatedHours: ""
    });
    setErrors({});
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tasks", href: "/admin/tasks" },
          { label: "Add Task" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Add Task</h1>
          <p className="text-gray-600">Create a new task and assign it to a team member</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Task Details
              </CardTitle>
              <CardDescription>Essential information about the task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter task title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.title}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId">Project *</Label>
                  <Select value={form.projectId} onValueChange={(v) => handleChange("projectId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.projectId && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.projectId}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the task, goals and acceptance criteria"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.description}</div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigneeId">Assignee *</Label>
                  <Select
                    value={form.assigneeId}
                    onValueChange={(v) => handleChange("assigneeId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => !form.assigneePosition || form.assigneePosition === "all" || u.position === form.assigneePosition)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}{user.position ? ` — ${user.position}` : ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.assigneeId && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.assigneeId}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerId">Manager *</Label>
                  <Select
                    value={form.managerId}
                    onValueChange={(v) => handleChange("managerId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => !form.managerPosition || form.managerPosition === "all" || u.position === form.managerPosition)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}{user.position ? ` — ${user.position}` : ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.managerId && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.managerId}</div>
                  )}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    className={errors.dueDate ? "border-red-500" : ""}
                  />
                  {errors.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.dueDate}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
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
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    value={form.estimatedHours}
                    onChange={(e) => handleChange("estimatedHours", e.target.value)}
                    placeholder="Enter estimated hours"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onReset} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}