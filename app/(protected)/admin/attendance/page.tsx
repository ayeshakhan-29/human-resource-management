"use client";

import { useState } from "react";
import { Search, Download, Users, Clock } from "lucide-react";

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

const mockAttendanceData = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "John Smith",
    date: "2024-03-01",
    checkIn: "09:00 AM",
    checkOut: "05:30 PM",
    totalHours: "8.5",
    status: "present",
    overtime: "0.5",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Sarah Johnson",
    date: "2024-03-01",
    checkIn: "08:45 AM",
    checkOut: "05:15 PM",
    totalHours: "8.5",
    status: "present",
    overtime: "0.5",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Mike Davis",
    date: "2024-03-01",
    checkIn: "09:15 AM",
    checkOut: "05:45 PM",
    totalHours: "8.5",
    status: "late",
    overtime: "0.5",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Emily Chen",
    date: "2024-03-01",
    checkIn: "-",
    checkOut: "-",
    totalHours: "0",
    status: "absent",
    overtime: "0",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "David Wilson",
    date: "2024-03-01",
    checkIn: "08:30 AM",
    checkOut: "04:30 PM",
    totalHours: "8.0",
    status: "early_leave",
    overtime: "0",
  },
];

export default function AdminAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAttendance = mockAttendanceData.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
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
                {
                  mockAttendanceData.filter(
                    (r) => r.status === "present" || r.status === "late"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {mockAttendanceData.length} employees
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
                {mockAttendanceData.filter((r) => r.status === "late").length}
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
                {mockAttendanceData.filter((r) => r.status === "absent").length}
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
                {mockAttendanceData.reduce(
                  (sum, record) => sum + Number.parseFloat(record.totalHours),
                  0
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
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
