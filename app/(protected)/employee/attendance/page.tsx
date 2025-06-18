"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

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

const mockEmployee = {
  name: "John Smith",
  email: "john@company.com",
  employeeId: "EMP001",
};

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
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (checkInTime) {
        const diff =
          (new Date().getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        setWorkingHours(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [checkInTime]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setIsCheckedIn(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setWorkingHours(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
              <CardTitle>Today's Summary</CardTitle>
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
                    {checkInTime ? checkInTime.toLocaleTimeString() : "-"}
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
