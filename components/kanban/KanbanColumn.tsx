"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/lib/types/task.types";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  icon: React.ElementType;
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  getPriorityColor: (priority: string) => string;
}

export function KanbanColumn({ column, tasks, getPriorityColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-w-80 max-w-80 rounded-lg border-2 transition-colors ${
        column.color
      } ${isOver ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-inherit">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white/80">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm">{column.title}</h3>
        </div>
        <Badge variant="secondary" className="bg-white/80">
          {tasks.length}
        </Badge>
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1 p-3">
        <SortableContext
          items={tasks.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 min-h-[100px]">
            {tasks.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                getPriorityColor={getPriorityColor}
              />
            ))}
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm border-2 border-dashed border-gray-300 rounded-lg">
                <Icon className="h-8 w-8 mb-2 opacity-50" />
                <p>No tasks</p>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
