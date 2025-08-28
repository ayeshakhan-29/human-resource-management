"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays, ListChecks } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  dueDate: string; // ISO
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "blocked";
}

const mockTasks: TaskItem[] = [
  { id: "1", title: "Design Landing Page", dueDate: "2025-09-10", priority: "high", status: "in-progress" },
  { id: "2", title: "API Authentication", dueDate: "2025-09-05", priority: "urgent", status: "pending" },
  { id: "3", title: "Marketing Copy Q4", dueDate: "2025-08-18", priority: "medium", status: "completed" },
  { id: "4", title: "Database Backups", dueDate: "2025-09-02", priority: "high", status: "blocked" },
  { id: "5", title: "App Store Assets", dueDate: "2025-09-20", priority: "low", status: "pending" },
];

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getMonthMatrix(viewDate: Date) {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const startWeekday = (start.getDay() + 6) % 7; // make Monday=0
  const totalDays = end.getDate();

  const days: Array<{ date: Date; inMonth: boolean }>[] = [];
  let current = new Date(start);
  current.setDate(current.getDate() - startWeekday);

  for (let week = 0; week < 6; week++) {
    const row: Array<{ date: Date; inMonth: boolean }> = [];
    for (let day = 0; day < 7; day++) {
      const d = new Date(current);
      row.push({ date: d, inMonth: d.getMonth() === viewDate.getMonth() });
      current.setDate(current.getDate() + 1);
    }
    days.push(row);
  }
  return days;
}

export default function TaskCalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());

  const monthMatrix = useMemo(() => getMonthMatrix(viewDate), [viewDate]);
  const monthLabel = useMemo(() => viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }), [viewDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    for (const t of mockTasks) {
      const key = new Date(t.dueDate).toDateString();
      map.set(key, [...(map.get(key) || []), t]);
    }
    return map;
  }, []);

  const priorityBadge = (p: TaskItem["priority"]) => {
    switch (p) {
      case "low":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="secondary">{p}</Badge>;
    }
  };

  const statusDot = (s: TaskItem["status"]) => {
    const color = s === "completed" ? "bg-green-500" : s === "in-progress" ? "bg-blue-500" : s === "blocked" ? "bg-red-500" : "bg-gray-400";
    return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tasks", href: "/admin/tasks" },
          { label: "Task Calendar" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Calendar</h1>
            <p className="text-gray-600">View tasks by due date</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewDate(addMonths(viewDate, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[160px] text-center font-medium">{monthLabel}</div>
            <Button variant="outline" onClick={() => setViewDate(addMonths(viewDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendar
            </CardTitle>
            <CardDescription>Tasks grouped by due date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <div key={d} className="text-xs font-medium text-gray-600 text-center py-2">
                  {d}
                </div>
              ))}
              {monthMatrix.map((week, wi) => (
                <div key={wi} className="contents">
                  {week.map(({ date, inMonth }, di) => {
                    const key = date.toDateString();
                    const items = tasksByDay.get(key) || [];
                    const isToday = new Date().toDateString() === key;
                    return (
                      <div
                        key={di}
                        className={`min-h-28 border rounded-md p-2 flex flex-col gap-1 ${inMonth ? "bg-white" : "bg-gray-50"} ${isToday ? "ring-2 ring-blue-500" : ""}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${inMonth ? "text-gray-800" : "text-gray-400"}`}>
                            {date.getDate()}
                          </span>
                          {items.length > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                              {items.length} task{items.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                          {items.slice(0, 3).map((t) => (
                            <div key={t.id} className="flex items-center gap-2 text-xs truncate">
                              {statusDot(t.status)}
                              <span className="truncate">{t.title}</span>
                              {priorityBadge(t.priority)}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="text-[11px] text-gray-500">+{items.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTasks
                .slice()
                .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
                .filter((t) => {
                  const d = new Date(t.dueDate);
                  const now = new Date();
                  const in7 = new Date();
                  in7.setDate(in7.getDate() + 7);
                  return d >= now && d <= in7;
                })
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      {statusDot(t.status)}
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    {priorityBadge(t.priority)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}