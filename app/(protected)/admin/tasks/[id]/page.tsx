
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {   AlertCircle } from "lucide-react";

import {
  getTaskById,
  updateTask,
  changeTaskStatus,
} from "@/lib/actions/task.actions";
import {
  Task,
  TaskStatus,
  TaskPriority,
  UpdateTaskRequest,
  ChangeTaskStatusRequest,
} from "@/lib/types/task.types";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<UpdateTaskRequest>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assigneeId: undefined,
    projectId: undefined,
  });

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await getTaskById(taskId);
        setTask(response.data);
        
        // Initialize form data with task values
        setFormData({
          title: response.data.title,
          description: response.data.description || "",
          status: response.data.status,
          priority: response.data.priority,
          dueDate: response.data.dueDate || "",
          assigneeId: response.data.assigneeId,
          projectId: response.data.projectId,
        });
      } catch (error) {
        console.error("Failed to fetch task:", error);
       
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, toast]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle status change
  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      setUpdating(true);
      const statusData: ChangeTaskStatusRequest = {
        status: newStatus,
      };
      
      const response = await changeTaskStatus(taskId, statusData);
      setTask(response.data);
      
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update task status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const response = await updateTask(taskId, formData);
      setTask(response.data);
      setEditing(false);
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    // Reset form data to current task values
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || "",
        assigneeId: task.assigneeId,
        projectId: task.projectId,
      });
    }
    setEditing(false);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "PPP");
  };

  if (loading) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Tasks", href: "/admin/tasks/all-tasks" },
            { label: "Task Details" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading task details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Tasks", href: "/admin/tasks/all-tasks" },
            { label: "Task Details" },
          ]}
        />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Task Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested task could not be found or you don&apos;t have permission to view it.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/admin/tasks/all-tasks")}>
                Back to All Tasks
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tasks", href: "/admin/tasks/all-tasks" },
          { label: "Task Details" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editing ? "Edit Task" : task.title}
            </h1>
            <p className="text-gray-600">
              {task.project ? `Project: ${task.project.name}` : "No Project"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/tasks/all-tasks")}
            >
              Back to All Tasks
            </Button>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Task</Button>
            )}
          </div>
        </div>

          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Task Details</span>
                    <div className="flex gap-2">
                      <Badge
                        className={getStatusBadgeColor(task.status)}
                      >
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </Badge>
                      <Badge
                        className={getPriorityBadgeColor(task.priority)}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Description</h3>
                    <p className="mt-1 text-gray-600">
                      {task.description || "No description provided"}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Assignee</h3>
                      <p className="mt-1 text-gray-600">
                        {task.assignee
                          ? task.assignee.fullName
                          : "Unassigned"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Project</h3>
                      <p className="mt-1 text-gray-600">
                        {task.project ? task.project.name : "No Project"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Due Date</h3>
                      <p className="mt-1 text-gray-600">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Created By</h3>
                      <p className="mt-1 text-gray-600">
                        {task.creator ? task.creator.fullName : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Created At</h3>
                      <p className="mt-1 text-gray-600">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Last Updated</h3>
                      <p className="mt-1 text-gray-600">
                        {formatDate(task.updatedAt)}
                      </p>
                    </div>

                    {task.completedDate && (
                      <div>
                        <h3 className="font-semibold text-gray-700">
                          Completed Date
                        </h3>
                        <p className="mt-1 text-gray-600">
                          {formatDate(task.completedDate)}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-700">Progress</h3>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {task.progress}% complete
                      </p>
                    </div>
                  </div>

                  
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Change Status</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant={task.status === "pending" ? "default" : "outline"}
                        onClick={() => handleStatusChange("pending")}
                        disabled={updating || task.status === "pending"}
                        className="justify-start"
                      >
                        Pending
                      </Button>
                      <Button
                        variant={task.status === "in-progress" ? "default" : "outline"}
                        onClick={() => handleStatusChange("in-progress")}
                        disabled={updating || task.status === "in-progress"}
                        className="justify-start"
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={task.status === "completed" ? "default" : "outline"}
                        onClick={() => handleStatusChange("completed")}
                        disabled={updating || task.status === "completed"}
                        className="justify-start"
                      >
                        Completed
                      </Button>
                      <Button
                        variant={task.status === "blocked" ? "default" : "outline"}
                        onClick={() => handleStatusChange("blocked")}
                        disabled={updating || task.status === "blocked"}
                        className="justify-start"
                      >
                        Blocked
                      </Button>
                      <Button
                        variant={task.status === "cancelled" ? "default" : "outline"}
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={updating || task.status === "cancelled"}
                        className="justify-start"
                      >
                        Cancelled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comments section could be added here */}
          </>
        
      </div>
    </>
  );
}