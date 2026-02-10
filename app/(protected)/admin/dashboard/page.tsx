"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Calendar, TrendingUp } from "lucide-react";
import { Employee } from "@/lib/types/employee.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { getAllEmployees } from "@/lib/actions/employee.actions";
import { getAllAttendance } from "@/lib/actions/attendance.actions";
import { getTodaysLeavesAction, getAllLeavesAdminAction } from "@/lib/actions/leave.actions";
import { getTaskStatistics } from "@/lib/actions/task.actions";
import { AllAttendanceResponse } from "@/lib/types/attendance.types";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [presentCount, setPresentCount] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [avgCheckIn, setAvgCheckIn] = useState("--:--");
  const [performance, setPerformance] = useState("0%");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, attendanceRes, todayLeavesRes, pendingLeavesRes, taskStatsRes] = await Promise.all([
          getAllEmployees(),
          getAllAttendance(),
          getTodaysLeavesAction({ status: "approved" }),
          getAllLeavesAdminAction({ status: "pending" }),
          getTaskStatistics(),
        ]);

        if (employeesRes && employeesRes.success) {
          setEmployees(employeesRes.data || []);
        }

        if (attendanceRes && attendanceRes.data) {
          const stats = attendanceRes.data;
          setPresentCount(stats.count || 0);

          const attendanceData = stats.data || [];
          const lates = attendanceData.filter((a: AllAttendanceResponse['data'][0]) => a.status?.toLowerCase() === 'late').length;
          setLateCount(lates);

          const checkInTimes = attendanceData
            .filter((a: AllAttendanceResponse['data'][0]) => a.clockIn)
            .map((a: AllAttendanceResponse['data'][0]) => {
              const [hours, minutes] = a.clockIn!.split(':');
              return parseInt(hours) * 60 + parseInt(minutes);
            });

          if (checkInTimes.length > 0) {
            const avgMinutes = checkInTimes.reduce((a: number, b: number) => a + b, 0) / checkInTimes.length;
            const h = Math.floor(avgMinutes / 60);
            const m = Math.floor(avgMinutes % 60);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            setAvgCheckIn(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
          }
        }

        if (todayLeavesRes && 'data' in todayLeavesRes && todayLeavesRes.data) {
          setOnLeaveToday(todayLeavesRes.data.length || 0);
        }

        if (pendingLeavesRes && 'data' in pendingLeavesRes && pendingLeavesRes.data) {
          setPendingLeaves(pendingLeavesRes.data.length || 0);
        }

        if (taskStatsRes && taskStatsRes.success && taskStatsRes.data) {
          const { completed, total } = taskStatsRes.data;
          const perf = total > 0 ? Math.round((completed / total) * 100) : 0;
          setPerformance(`${perf}%`);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
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
            Welcome to your HRM admin panel. Manage employees and track
            attendance.
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
                {isLoading ? "..." : employees.length}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
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
                {isLoading ? "..." : presentCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {employees.length > 0
                  ? `${Math.round((presentCount / employees.length) * 100)}%`
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
                {isLoading ? "..." : onLeaveToday}
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
              <div className="text-2xl font-bold">{isLoading ? "..." : performance}</div>
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
                    {presentCount}/{employees.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Average Check-in Time:
                  </span>
                  <span className="text-sm text-gray-600">{isLoading ? "..." : avgCheckIn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Late Arrivals:</span>
                  <span className="text-sm text-gray-600">{isLoading ? "..." : lateCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Pending Leave Requests:
                  </span>
                  <span className="text-sm text-gray-600">{pendingLeaves}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
