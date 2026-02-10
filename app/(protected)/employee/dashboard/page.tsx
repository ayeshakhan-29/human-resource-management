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
import { getProjectsByManager } from "@/lib/actions/project.action";
import { getTodaysAttendance, getWeeklyAttendance } from "@/lib/actions/attendance.actions";
import { getAllLeaveTypes, getMyLeavesAction } from "@/lib/actions/leave.actions";
import { getAuthToken } from "@/lib/auth/token";
import { toast } from "sonner";

import { LeaveType, LeaveRequest } from "@/lib/types/leave.types";

import { AttendanceData as BaseAttendanceData } from "@/lib/types/attendance.types";

interface AttendanceData extends BaseAttendanceData {
  overtime?: string;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const displayName = (user?.name || user?.fullName || "Employee") as string;
  const firstName = displayName.split(" ")[0];
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState("0");

  // Calculate working hours
  const workingHours = attendance?.clockIn
    ? (currentTime.getTime() -
      new Date(`${attendance.date}T${attendance.clockIn}`).getTime()) /
    (1000 * 60 * 60)
    : 0;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        if (!token) return;

        const [attendanceRes, weeklyRes, leaveTypesRes, myLeavesRes] = await Promise.all([
          getTodaysAttendance(token),
          getWeeklyAttendance(token),
          getAllLeaveTypes(),
          getMyLeavesAction()
        ]);

        if (attendanceRes && 'data' in attendanceRes && attendanceRes.data) {
          setAttendance(attendanceRes.data);
        }

        if (weeklyRes && 'data' in weeklyRes && weeklyRes.data) {
          const hours = weeklyRes.data.summary.formattedTotalHours.split(' ')[0];
          setWeeklyHours(hours);
        }

        if (leaveTypesRes && 'data' in leaveTypesRes && leaveTypesRes.data && myLeavesRes && 'data' in myLeavesRes && myLeavesRes.data) {
          const activeTypes = (leaveTypesRes.data as LeaveType[]).filter((t) => t.status === "active" && t.annual_quota > 0);
          const approvedLeaves = (myLeavesRes.data as LeaveRequest[]).filter((l) => l.status === "approved");

          const totalQuota = activeTypes.reduce((acc: number, t) => acc + t.annual_quota, 0);
          const totalUsed = approvedLeaves.reduce((acc: number, l) => acc + l.totalDays, 0);
          setLeaveBalance(Math.max(0, totalQuota - totalUsed));
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const checkManager = async () => {
      try {
        const id = parseInt((user?.id as unknown as string) || "0", 10);
        if (!id) return;
        const resp = await getProjectsByManager(id, 1, 1);
        const has = (resp?.data?.length || 0) > 0;
        setIsProjectManager(has);
      } catch (_) { }
    };
    checkManager();
  }, [user?.id]);

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Calculate expected check-out time (8 hours after check-in)
  const getExpectedCheckoutTime = (checkInTime: string) => {
    if (!checkInTime) return "";
    const [hours, minutes] = checkInTime.split(":");
    const checkInDate = new Date();
    checkInDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Add 8 hours
    const checkOutDate = new Date(checkInDate.getTime() + 8 * 60 * 60 * 1000);

    // Format as 12-hour time with AM/PM
    let hours12 = checkOutDate.getHours();
    const ampm = hours12 >= 12 ? "PM" : "AM";
    hours12 = hours12 % 12;
    hours12 = hours12 || 12; // Convert 0 to 12 for 12-hour format
    const minutesStr = checkOutDate.getMinutes().toString().padStart(2, "0");

    return `${hours12}:${minutesStr} ${ampm}`;
  };

  // Get status text and color
  const getStatusInfo = () => {
    if (!attendance) return { text: "Not Checked In", color: "text-gray-600" };

    switch (attendance.status?.toLowerCase()) {
      case "present":
        return { text: "Present", color: "text-green-600" };
      case "late":
        return { text: "Late", color: "text-yellow-600" };
      case "early_leave":
        return { text: "Left Early", color: "text-orange-600" };
      default:
        return { text: "Unknown", color: "text-gray-600" };
    }
  };

  const statusInfo = getStatusInfo();

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
              <div className={`text-2xl font-bold ${statusInfo.color}`}>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  statusInfo.text
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : attendance?.clockIn
                    ? `Checked in at ${formatTime(attendance.clockIn)}`
                    : "Not checked in today"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading
                  ? "--"
                  : attendance
                    ? workingHours.toFixed(1)
                    : "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : attendance?.clockOut
                    ? "Completed"
                    : "Still working"}
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
                {isLoading ? "--" : weeklyHours}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : "Hours this week"}
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
                {isLoading ? "--" : leaveBalance}
              </div>
              <p className="text-xs text-muted-foreground">Days remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
              {(user?.role === 'manager' || isProjectManager) && (
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
              <CardTitle>Today&apos;s Summary</CardTitle>
              <CardDescription>Your work summary for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Check-in Time:</span>
                  <span className="text-sm text-gray-600">
                    {isLoading
                      ? "--:--"
                      : attendance?.clockIn
                        ? formatTime(attendance.clockIn)
                        : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Expected Check-out:
                  </span>
                  <span className="text-sm text-gray-600">
                    {isLoading
                      ? "--:--"
                      : attendance?.clockIn
                        ? getExpectedCheckoutTime(attendance.clockIn)
                        : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hours Worked:</span>
                  <span className="text-sm text-gray-600">
                    {isLoading
                      ? "--"
                      : attendance
                        ? workingHours.toFixed(1)
                        : "0.0"}{" "}
                    / 8.0
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <span className={`text-sm ${statusInfo.color} font-medium`}>
                    {isLoading ? "Loading..." : statusInfo.text}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
