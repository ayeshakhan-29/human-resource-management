"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ListChecks, Save, AlertCircle } from "lucide-react";

export default function AddTaskPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.project.trim()) e.project = "Project is required";
    if (!form.assignee.trim()) e.assignee = "Assignee is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: hook up to backend action
    console.log("Create task payload:", form);
    alert("Task created successfully!");
  };

  const onReset = () => {
    setForm({ title: "", description: "", project: "", assignee: "", dueDate: "", priority: "medium", status: "pending" });
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
                  <Label htmlFor="project">Project *</Label>
                  <Input
                    id="project"
                    value={form.project}
                    onChange={(e) => handleChange("project", e.target.value)}
                    placeholder="e.g., Website Redesign"
                    className={errors.project ? "border-red-500" : ""}
                  />
                  {errors.project && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.project}</div>
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
                  <Label htmlFor="assignee">Assignee *</Label>
                  <Input
                    id="assignee"
                    value={form.assignee}
                    onChange={(e) => handleChange("assignee", e.target.value)}
                    placeholder="Who will work on this task?"
                    className={errors.assignee ? "border-red-500" : ""}
                  />
                  {errors.assignee && (
                    <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{errors.assignee}</div>
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
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onReset} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}