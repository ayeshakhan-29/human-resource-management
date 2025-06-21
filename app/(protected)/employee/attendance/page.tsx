"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

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
} from "@/lib/actions/attendance.actions";
import { getAuthToken } from "@/lib/auth/token";

const mockAttendanceHistory = [
  {
    date: "2024-03-01",
    checkIn: "09:00 AM",
    checkOut: "05:30 PM",
    totalHours: "8.5",
    status: "present",
    overtime: "0.5",
  },
  {
    date: "2024-02-29",
    checkIn: "08:45 AM",
    checkOut: "05:15 PM",
    totalHours: "8.5",
    status: "present",
    overtime: "0.5",
  },
  {
    date: "2024-02-28",
    checkIn: "09:15 AM",
    checkOut: "05:45 PM",
    totalHours: "8.5",
    status: "late",
    overtime: "0.5",
  },
  {
    date: "2024-02-27",
    checkIn: "09:00 AM",
    checkOut: "05:00 PM",
    totalHours: "8.0",
    status: "present",
    overtime: "0",
  },
  {
    date: "2024-02-26",
    checkIn: "08:30 AM",
    checkOut: "04:30 PM",
    totalHours: "8.0",
    status: "early_leave",
    overtime: "0",
  },
];

export default function EmployeeAttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check attendance status on component mount
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        const { data: attendance } = await getTodaysAttendance();
        if (attendance?.clockIn && !attendance.clockOut) {
          setIsCheckedIn(true);
          setCheckInTime(parseISO(`${attendance.date}T${attendance.clockIn}`));
        }
      } catch (error) {
        console.error("Error checking attendance status:", error);
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

  const handleCheckIn = async () => {
    try {
      console.log("=== Starting check-in process ===");
      setIsLoading(true);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const { data, error, status } = await clockInAction(token);

      console.log("Check-in response:", { data, error, status });

      if (error || status === 401) {
        throw new Error(error || "Authentication failed. Please log in again.");
      }

      if (data?.attendance) {
        const { date, clockIn } = data.attendance;
        const checkInDate = parseISO(`${date}T${clockIn}`);
        console.log("Setting check-in time:", { date, clockIn, checkInDate });

        setCheckInTime(checkInDate);
        setIsCheckedIn(true);

        toast.success("Checked in successfully!", {
          description: `You've successfully checked in at ${clockIn}`,
        });
      }
    } catch (error: any) {
      console.error("Check-in error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      // If unauthorized, suggest re-login
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
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
        toast.error("Check-in failed", {
          description: error.message || "Failed to check in. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      console.log("=== Check-in process completed ===");
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const { data, error } = await clockOutAction(token);

      if (error) throw new Error(error);

      setIsCheckedIn(false);
      setCheckInTime(null);
      setWorkingHours(0);
      setShowSuccess(true);

      if (data?.attendance) {
        toast.success("Checked out successfully!", {
          description: `You've worked for ${data.attendance.totalHours} today.`,
        });
      }

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Check-out error:", error);
      toast.error("Check-out failed", {
        description: error.message || "Failed to check out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case "early_leave":
        return (
          <Badge className="bg-orange-100 text-orange-800">Early Leave</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {isCheckedIn
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
                variant={isCheckedIn ? "default" : "secondary"}
                className="text-sm"
              >
                {isCheckedIn ? "Checked In" : "Not Checked In"}
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
              {!isCheckedIn ? (
                <Button onClick={handleCheckIn} className="w-full" size="lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              ) : (
                <Button
                  onClick={handleCheckOut}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Check Out
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
                  <Badge variant={isCheckedIn ? "default" : "secondary"}>
                    {isCheckedIn ? "Working" : "Not Started"}
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
                  <span className="text-sm text-gray-600">
                    {workingHours.toFixed(1)}h
                  </span>
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
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendanceHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.totalHours}h</TableCell>
                      <TableCell>
                        {record.overtime === "0" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className="text-blue-600">
                            {record.overtime}h
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
