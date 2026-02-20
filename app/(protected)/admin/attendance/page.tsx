'use client';

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/header";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllAttendance } from "@/lib/actions/attendance.actions";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Search, Download, Calendar, Users, Clock, TrendingUp, Filter, RefreshCw } from "lucide-react";
import { AllAttendanceResponse } from "@/lib/types/attendance.types";

export default function AttendanceReportsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AllAttendanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAttendance = useCallback(async () => {
    if (!token) {
      setError("No authentication token available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getAllAttendance(token, selectedDate);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || null);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch attendance data");
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, [token, selectedDate]);

  useEffect(() => {
    // Initial fetch
    fetchAttendance();
  }, [fetchAttendance]);

  const formatTime = (time?: string | null) => {
    if (!time) return "-";
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    }
    const parts = time.split(":");
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const statusBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "present")
      return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>;
    if (normalized === "late")
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Late</Badge>;
    if (normalized === "absent")
      return <Badge className="bg-red-100 text-red-800 border-red-200">Absent</Badge>;
    if (normalized === "early_leave")
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Early Leave</Badge>;
    return <Badge variant="secondary">{status || "-"}</Badge>;
  };

  // Calculate statistics
  const totalEmployees = data?.data?.length || 0;
  const presentEmployees = data?.data?.filter(emp => emp.status?.toLowerCase() === 'present').length || 0;
  const lateEmployees = data?.data?.filter(emp => emp.status?.toLowerCase() === 'late').length || 0;
  const absentEmployees = data?.data?.filter(emp => emp.status?.toLowerCase() === 'absent').length || 0;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 0;

  // Filter data based on search and filters
  const filteredData = data?.data?.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting attendance data...");
  };

  const handleRefresh = () => {
    fetchAttendance();
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Attendance", href: "/admin/attendance" },
          { label: "Daily Attendance" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
          <p className="text-gray-600">Monitor employee attendance and generate comprehensive reports</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalEmployees}</div>
              <p className="text-xs text-blue-600">Active workforce</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Present Today</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{presentEmployees}</div>
              <p className="text-xs text-green-600">{attendanceRate}% attendance rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Late Arrivals</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{lateEmployees}</div>
              <p className="text-xs text-yellow-600">Need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Absent</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{absentEmployees}</div>
              <p className="text-xs text-red-600">Follow up required</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>Refine your attendance data view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="early_leave">Early Leave</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-full sm:w-[200px] relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>
              {error
                ? "Failed to load attendance data"
                : `Date: ${data?.date ?? "-"} • Showing ${filteredData.length} of ${data?.count ?? 0} records • Last updated: ${lastRefresh.toLocaleTimeString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Check In</TableHead>
                    <TableHead className="font-semibold">Check Out</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-3 text-blue-600" />
                          <span className="text-gray-600">Loading attendance data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-red-600 font-medium">Error loading data</span>
                          <span>{error}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((rec) => (
                      <TableRow key={`${rec.id}-${rec.email}-${rec.date}`} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {rec.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {rec.fullName}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{rec.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(rec.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(rec.date).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {formatTime(rec.clockIn)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {formatTime(rec.clockOut)}
                          </span>
                        </TableCell>
                        <TableCell>{statusBadge(rec.status)}</TableCell>
                        <TableCell>
                          <Link href={`/admin/daily-work-records?employeeId=${rec.userId}&date=${rec.date}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-3">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-gray-400" />
                          <span className="font-medium">No attendance records found</span>
                          <span className="text-sm">Try adjusting your filters or search terms</span>
                        </div>
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


