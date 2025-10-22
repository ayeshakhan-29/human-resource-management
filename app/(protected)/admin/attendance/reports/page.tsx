'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
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
import { Loader2, Search, Download, Filter } from "lucide-react";
import { AllAttendanceResponse } from "@/lib/types/attendance.types";

export default function AttendanceReportPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AllAttendanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!token) {
        setError("No authentication token available");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getAllAttendance(token);
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data || null);
        }
      } catch (err) {
        setError("Failed to fetch attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  const formatTime = (time?: string | null) => {
    if (!time) return "-";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
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

  // Filter data based on search and filters
  const filteredData = data?.data?.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting attendance report...");
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Attendance", href: "/admin/attendance" },
          { label: "Attendance Reports" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600">View and analyze employee attendance records</p>
        </div>

        {/* Report Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>
              {error
                ? "Failed to load attendance data"
                : `Date: ${data?.date ?? "-"} • Total Records: ${data?.count ?? 0} • Filtered: ${filteredData.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data?.data?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Total Employees</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {data?.data?.filter(emp => emp.status?.toLowerCase() === 'present').length || 0}
                </div>
                <div className="text-sm text-green-600">Present</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {data?.data?.filter(emp => emp.status?.toLowerCase() === 'late').length || 0}
                </div>
                <div className="text-sm text-yellow-600">Late</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {data?.data?.filter(emp => emp.status?.toLowerCase() === 'absent').length || 0}
                </div>
                <div className="text-sm text-red-600">Absent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>Refine your attendance report view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees by name or email..."
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

              <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Detailed view of employee attendance for {data?.date ?? "today"}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-3 text-blue-600" />
                          <span className="text-gray-600">Loading attendance report...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-red-600 font-medium">Error loading report</span>
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
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(rec.date).toLocaleDateString("en-US", {
                                weekday: "long",
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
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
