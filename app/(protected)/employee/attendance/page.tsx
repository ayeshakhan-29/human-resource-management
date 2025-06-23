"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock4,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import useSWR from "swr";

// SWR fetcher function
const fetcher = async (url: string) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const errorData = await res.json().catch(() => ({}));
    error.message = errorData.message || error.message;
    throw error;
  }

  return res.json();
};

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import {
  clockInAction,
  clockOutAction,
  getTodaysAttendance,
  getWeeklyAttendance,
} from "@/lib/actions/attendance.actions";
import { WeeklyAttendanceRecord } from "@/lib/types/attendance.types";
import { getAuthToken } from "@/lib/auth/token";

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  totalHours: string;
  status: string;
  overtime: string;
}

// Helper function to format time from 24h to 12h format
const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

export default function EmployeeAttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<'not_checked_in' | 'checked_in' | 'checked_out'>('not_checked_in');
  const [isLoading, setIsLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  // Use SWR for real-time data fetching with polling
  const {
    data: weeklyData,
    error: weeklyError,
    isLoading: isLoadingHistory,
    mutate: mutateWeeklyData,
  } = useSWR<{
    success: boolean;
    data: WeeklyAttendanceRecord[];
    startDate: string;
    endDate: string;
    summary: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      totalHours: string;
      formattedTotalHours: string;
    };
  }>(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api"
    }/attendance/weekly`,
    fetcher,
    {
      // Refresh every 1 seconds for near real-time updates
      refreshInterval: 100,
      // Keep refreshing even when window is not focused
      refreshWhenHidden: true,
      // Keep refreshing even when offline
      refreshWhenOffline: true,
      // Don't stop refreshing on error
      shouldRetryOnError: true,
      // Number of retries on error
      errorRetryCount: 3,
      // Shorter retry delay for faster recovery
      errorRetryInterval: 1000,
      // Disable deduping interval to ensure we always get fresh data
      dedupingInterval: 0,
    }
  );

  // Handle errors with toast
  useEffect(() => {
    if (weeklyError) {
      console.error("Error fetching attendance history:", weeklyError);
      toast.error(weeklyError.message || "Failed to load attendance history");
    }
  }, [weeklyError]);

  // Check attendance status on component mount
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        setIsLoading(true);

        console.log("Calling getTodaysAttendance()...");
        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch today's attendance
        const { data: attendance, error } = await getTodaysAttendance(token);
        console.log(attendance, "attendance response");
        if (error) {
          console.error("Error in getTodaysAttendance:", error);
          throw new Error(error);
        }

        // Mutate to refresh data
        mutateWeeklyData();

        if (attendance?.clockIn && !attendance.clockOut) {
          const checkInDateTime = parseISO(
            `${attendance.date}T${attendance.clockIn}`
          );
          const now = new Date();
          const diffHours =
            (now.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60);

          setAttendanceStatus('checked_in');
          setCheckInTime(checkInDateTime);
          setWorkingHours(parseFloat(diffHours.toFixed(2)));
        } else if (attendance?.clockIn && attendance.clockOut) {
          setAttendanceStatus('checked_out');
          setCheckInTime(parseISO(`${attendance.date}T${attendance.clockIn}`));
          const checkOutDateTime = parseISO(`${attendance.date}T${attendance.clockOut}`);
          const diffHours = (checkOutDateTime.getTime() - parseISO(`${attendance.date}T${attendance.clockIn}`).getTime()) / (1000 * 60 * 60);
          setWorkingHours(parseFloat(diffHours.toFixed(2)));
        } else {
          setAttendanceStatus('not_checked_in');
          setCheckInTime(null);
          setWorkingHours(0);
        }
      } catch (error: unknown) {
        console.error("Error checking attendance status:", error);
        setAttendanceStatus('not_checked_in');
        setCheckInTime(null);
        setWorkingHours(0);
      } finally {
        setIsLoading(false);
      }
    };

    checkAttendanceStatus();
  }, []);

  // Update working hours when checked in
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (checkInTime) {
        const diff =
          (new Date().getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        setWorkingHours(parseFloat(diff.toFixed(2)));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [checkInTime]);

  // Handle check in
  const handleCheckIn = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const { data, error, status } = await clockInAction(token);

      if (error || status === 401) {
        throw new Error(error || "Authentication failed. Please log in again.");
      }

      if (data?.attendance) {
        const { date, clockIn } = data.attendance;
        const checkInDate = parseISO(`${date}T${clockIn}`);

        setCheckInTime(checkInDate);
        setAttendanceStatus('checked_in');

        toast.success("Checked in successfully!", {
          description: `You've successfully checked in at ${clockIn}`,
        });
      }
    } catch (error) {
      const err = error as Error;
      console.error("Check-in error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });

      // If unauthorized, suggest re-login
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        console.warn("Authentication issue detected. Current auth state:", {
          token:
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null,
          user:
            typeof window !== "undefined" ? localStorage.getItem("user") : null,
        });

        toast.error("Session Expired", {
          description: "Your session has expired. Please log in again.",
          action: {
            label: "Log In",
            onClick: () => {
              // Clear auth data and redirect to login
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }
            },
          },
        });
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to check in. Please try again.";
        toast.error("Check-in failed", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const { data, error } = await clockOutAction(token);

      if (error) throw new Error(error);

      setAttendanceStatus('checked_out');
      setCheckInTime(null);
      setWorkingHours(0);
      setShowSuccess(true);

      if (data?.attendance) {
        toast.success("Checked out successfully!", {
          description: `You've worked for ${data.attendance.totalHours} today.`,
        });
      }

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const err = error as Error;
      console.error("Check-out error:", err);
      toast.error("Check-out failed", {
        description: err.message || "Failed to check out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge key="present" className="bg-green-100 text-green-800">Present</Badge>;
      case "late":
        return <Badge key="late" className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case "early_leave":
        return (
          <Badge key="early_leave" className="bg-orange-100 text-orange-800">Early Leave</Badge>
        );
      default:
        return <Badge key={status} variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Employee", href: "/employee" },
          { label: "Attendance" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Attendance Tracking
          </h2>
          <p className="text-gray-600">
            Mark your attendance and view your work history
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {attendanceStatus === 'checked_in'
                ? "Successfully checked in!"
                : "Successfully checked out!"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Time & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Time</CardTitle>
              <CardDescription>Live clock and status</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <Badge
                variant={
                  attendanceStatus === 'checked_in' 
                    ? 'default' 
                    : attendanceStatus === 'checked_out' 
                      ? 'secondary' 
                      : 'outline'
                }
                className="text-sm"
              >
                {
                  attendanceStatus === 'checked_in' 
                    ? 'Checked In' 
                    : attendanceStatus === 'checked_out' 
                      ? 'Checked Out' 
                      : 'Not Checked In'
                }
              </Badge>
            </CardContent>
          </Card>

          {/* Check In/Out */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Action</CardTitle>
              <CardDescription>Mark your attendance for today</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
{attendanceStatus === 'not_checked_in' ? (
                <Button onClick={handleCheckIn} className="w-full" size="lg">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              ) : attendanceStatus === 'checked_in' ? (
                <Button 
                  onClick={handleCheckOut} 
                  variant="destructive" 
                  className="w-full" 
                  size="lg"
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Check Out
                </Button>
              ) : (
                <Button disabled className="w-full" size="lg" variant="outline">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Already Checked Out
                </Button>
              )}
              {checkInTime && (
                <div className="text-sm text-gray-600">
                  <p>Checked in at: {checkInTime.toLocaleTimeString()}</p>
                  <p>Working hours: {workingHours.toFixed(1)}h</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Summary</CardTitle>
              <CardDescription>Your work summary for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={
                  attendanceStatus === 'checked_in' 
                    ? 'default' 
                    : attendanceStatus === 'checked_out' 
                      ? 'secondary' 
                      : 'outline'
                }>
                    {attendanceStatus === 'checked_in' 
                      ? 'Working' 
                      : attendanceStatus === 'checked_out' 
                        ? 'Completed' 
                        : 'Not Started'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Check-in Time:</span>
                  <span className="text-sm text-gray-600">
                    {checkInTime ? format(checkInTime, "h:mm a") : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hours Worked:</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      {workingHours.toFixed(1)}h
                    </span>
                    {workingHours > 8 && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        +{(workingHours - 8).toFixed(1)}h OT
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Expected Hours:</span>
                  <span className="text-sm text-gray-600">8.0h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your recent attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingHistory ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Loading attendance history...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : weeklyData?.data && weeklyData.data.length > 0 ? (
                    weeklyData.data.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.day}
                        </TableCell>
                        <TableCell>
                          {record.clockIn ? formatTime(record.clockIn) : "-"}
                        </TableCell>
                        <TableCell>
                          {record.clockOut ? formatTime(record.clockOut) : "-"}
                        </TableCell>
                        <TableCell>{record.formattedHours}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-4 text-gray-500"
                      >
                        {weeklyError
                          ? "Error loading attendance records"
                          : "No attendance records found for this week"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
