"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { getTaskById, updateTask } from "@/lib/actions/task.actions";
import { getAllUsers } from "@/lib/actions/employee.actions";
import { Task } from "@/lib/types/task.types";

export default function ManagerTaskEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const taskId = parseInt(params.id as string);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<{ id: number; fullName: string }[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    assigneeId: "",
    projectId: "",
    dueDate: "",
    startDate: "",
    estimatedHours: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await getTaskById(taskId);
        if (response && response.success) {
          setTask(response.data);
          setFormData({
            title: response.data.title || "",
            description: response.data.description || "",
            status: response.data.status || "",
            priority: response.data.priority || "",
            assigneeId: response.data.assigneeId?.toString() || "",
            projectId: response.data.projectId?.toString() || "",
            dueDate: response.data.dueDate ? response.data.dueDate.split('T')[0] : "",
            startDate: response.data.startDate ? response.data.startDate.split('T')[0] : "",
            estimatedHours: response.data.estimatedHours?.toString() || "",
          });
        } else {
          throw new Error("Failed to load task");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch task";
        toast.error(message);
        router.push("/manager/tasks/all-tasks");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data.map((u) => ({ id: u.id, fullName: u.fullName })));
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/").replace(/\/?$/, "/");
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        
        const res = await fetch(`${baseUrl}projects/get-all-projects?managerId=${user?.id}`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data?.success && Array.isArray(data.data)) {
          setProjects(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    if (taskId && user?.id) {
      fetchTask();
      fetchUsers();
      fetchProjects();
    }
  }, [taskId, router, user?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.description.trim()) e.description = "Description is required";
    if (!formData.projectId) e.projectId = "Project is required";
    if (!formData.assigneeId) e.assigneeId = "Assignee is required";
    if (!formData.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      const updateData: {
        title: string;
        description: string;
        status: "pending" | "in-progress" | "completed" | "blocked" | "cancelled";
        priority: "low" | "medium" | "high" | "urgent";
        assigneeId?: number;
        projectId?: number;
        dueDate?: string;
        startDate?: string;
        estimatedHours?: number;
      } = {
        title: formData.title,
        description: formData.description,
        status: formData.status as "pending" | "in-progress" | "completed" | "blocked" | "cancelled",
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : undefined,
        projectId: formData.projectId ? parseInt(formData.projectId) : undefined,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      };

      const response = await updateTask(taskId, updateData);
      
      if (response && response.success) {
        toast.success("Task updated successfully");
        router.push(`/manager/tasks/${taskId}`);
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update task";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/manager/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Manager", href: "/manager" },
          { label: "Tasks", href: "/manager/tasks/all-tasks" },
          { label: task.title, href: `/manager/tasks/${taskId}` },
          { label: "Edit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
              <p className="text-gray-600">Update task information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Update the task information below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter task title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId">Project *</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => handleInputChange("projectId", value)}
                  >
                    <SelectTrigger className={errors.projectId ? "border-red-500" : ""}>
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
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.projectId}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter task description"
                  rows={5}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigneeId">Assigned To *</Label>
                  <Select
                    value={formData.assigneeId}
                    onValueChange={(value) => handleInputChange("assigneeId", value)}
                  >
                    <SelectTrigger className={errors.assigneeId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assigneeId && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.assigneeId}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                    placeholder="Enter hours"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className={errors.dueDate ? "border-red-500" : ""}
                  />
                  {errors.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.dueDate}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
