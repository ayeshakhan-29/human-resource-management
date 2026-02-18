"use client";
import { Clock, Calendar, User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/use-api";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

interface DashboardData {
  role: string;
  stats: {
    todoTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    attendanceStatus: string;
    upcomingLeaves: number;
    leaveBalance?: number;
    weeklyHours?: string;
  };
  recentTasks: {
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
  }[];
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: response, isLoading } = useApi<{ success: boolean; data: DashboardData }>("/dashboard/summary");
  const dashboardData = response?.data;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <>
        <Header breadcrumbs={[{ label: "Employee", href: "/employee" }, { label: "Dashboard" }]} />
        <DashboardSkeleton />
      </>
    );
  }

  const displayName = (user?.name || user?.fullName || "Employee") as string;
  const firstName = displayName.split(" ")[0];
  const stats = dashboardData?.stats;

  const statusColors: Record<string, string> = {
    present: "text-green-600",
    late: "text-yellow-600",
    absent: "text-red-600",
    "not-marked": "text-gray-600",
  };
  const displayAttendanceStatus = (() => {
    const s = stats?.attendanceStatus;
    if (!s) return "Not Marked";
    return s.replace(/-/g, " ");
  })();

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Employee", href: "/employee" },
          { label: "Dashboard" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {firstName}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s your dashboard overview for today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Status
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold capitalize ${statusColors[stats?.attendanceStatus || "not-marked"]}`}>
                {displayAttendanceStatus}
              </div>
              <p className="text-xs text-muted-foreground">
                Attendance for {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.inProgressTasks || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks currently in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.weeklyHours || "0"}h
              </div>
              <p className="text-xs text-muted-foreground">
                Total hours logged this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leave Balance
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.leaveBalance || 0}
              </div>
              <p className="text-xs text-muted-foreground">Available leave days</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Recent Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col">
              <Link href="/employee/profile" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  View My Information
                </Button>
              </Link>
              {user?.role === 'manager' && (
                <Link href="/manager/dashboard" className="w-full">
                  <Button className="w-full justify-start" variant="default">
                    <User className="mr-2 h-4 w-4" />
                    Manager Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/employee/attendance" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>
              </Link>
              <Link href="/employee/leave/apply" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Apply for Leave
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest assigned work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentTasks && dashboardData.recentTasks.length > 0 ? (
                  dashboardData.recentTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{task.title}</span>
                        <span className="text-xs text-gray-500 capitalize">{task.priority} Priority</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {task.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent tasks</p>
                )}
                <Link href="/employee/tasks" className="block text-center text-sm text-blue-600 hover:underline">
                  View All Tasks
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
