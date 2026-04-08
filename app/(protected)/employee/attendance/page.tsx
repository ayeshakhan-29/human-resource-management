"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { getAuthToken } from "@/lib/auth/token";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import {
  clockInAction,
  clockOutAction,
  getTodaysAttendance,
  getWeeklyAttendance,
} from "@/lib/actions/attendance.actions";
import { WeeklyAttendanceRecord as BackendWeeklyRecord } from "@/lib/types/attendance.types";
import { AttendanceHistoryTable } from "@/components/attendance/AttendanceHistoryTable";
import { CheckoutForm } from "@/components/attendance/CheckoutForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FilterX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type OptimisticAttendanceRecord = Omit<
  BackendWeeklyRecord,
  "id" | "overtime" | "totalHours" | "formattedHours" | "status"
> & {
  id: string | number;
  status: "present" | "absent" | "half_day" | "holiday" | "weekend" | "leave";
  formattedHours: string;
  totalHours: string;
  overtime: string;
};

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
  const [attendanceStatus, setAttendanceStatus] = useState<
    "not_checked_in" | "checked_in" | "checked_out"
  >("not_checked_in");
  const [isLoading, setIsLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(10);
  const [filterDate, setFilterDate] = useState("");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const isFetchedRef = useRef(false);

  const { mutate: globalMutate } = useSWRConfig();

  // Use SWR for real-time data fetching with polling
  const {
    data: weeklyData,
    error: weeklyError,
    isLoading: isLoadingHistory,
    mutate: mutateWeeklyData,
  } = useSWR<{
    success: boolean;
    data: BackendWeeklyRecord[];
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
    `${(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api").replace(/\/$/, "")}/attendance/weekly`,
    fetcher,
    {
      // Refresh every 5 minutes instead of 5 seconds to reduce server load
      refreshInterval: 300000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      dedupingInterval: 10000,
    }
  );

  // New History SWR with Pagination and Filters
  const {
    data: historyData,
    error: historyError,
    isLoading: isLoadingHistoryData,
    mutate: mutateHistoryData,
  } = useSWR<{
    success: boolean;
    data: BackendWeeklyRecord[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
    };
  }>(
    `${(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005/api").replace(/\/$/, "")}/attendance/history?page=${historyPage}&limit=${historyLimit}${filterDate ? `&date=${filterDate}` : ""}${historyStatus !== "all" ? `&status=${historyStatus}` : ""}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
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
    if (isFetchedRef.current) return;
    
    const checkAttendanceStatus = async () => {
      try {
        setIsLoading(true);
        isFetchedRef.current = true;

        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch today's attendance
        const { data: attendance, error } = await getTodaysAttendance(token);
        
        if (error) {
          console.error("Error in getTodaysAttendance:", error);
          throw new Error(error);
        }

        // Mutate to refresh data
        mutateWeeklyData();

        if (attendance?.clockIn && !attendance.clockOut) {
          const checkInDateTime = parseISO(attendance.clockIn);
          const now = new Date();
          const diffHours =
            (now.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60);

          setAttendanceStatus("checked_in");
          setCheckInTime(checkInDateTime);
          setWorkingHours(parseFloat(diffHours.toFixed(2)));
        } else if (attendance?.clockIn && attendance.clockOut) {
          setAttendanceStatus("checked_out");
          setCheckInTime(parseISO(attendance.clockIn));
          const checkOutDateTime = parseISO(attendance.clockOut);
          const diffHours =
            (checkOutDateTime.getTime() -
              parseISO(attendance.clockIn).getTime()) /
            (1000 * 60 * 60);
          setWorkingHours(parseFloat(diffHours.toFixed(2)));
        } else {
          setAttendanceStatus("not_checked_in");
          setCheckInTime(null);
          setWorkingHours(0);
        }
      } catch (error: unknown) {
        console.error("Error checking attendance status:", error);
        setAttendanceStatus("not_checked_in");
        setCheckInTime(null);
        setWorkingHours(0);
      } finally {
        setIsLoading(false);
      }
    };

    checkAttendanceStatus();
  }, [mutateWeeklyData]);

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

  // Handle check in with SWR mutation
  const handleCheckIn = async () => {
    if (isActionInProgress) return;
    
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Optimistic UI update
    if (!weeklyData) return;

    const today = new Date();
    const optimisticRecord: OptimisticAttendanceRecord = {
      id: "temp-id",
      date: today.toISOString().split("T")[0],
      day: today.toLocaleDateString("en-US", { weekday: "long" }),
      clockIn: today.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      clockOut: null,
      formattedHours: "0h 0m",
      status: "present",
      totalHours: "0",
      overtime: "0",
    };

    const optimisticData = {
      ...weeklyData,
      data: [
        optimisticRecord as unknown as BackendWeeklyRecord,
        ...weeklyData.data
          .filter((r) => r.id?.toString() !== "temp-id")
          .slice(0, 6),
      ],
    };

    try {
      setIsLoading(true);

      // Update the cache optimistically
      await mutateWeeklyData(optimisticData, false);

      // Make the API call
      const { data, error, status } = await clockInAction(token);

      if (error || status === 401) {
        throw new Error(error || "Authentication failed. Please log in again.");
      }

      if (data?.attendance) {
        const { date, clockIn } = data.attendance;
        const checkInDate = parseISO(clockIn);

        // Update local state
        setCheckInTime(checkInDate);
        setAttendanceStatus("checked_in");

        // Revalidate the cache
        await Promise.all([
          globalMutate(
            (key) => typeof key === "string" && key.includes("/attendance/")
          ),
          mutateWeeklyData(),
        ]);

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
      setIsActionInProgress(false);
    }
  };

  const handleCheckOutClick = () => {
    setShowCheckoutForm(true);
  };

  const handleCheckOut = async (checkoutData: {
    taskId?: number;
    taskStatus?: "planning" | "in-progress" | "testing" | "blocked" | "completed";
    workNote?: string;
    deliverableLink?: string;
    deliverables?: File[];
  }) => {
    if (isActionInProgress) return;
    
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Optimistic UI update
    if (!weeklyData) return;

    const optimisticData = {
      ...weeklyData,
      data: weeklyData.data.map((record) => {
        if (record.clockIn && !record.clockOut) {
          const updatedRecord: OptimisticAttendanceRecord = {
            ...record,
            id: record.id || "temp-id",
            clockOut: new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "present",
            formattedHours: "8h 0m",
            totalHours: "8",
            overtime: "0",
          };
          return updatedRecord as unknown as BackendWeeklyRecord;
        }
        return record;
      }),
    };

    try {
      setIsLoading(true);

      // Update the cache optimistically
      await mutateWeeklyData(optimisticData, false);

      // Make the API call with checkout data
      const { data, error } = await clockOutAction(token, checkoutData);

      if (error) throw new Error(error);

      // Update local state
      setAttendanceStatus("checked_out");
      setCheckInTime(null);
      setWorkingHours(0);
      setShowSuccess(true);

      // Revalidate the cache
      await Promise.all([
        globalMutate(
          (key) => typeof key === "string" && key.includes("/attendance/")
        ),
        mutateWeeklyData(),
      ]);

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
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsLoading(false);
      setIsActionInProgress(false);
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
              {attendanceStatus === "checked_in"
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
                  attendanceStatus === "checked_in"
                    ? "default"
                    : attendanceStatus === "checked_out"
                      ? "secondary"
                      : "outline"
                }
                className="text-sm"
              >
                {attendanceStatus === "checked_in"
                  ? "Checked In"
                  : attendanceStatus === "checked_out"
                    ? "Checked Out"
                    : "Not Checked In"}
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
              {attendanceStatus === "not_checked_in" ? (
                <Button 
                  onClick={handleCheckIn} 
                  className="w-full" 
                  size="lg" 
                  disabled={isLoading || isActionInProgress}
                >
                  {isActionInProgress ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {isActionInProgress ? "Checking In..." : "Check In"}
                </Button>
              ) : attendanceStatus === "checked_in" ? (
                <Button
                  onClick={handleCheckOutClick}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || isActionInProgress}
                >
                  {isActionInProgress ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <AlertCircle className="mr-2 h-5 w-5" />}
                  {isActionInProgress ? "Checking Out..." : "Check Out"}
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
                  <Badge
                    variant={
                      attendanceStatus === "checked_in"
                        ? "default"
                        : attendanceStatus === "checked_out"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {attendanceStatus === "checked_in"
                      ? "Working"
                      : attendanceStatus === "checked_out"
                        ? "Completed"
                        : "Not Started"}
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your all-time attendance records</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* History Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="filterDate">Filter by Date</Label>
                <div className="relative">
                  <Input
                    id="filterDate"
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="pl-9"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Status</Label>
                <Select
                  value={historyStatus}
                  onValueChange={(value) => {
                    setHistoryStatus(value);
                    setHistoryPage(1);
                  }}
                >
                  <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilterDate("");
                    setHistoryStatus("all");
                    setHistoryPage(1);
                  }}
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="rounded-md border mb-4">
              <AttendanceHistoryTable
                data={historyData?.data?.map((record) => ({
                  ...record,
                  id: record.id?.toString() || "",
                  formattedHours: record.formattedHours || "0h 0m",
                }))}
                isLoading={isLoadingHistoryData}
                error={historyError}
              />
            </div>

            {/* Pagination Controls */}
            {historyData?.pagination && historyData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing Page <span className="font-medium">{historyPage}</span> of{" "}
                  <span className="font-medium">{historyData.pagination.totalPages}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage === 1 || isLoadingHistoryData}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHistoryPage((p) =>
                        Math.min(historyData.pagination.totalPages, p + 1)
                      )
                    }
                    disabled={
                      historyPage === historyData.pagination.totalPages ||
                      isLoadingHistoryData
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Form Dialog */}
      <CheckoutForm
        open={showCheckoutForm}
        onOpenChange={setShowCheckoutForm}
        onCheckout={handleCheckOut}
      />
    </>
  );
}
