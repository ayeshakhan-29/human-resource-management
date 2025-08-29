"use client";

import { useMemo } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { projects } from "@/lib/project-task-data";
import {
  BarChart3,
  TrendingUp,
  CalendarDays,
  ListChecks,
  AlertCircle,
  Users,
  Download,
  Target,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string; // ISO date
  completedAt?: string; // ISO date
}

// Generate mock tasks from centralized project data
const generateMockTasks = (): TaskItem[] => {
  const allTasks: TaskItem[] = [];
  
  projects.forEach(project => {
    project.tasks.forEach(task => {
      // Generate more realistic dates based on project timeline
      const projectStartDate = new Date(project.startDate);
      const projectEndDate = new Date(project.endDate);
      const projectDuration = projectEndDate.getTime() - projectStartDate.getTime();
      
      // Random date within project timeline
      const randomOffset = Math.random() * projectDuration;
      const startDate = new Date(projectStartDate.getTime() + randomOffset);
      
      const taskItem: TaskItem = {
        id: task.id,
        title: task.name,
        assignee: task.assignee,
        status: task.status,
        priority: task.priority,
        createdAt: startDate.toISOString().split('T')[0],
        completedAt: task.status === 'completed' ? 
          new Date(startDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          undefined
      };
      
      allTasks.push(taskItem);
    });
  });
  
  return allTasks;
};

const mockTasks = generateMockTasks();

// Get real-time project statistics
const getProjectStats = () => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const urgentProjects = projects.filter(p => p.priority === 'urgent').length;
  
  return { totalProjects, activeProjects, completedProjects, urgentProjects };
};

