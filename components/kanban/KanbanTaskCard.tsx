"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types/task.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  FolderKanban,
  GripVertical,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface KanbanTaskCardProps {
  task: Task;
  getPriorityColor: (priority: string) => string;
  isOverlay?: boolean;
}

export function KanbanTaskCard({ task, getPriorityColor, isOverlay = false }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "in-progress":
        return <Clock className="h-3 w-3 text-blue-600" />;
      case "blocked":
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const isOverdue = date < new Date() && task.status !== "completed";
      return {
        text: format(date, "MMM d"),
        isOverdue,
      };
    } catch {
      return null;
    }
  };

  const dueDate = formatDueDate(task.dueDate);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30"
      >
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="h-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isOverlay ? "cursor-grabbing rotate-2 scale-105 shadow-xl" : "cursor-grab hover:shadow-md"} transition-shadow`}
    >
      <Card className={`border ${isOverlay ? "border-blue-400 shadow-lg" : "border-gray-200"} bg-white`}>
        <CardHeader className="p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
            <div className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          {/* Task Meta Info */}
          <div className="flex flex-col gap-2">
            {/* Priority & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </Badge>
              {getStatusIcon()}
            </div>

            {/* Project Name */}
            {task.project && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderKanban className="h-3 w-3" />
                <span className="truncate">{task.project.name}</span>
              </div>
            )}

            {/* Assignee & Due Date */}
            <div className="flex items-center justify-between pt-1">
              {task.assignee ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    {task.assignee.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {task.assignee.fullName.split(" ")[0]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Unassigned</span>
                </div>
              )}

              {dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${
                    dueDate.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{dueDate.text}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {task.progress > 0 && (
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      task.progress === 100
                        ? "bg-green-500"
                        : task.progress >= 50
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
