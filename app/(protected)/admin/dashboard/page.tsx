"use client";

import { Users, Clock, Calendar, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
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

interface DashboardData {
  role: string;
  stats: {
    totalEmployees: number;
    presentToday: number;
    lateToday: number;
    avgCheckIn: string;
    onLeaveToday: number;
    pendingLeaves: number;
    performance: string;
  };
}

export default function AdminDashboard() {
  const { data: response, isLoading } = useApi<{ success: boolean; data: DashboardData }>("/dashboard/summary");
  const dashboardData = response?.data;

  if (isLoading) {
    return (
      <>
        <Header breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]} />
        <DashboardSkeleton />
      </>
    );
  }

  const stats = dashboardData?.stats;

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Dashboard" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Welcome to your HRM admin panel. Manage employees and track attendance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalEmployees || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Current active employees
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Today
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.presentToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalEmployees && stats.totalEmployees > 0
                  ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}%`
                  : "0%"}
                {" attendance rate"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.onLeaveToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">Employees on leave today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.performance || "0%"}</div>
              <p className="text-xs text-muted-foreground">
                Task completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Employee Information
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                View Attendance Records
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Review Leave Requests
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Summary</CardTitle>
              <CardDescription>Current day overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Employees Present:
                  </span>
                  <span className="text-sm text-gray-600">
                    {stats?.presentToday || 0}/{stats?.totalEmployees || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Average Check-in Time:
                  </span>
                  <span className="text-sm text-gray-600">{stats?.avgCheckIn || "--:--"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Late Arrivals:</span>
                  <span className="text-sm text-gray-600">{stats?.lateToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Pending Leave Requests:
                  </span>
                  <span className="text-sm text-gray-600">{stats?.pendingLeaves || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