function formatMonthKey(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskAnalyticsPage() {
  const stats = useMemo(() => {
    const total = mockTasks.length;
    const completed = mockTasks.filter((t) => t.status === "completed").length;
    const inProgress = mockTasks.filter((t) => t.status === "in-progress").length;
    const pending = mockTasks.filter((t) => t.status === "pending").length;
    const blocked = mockTasks.filter((t) => t.status === "blocked").length;

    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // Throughput (completed tasks) in last 14 days by day
    const today = new Date();
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = formatMonthKey(d);
      const count = mockTasks.filter(
        (t) => t.completedAt && new Date(t.completedAt).toDateString() === d.toDateString()
      ).length;
      days.push({ label, count });
    }

    // Priority distribution
    const priorityCounts = ["low", "medium", "high", "urgent"].map((p) => ({
      key: p,
      count: mockTasks.filter((t) => t.priority === (p as TaskItem["priority"])).length,
    }));

    // Status distribution
    const statusCounts = ["pending", "in-progress", "completed", "blocked"].map((s) => ({
      key: s,
      count: mockTasks.filter((t) => t.status === (s as TaskItem["status"])).length,
    }));

    // Top assignees (by completed)
    const completedByAssignee = new Map<string, number>();
    mockTasks.forEach((t) => {
      if (t.status === "completed") {
        completedByAssignee.set(t.assignee, (completedByAssignee.get(t.assignee) || 0) + 1);
      }
    });
    const topAssignees = Array.from(completedByAssignee.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { total, completed, inProgress, pending, blocked, completionRate, days, priorityCounts, statusCounts, topAssignees };
  }, []);

  const barMax = Math.max(1, ...stats.days.map((d) => d.count));
  const priorityMax = Math.max(1, ...stats.priorityCounts.map((p) => p.count));
  const statusMax = Math.max(1, ...stats.statusCounts.map((s) => s.count));

  const statusBadgeColor = (s: string) => {
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "";
    }
  };
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting task reports...");
    alert("Export functionality will be implemented soon!");
  };

  const handleRefresh = () => {
    // Refresh the page to get latest data
    window.location.reload();
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tasks", href: "/admin/tasks" },
          { label: "Task Repots" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col flex-wrap  gap-3">
          <div className="flex items-center flex-wrap gap-6 w-full justify-between ">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-0 text-gray-900">Task Reports</h1>
                <p className="text-md md:text-lg text-gray-600">Comprehensive insights into task progress, throughput, and team performance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" size="lg" className="bg-white hover:bg-gray-50">
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <Download className="h-5 w-5 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Executive Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.completionRate}%</div>
                  <div className="text-sm text-gray-600 font-medium">Overall Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
                  <div className="text-sm text-gray-600 font-medium">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{getProjectStats().totalProjects}</div>
                  <div className="text-sm text-gray-600 font-medium">Active Projects</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Total Tasks</CardTitle>
              <div className="p-2 bg-blue-200 rounded-full">
                <ListChecks className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-1">{stats.total}</div>
              <p className="text-xs text-blue-700 font-medium">Tracked overall</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-800">Completed</CardTitle>
              <div className="p-2 bg-green-200 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-1">{stats.completed}</div>
              <p className="text-xs text-green-700 font-medium">Rate: {stats.completionRate}%</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-amber-800">In Progress</CardTitle>
              <div className="p-2 bg-amber-200 rounded-full">
                <CalendarDays className="h-4 w-4 text-amber-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900 mb-1">{stats.inProgress}</div>
              <p className="text-xs text-amber-700 font-medium">Currently active</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">Pending</CardTitle>
              <div className="p-2 bg-slate-200 rounded-full">
                <Users className="h-4 w-4 text-slate-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.pending}</div>
              <p className="text-xs text-slate-700 font-medium">Queued up</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-red-800">Blocked</CardTitle>
              <div className="p-2 bg-red-200 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900 mb-1">{stats.blocked}</div>
              <p className="text-xs text-red-700 font-medium">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Statistics */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              Project Overview
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">High-level project statistics and health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-blue-900 mb-2">{getProjectStats().totalProjects}</div>
                <div className="text-sm text-blue-700 font-medium">Total Projects</div>
                <div className="w-16 h-1 bg-blue-300 rounded-full mx-auto mt-3"></div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-emerald-900 mb-2">{getProjectStats().activeProjects}</div>
                <div className="text-sm text-emerald-700 font-medium">Active Projects</div>
                <div className="w-16 h-1 bg-emerald-300 rounded-full mx-auto mt-3"></div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border border-violet-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-violet-900 mb-2">{getProjectStats().completedProjects}</div>
                <div className="text-sm text-violet-700 font-medium">Completed Projects</div>
                <div className="w-16 h-1 bg-violet-300 rounded-full mx-auto mt-3"></div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border border-rose-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-bold text-rose-900 mb-2">{getProjectStats().urgentProjects}</div>
                <div className="text-sm text-rose-700 font-medium">Urgent Projects</div>
                <div className="w-16 h-1 bg-rose-300 rounded-full mx-auto mt-3"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Throughput over last 14 days */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              Throughput (Last 14 Days)
            </CardTitle>
            <CardDescription>
              <div className="text-base text-gray-600 font-medium">Completed tasks per day</div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end flex-wrap justify-between gap-3 h-48 px-4">
              {stats.days.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center  gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    style={{ height: `${Math.max((d.count / barMax) * 100, 8) || 8}%` }}
                    title={`${d.label}: ${d.count} tasks completed`}
                  />
                  <div className="text-xs text-gray-600 font-medium transform -rotate-45 origin-top-left">{d.label}</div>
                  <div className="text-xs text-indigo-600 font-semibold">{d.count}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <span className="font-medium text-indigo-600">{stats.days.reduce((sum, day) => sum + day.count, 0)}</span> total tasks completed in the last 14 days
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Count of tasks by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.priorityCounts.map((p) => (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="w-28 text-sm capitalize text-gray-700">{p.key}</div>
                    <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                      <div
                        className={
                          p.key === "urgent"
                            ? "bg-red-500 h-2"
                            : p.key === "high"
                              ? "bg-orange-500 h-2"
                              : p.key === "medium"
                                ? "bg-yellow-500 h-2"
                                : "bg-gray-500 h-2"
                        }
                        style={{ width: `${(p.count / priorityMax) * 100 || 5}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm text-gray-600">{p.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Tasks by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.statusCounts.map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className="w-28 text-sm capitalize text-gray-700">
                      <Badge className={`border ${statusBadgeColor(s.key)}`}>{s.key}</Badge>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2" style={{ width: `${(s.count / statusMax) * 100 || 5}%` }} />
                    </div>
                    <div className="w-8 text-right text-sm text-gray-600">{s.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks by Project */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              Tasks by Project
            </CardTitle>
            <CardDescription className="text-gray-600">Task distribution and progress across different projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.map(project => {
                const projectTasks = mockTasks.filter(task => 
                  project.tasks.some(pt => pt.id === task.id)
                );
                const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                const totalTasks = projectTasks.length;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
                return (
                  <div key={project.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
                        <div className="text-sm text-gray-500 font-medium">Total Tasks</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-700">Progress</span>
                        <span className="text-purple-700">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-medium">{completedTasks} completed</span>
                        <span className="font-medium">{totalTasks - completedTasks} remaining</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              Recent Task Activity
            </CardTitle>
            <CardDescription className="text-gray-600">Latest task updates and completion milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTasks
                .filter(task => task.status === 'completed' && task.completedAt)
                .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                .slice(0, 5)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        Completed by <span className="font-medium text-gray-800">{task.assignee}</span> on <span className="font-medium text-gray-800">{new Date(task.completedAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">Completed</Badge>
                      <Badge variant="outline" className="capitalize font-medium">{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              {mockTasks.filter(task => task.status === 'completed' && task.completedAt).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium mb-2">No completed tasks yet</div>
                  <div className="text-sm">Tasks will appear here once they are completed</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blocked Tasks Alert */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Blocked Tasks Requiring Attention
            </CardTitle>
            <CardDescription className="text-red-600">
              Tasks that are currently blocked and may need intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTasks
                .filter(task => task.status === 'blocked')
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        Assigned to {task.assignee} • Created on {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>
                      <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              {mockTasks.filter(task => task.status === 'blocked').length === 0 && (
                <div className="text-center py-4 text-green-600 font-medium">
                  🎉 No blocked tasks! All tasks are progressing smoothly.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Priority Insights
            </CardTitle>
            <CardDescription>Analysis of high and urgent priority tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">Urgent Tasks</h4>
                {mockTasks
                  .filter(task => task.priority === 'urgent')
                  .map(task => (
                    <div key={task.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.assignee} • {task.status} • Due: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                {mockTasks.filter(task => task.priority === 'urgent').length === 0 && (
                  <div className="text-sm text-green-600 italic">No urgent tasks at the moment</div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-orange-700">High Priority Tasks</h4>
                {mockTasks
                  .filter(task => task.priority === 'high')
                  .map(task => (
                    <div key={task.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.assignee} • {task.status} • Due: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                {mockTasks.filter(task => task.priority === 'high').length === 0 && (
                  <div className="text-sm text-green-600 italic">No high priority tasks at the moment</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Workload Distribution
            </CardTitle>
            <CardDescription>Current task distribution across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const assigneeStats = new Map<string, { total: number; completed: number; inProgress: number; pending: number; blocked: number }>();
                
                                 mockTasks.forEach(task => {
                   if (!assigneeStats.has(task.assignee)) {
                     assigneeStats.set(task.assignee, { total: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0 });
                   }
                   const stats = assigneeStats.get(task.assignee)!;
                   stats.total++;
                   if (task.status === 'in-progress') {
                     stats.inProgress++;
                   } else {
                     stats[task.status]++;
                   }
                 });
                
                return Array.from(assigneeStats.entries())
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([assignee, stats]) => (
                    <div key={assignee} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{assignee}</h4>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                          <div className="text-sm text-gray-500">Total Tasks</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-sm font-medium text-green-700">{stats.completed}</div>
                          <div className="text-xs text-green-600">Done</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="text-sm font-medium text-blue-700">{stats.inProgress}</div>
                          <div className="text-xs text-blue-600">Active</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-sm font-medium text-gray-700">{stats.pending}</div>
                          <div className="text-xs text-gray-600">Pending</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-sm font-medium text-red-700">{stats.blocked}</div>
                          <div className="text-xs text-red-600">Blocked</div>
                        </div>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Project Completion Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Completion Trends
            </CardTitle>
            <CardDescription>Progress tracking across different project categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const categoryStats = new Map<string, { total: number; completed: number; active: number; planning: number }>();
                
                                 projects.forEach(project => {
                   if (!categoryStats.has(project.category)) {
                     categoryStats.set(project.category, { total: 0, completed: 0, active: 0, planning: 0 });
                   }
                   const stats = categoryStats.get(project.category)!;
                   stats.total++;
                   if (project.status === 'completed') {
                     stats.completed++;
                   } else if (project.status === 'active') {
                     stats.active++;
                   } else if (project.status === 'planning') {
                     stats.planning++;
                   }
                 });
                
                return Array.from(categoryStats.entries())
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([category, stats]) => (
                    <div key={category} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{category}</h4>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                          <div className="text-sm text-gray-500">Projects</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-purple-50 rounded">
                          <div className="text-sm font-medium text-purple-700">{stats.completed}</div>
                          <div className="text-xs text-purple-600">Completed</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-sm font-medium text-green-700">{stats.active}</div>
                          <div className="text-xs text-green-600">Active</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="text-sm font-medium text-blue-700">{stats.planning}</div>
                          <div className="text-xs text-blue-600">Planning</div>
                        </div>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Top assignees */}
        <Card>
          <CardHeader>
            <CardTitle>Top Assignees</CardTitle>
            <CardDescription>Completed tasks by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topAssignees.length === 0 && (
                <div className="text-sm text-gray-500">No completed tasks yet</div>
              )}
              {stats.topAssignees.map((a) => (
                <div key={a.name} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-gray-500">Completed tasks</div>
                  </div>
                  <div className="text-xl font-bold">{a.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}