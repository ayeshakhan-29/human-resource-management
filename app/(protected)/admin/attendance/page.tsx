"use client";

import { useState, useEffect } from "react";
import { Search, Download, Users, Clock, Loader2 } from "lucide-react";
import { getAllAttendance } from "@/lib/actions/attendance.actions";
import { getAuthToken } from "@/lib/auth/token";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";

interface AttendanceRecord {
  id: number;
  employeeId: string;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  totalHours: string;
  status: string;
  overtime: string;
  email: string;
}

export default function AdminAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format time to 12-hour format
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";

    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Calculate total hours between two times
  const calculateTotalHours = (start: string | null, end: string | null) => {
    if (!start || !end) return "0";

    try {
      const [startHours, startMinutes] = start.split(":").map(Number);
      const [endHours, endMinutes] = end.split(":").map(Number);

      let diff = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
      if (diff < 0) diff += 24 * 60; // Handle overnight

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return (hours + minutes / 60).toFixed(1);
    } catch (error) {
      console.error("Error calculating hours:", error);
      return "0";
    }
  };

  // Determine status based on check-in/out times
  const determineStatus = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn) return "absent";
    if (clockOut) {
      const [, minutes] = clockIn.split(":").map(Number);
      return minutes > 15 ? "late" : "present";
    }
    return "present";
  };

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the auth token using the centralized auth function
        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Pass the token to getAllAttendance
        const { data, error } = await getAllAttendance(token);
        if (error) {
          throw new Error(error);
        }
        console.log(data, "data");
        if (data?.data) {
          const formattedData = data.data.map((record) => ({
            id: record.id,
            employeeId: `EMP${String(record.id).padStart(3, "0")}`,
            name: record.fullName,
            date: record.date,
            checkIn: record.clockIn ? formatTime(record.clockIn) : "-",
            checkOut: record.clockOut ? formatTime(record.clockOut) : "-",
            totalHours:
              record.clockIn && record.clockOut
                ? calculateTotalHours(record.clockIn, record.clockOut)
                : "0",
            status: determineStatus(record.clockIn, record.clockOut),
            overtime: "0", // You'll need to implement overtime calculation based on your business logic
            email: record.email,
          }));
          console.log(formattedData, "formattedData");
          setAttendanceData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance data");
        toast.error("Failed to load attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Filter data based on search and filters
  const filteredAttendance = attendanceData.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    // Filter by date if needed
    const today = new Date().toISOString().split("T")[0];
    const recordDate = new Date(record.date).toISOString().split("T")[0];
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = recordDate === today;
    } else if (dateFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      matchesDate = recordDate === yesterday.toISOString().split("T")[0];
    } // Add more date filters as needed
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
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
          { label: "Admin", href: "/admin" },
          { label: "Attendance" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Today
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  attendanceData.filter(
                    (r) => r.status === "present" || r.status === "late"
                  ).length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `Out of ${attendanceData.length} employees`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Late Arrivals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  attendanceData.filter((r) => r.status === "late").length
                )}
              </div>
              <p className="text-xs text-muted-foreground">After 9:00 AM</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  attendanceData.filter((r) => r.status === "absent").length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                No check-in recorded
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  attendanceData
                    .reduce(
                      (sum, record) =>
                        sum + Number.parseFloat(record.totalHours || "0"),
                      0
                    )
                    .toFixed(1)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Hours worked today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  Track employee attendance and working hours
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="early_leave">Early Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  <span className="ml-2">Loading attendance data...</span>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : filteredAttendance.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No attendance records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {record.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{record.name}</p>
                              <p className="text-sm text-gray-500">
                                {record.employeeId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              record.checkIn === "-" ? "text-gray-400" : ""
                            }
                          >
                            {record.checkIn}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              record.checkOut === "-" ? "text-gray-400" : ""
                            }
                          >
                            {record.checkOut}
                          </span>
                        </TableCell>
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
