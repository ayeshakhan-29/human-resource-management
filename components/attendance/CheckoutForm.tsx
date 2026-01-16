"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { getActiveTasksForCheckout } from "@/lib/actions/attendance.actions";
import { getAuthToken } from "@/lib/auth/token";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  project?: {
    id: number;
    name: string;
  };
}

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: (data: {
    taskId: number;
    taskStatus: "planning" | "in-progress" | "testing" | "blocked" | "completed";
    workNote?: string;
    deliverableLink?: string;
    deliverables?: File[];
  }) => Promise<void>;
}

export function CheckoutForm({
  open,
  onOpenChange,
  onCheckout,
}: CheckoutFormProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deliverableFiles, setDeliverableFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    taskId: "",
    taskStatus: "" as "planning" | "in-progress" | "testing" | "blocked" | "completed" | "",
    workNote: "",
    deliverableLink: "",
  });

  const taskStatusOptions = [
    { value: "planning", label: "Planning" },
    { value: "in-progress", label: "In Progress" },
    { value: "testing", label: "Testing" },
    { value: "blocked", label: "Blocked" },
    { value: "completed", label: "Completed" },
  ];

  // Fetch active tasks when dialog opens
  useEffect(() => {
    if (open) {
      fetchActiveTasks();
    } else {
      // Reset form when dialog closes
      setFormData({
        taskId: "",
        taskStatus: "",
        workNote: "",
        deliverableLink: "",
      });
      setDeliverableFiles([]);
    }
  }, [open]);

  const fetchActiveTasks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const { data, error } = await getActiveTasksForCheckout(token || undefined);

      if (error) {
        toast.error("Failed to load tasks", {
          description: error,
        });
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching active tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.taskId || !formData.taskStatus) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate work note length
    if (formData.workNote && formData.workNote.length > 120) {
      toast.error("Work note must be 120 characters or less");
      return;
    }

    // Validate deliverable link is a URL if provided
    if (formData.deliverableLink) {
      try {
        new URL(formData.deliverableLink);
      } catch {
        toast.error("Deliverable link must be a valid URL");
        return;
      }
    }

    try {
      setSubmitting(true);
      await onCheckout({
        taskId: parseInt(formData.taskId),
        taskStatus: formData.taskStatus as "planning" | "in-progress" | "testing" | "blocked" | "completed",
        workNote: formData.workNote || undefined,
        deliverableLink: formData.deliverableLink || undefined,
        deliverables: deliverableFiles.length > 0 ? deliverableFiles : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Check Out</DialogTitle>
          <DialogDescription>
            Please provide details about your work today (20-30 seconds)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Selection */}
          <div className="space-y-2">
            <Label htmlFor="task">
              Task <span className="text-red-500">*</span>
            </Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select
                value={formData.taskId}
                onValueChange={(value) =>
                  setFormData({ ...formData, taskId: value })
                }
                required
              >
                <SelectTrigger id="task">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.length === 0 ? (
                    <SelectItem value="no-tasks" disabled>
                      No assigned tasks found
                    </SelectItem>
                  ) : (
                    tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                        {task.project && ` - ${task.project.name}`}
                        {task.status && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({task.status})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Task Status */}
          <div className="space-y-2">
            <Label htmlFor="taskStatus">
              Task Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.taskStatus}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  taskStatus: value as typeof formData.taskStatus,
                })
              }
              required
            >
              <SelectTrigger id="taskStatus">
                <SelectValue placeholder="Select task status" />
              </SelectTrigger>
              <SelectContent>
                {taskStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Note */}
          <div className="space-y-2">
            <Label htmlFor="workNote">
              Work Note <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="workNote"
              type="text"
              placeholder="Brief note about your work (max 120 characters)"
              value={formData.workNote}
              onChange={(e) =>
                setFormData({ ...formData, workNote: e.target.value })
              }
              maxLength={120}
            />
            <p className="text-xs text-gray-500">
              {formData.workNote.length}/120 characters
            </p>
          </div>

          {/* Deliverable Files */}
          <div className="space-y-2">
            <Label htmlFor="deliverables">
              Deliverable Files <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="deliverables"
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setDeliverableFiles(files);
              }}
            />
            {deliverableFiles.length > 0 && (
              <div className="space-y-1">
                {deliverableFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeliverableFiles(
                          deliverableFiles.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deliverable Link */}
          <div className="space-y-2">
            <Label htmlFor="deliverableLink">
              Deliverable Link <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="deliverableLink"
              type="url"
              placeholder="https://github.com/..."
              value={formData.deliverableLink}
              onChange={(e) =>
                setFormData({ ...formData, deliverableLink: e.target.value })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Out...
                </>
              ) : (
                "Check Out"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

