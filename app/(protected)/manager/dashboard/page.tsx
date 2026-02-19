"use client";

import { useEffect } from "react";
import { ListChecks, AlertCircle, CheckCircle, Timer, FolderKanban, Eye, Users, Calendar, ArrowRightLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/header";

interface DashboardData {
  role: string;
  stats: {
    managedProjectsCount: number;
    totalTasks: number;
    completedTasks: number;
    activeProjects: number;
    inProgressTasks?: number;
    pendingTasks?: number;
    overdueTasks?: number;
  };
  managedProjects?: {
    id: number;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    teamMembers?: { id: number }[];
  }[];
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: response, isLoading } = useApi<{ success: boolean; data: DashboardData }>("/dashboard/summary?view=manager");
  const dashboardData = response?.data;

  // Redirection logic: if all projects are completed/cancelled and user's role is employee
  // (meaning they only have manager access because of project assignment), redirect back to employee dashboard.
  useEffect(() => {
    if (!isLoading && dashboardData) {
      const activeProjects = dashboardData.stats.activeProjects || 0;
      const isPrimaryEmployee = user?.role?.toLowerCase() === 'employee';

      if (activeProjects === 0 && isPrimaryEmployee) {
        router.push('/employee/dashboard');
      }
    }
  }, [isLoading, dashboardData, user, router]);

  if (isLoading) {
    return (
      <>
        <Header breadcrumbs={[{ label: "Manager", href: "/manager" }, { label: "Dashboard" }]} />
        <DashboardSkeleton />
      </>
    );
  }

  const stats = {
    totalTasks: dashboardData?.stats.totalTasks || 0,
    completedTasks: dashboardData?.stats.completedTasks || 0,
    inProgressTasks: dashboardData?.stats.inProgressTasks || 0,
    pendingTasks: dashboardData?.stats.pendingTasks || 0,
    overdueTasks: dashboardData?.stats.overdueTasks || 0,
    activeProjects: dashboardData?.stats.activeProjects || 0,
  };

  const projects = dashboardData?.managedProjects || [];
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Manager", href: "/manager" },
          { label: "Dashboard" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.fullName}!
          </h1>
          <p className="text-gray-600">
            Here&#39;s an overview of your team&#39;s performance and tasks.
          </p>
        </div>

        <div className="flex justify-end">
          <Button asChild variant="outline" className="text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-sm transition-all duration-200">
            <Link href="/employee/dashboard" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-slate-500" />
              <span>View Employee Portal</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Tasks</CardTitle>
              <ListChecks className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalTasks}
              </div>
              <p className="text-xs text-blue-600">
                In your projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {stats.completedTasks}
              </div>
              <p className="text-xs text-green-600">
                {`${completionRate.toFixed(1)}% completion rate`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">In Progress</CardTitle>
              <Timer className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {stats.inProgressTasks}
              </div>
              <p className="text-xs text-yellow-600">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <Timer className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.pendingTasks}
              </div>
              <p className="text-xs text-gray-600">
                Not started
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {stats.overdueTasks}
              </div>
              <p className="text-xs text-red-600">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task Completion Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Task Completion Overview
            </CardTitle>
            <CardDescription>
              Overall progress across your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-semibold">{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{stats.completedTasks}</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{stats.inProgressTasks}</div>
                  <div className="text-xs text-blue-600">In Progress</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{stats.pendingTasks}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{stats.overdueTasks}</div>
                  <div className="text-xs text-red-600">Overdue</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                My Projects
              </CardTitle>
              <CardDescription>
                Recent projects you&#39;re managing
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/manager/projects">
                View All ({stats.activeProjects})
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">No projects assigned yet</p>
                <p className="text-xs text-gray-500 mt-1">You&#39;ll see your projects here once assigned as a manager</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/manager/projects/${project.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{project.name}</h4>
                        <Badge variant={project.status === "active" || project.status === "in-progress" ? "default" : "secondary"} className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">{project.description || "No description"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project.teamMembers?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/manager/projects/${project.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and actions you can perform
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/manager/tasks/add">
                <ListChecks className="mr-2 h-4 w-4" />
                Add Task
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/manager/tasks/all-tasks">
                  <Timer className="h-6 w-6 mb-2" />
                  View All Tasks
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/manager/projects">
                  <FolderKanban className="h-6 w-6 mb-2" />
                  View Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
