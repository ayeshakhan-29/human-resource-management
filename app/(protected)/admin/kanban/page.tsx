"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAllTasks, changeTaskStatus } from "@/lib/actions/task.actions";
import { getAllProjects } from "@/lib/actions/project.action";
import { Task, TaskStatus } from "@/lib/types/task.types";
import { Project } from "@/lib/types/project.types";
import {
  Loader2,
  Calendar,
  User,
  FolderKanban,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanTaskCard } from "@/components/kanban/KanbanTaskCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Task status columns configuration
const COLUMNS: { id: TaskStatus; title: string; color: string; icon: React.ElementType }[] = [
  { id: "pending", title: "Pending", color: "bg-slate-100 border-slate-200", icon: Clock },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50 border-blue-200", icon: Loader2 },
  { id: "in-review", title: "In Review", color: "bg-purple-50 border-purple-200", icon: AlertCircle },
  { id: "completed", title: "Completed", color: "bg-green-50 border-green-200", icon: CheckCircle2 },
  { id: "blocked", title: "Blocked", color: "bg-red-50 border-red-200", icon: XCircle },
  { id: "cancelled", title: "Cancelled", color: "bg-gray-100 border-gray-200", icon: XCircle },
];

interface TaskWithProject extends Task {
  projectName?: string;
}

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all projects for filter
        const projectsRes = await getAllProjects(1, 100);
        if (projectsRes.success) {
          setProjects(projectsRes.data);
        }

        // Fetch all tasks
        const tasksRes = await getAllTasks(1, 1000);
        if (tasksRes.success) {
          const tasksWithProjectNames = tasksRes.data.map((task) => ({
            ...task,
            projectName: task.project?.name || "No Project",
          }));
          setTasks(tasksWithProjectNames);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load tasks and projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tasks based on selected project and search term
  const filteredTasks = tasks.filter((task) => {
    const matchesProject = selectedProject === "all" || task.projectId?.toString() === selectedProject;
    const matchesSearch =
      searchTerm === "" ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Group tasks by status
  const tasksByColumn = COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, TaskWithProject[]>);

  // Get active task for drag overlay
  const activeTask = activeId ? tasks.find((t) => t.id.toString() === activeId) : null;

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeContainer = COLUMNS.find((col) =>
      tasksByColumn[col.id].some((t) => t.id.toString() === activeId)
    )?.id;

    const overContainer = COLUMNS.find((col) => col.id === overId)?.id ||
      COLUMNS.find((col) =>
        tasksByColumn[col.id].some((t) => t.id.toString() === overId)
      )?.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move task to new container optimistically
    setTasks((prev) => {
      const activeItems = tasksByColumn[activeContainer];
      const overItems = tasksByColumn[overContainer];
      const activeIndex = activeItems.findIndex((t) => t.id.toString() === activeId);
      const overIndex = overItems.findIndex((t) => t.id.toString() === overId);

      let newIndex;
      if (overId in tasksByColumn) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem = over && active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((t) =>
        t.id.toString() === activeId ? { ...t, status: overContainer } : t
      );
    });
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeContainer = COLUMNS.find((col) =>
      tasksByColumn[col.id].some((t) => t.id.toString() === activeId)
    )?.id;

    const overContainer = COLUMNS.find((col) => col.id === overId)?.id ||
      COLUMNS.find((col) =>
        tasksByColumn[col.id].some((t) => t.id.toString() === overId)
      )?.id;

    if (!activeContainer || !overContainer) return;

    // If dropped in a different column, update the status
    if (activeContainer !== overContainer) {
      try {
        setIsUpdating(true);
        const taskId = parseInt(activeId);
        await changeTaskStatus(taskId, { status: overContainer });
        toast.success(`Task moved to ${overContainer.replace("-", " ")}`);
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast.error("Failed to update task status");
        // Revert the change by refetching
        const tasksRes = await getAllTasks(1, 1000);
        if (tasksRes.success) {
          setTasks(tasksRes.data.map((task) => ({
            ...task,
            projectName: task.project?.name || "No Project",
          })));
        }
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Drop animation configuration
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Projects", href: "/admin/projects/all-projects" },
            { label: "Project Board" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Loading project board...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Projects", href: "/admin/projects/all-projects" },
          { label: "Project Board" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Project Board</h1>
              <p className="text-muted-foreground">
                Drag and drop tasks to update their status across all projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              )}
              <Badge variant="outline" className="text-sm">
                {filteredTasks.length} Tasks
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 min-w-max h-full pb-4">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id]}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <KanbanTaskCard
                task={activeTask}
                getPriorityColor={getPriorityColor}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}
