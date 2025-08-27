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
import { 
  Loader2, 
  Search, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Edit
} from "lucide-react";
import { AllAttendanceResponse } from "@/lib/types/attendance.types";

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  totalHours: string | null;
  status: 'active' | 'paused' | 'completed' | 'overtime';
  currentSession?: {
    startTime: string;
    duration: string;
  };
}

export default function TimeTrackingPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AllAttendanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

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
          // Transform attendance data to time entries
          if (result.data?.data) {
            const entries: TimeEntry[] = result.data.data.map(emp => ({
              id: emp.id.toString(),
              employeeId: emp.id.toString(),
              employeeName: emp.fullName,
              date: emp.date,
              clockIn: emp.clockIn,
              clockOut: emp.clockOut,
              totalHours: null,
              status: emp.clockIn && !emp.clockOut ? 'active' : 
                     emp.clockIn && emp.clockOut ? 'completed' : 'paused',
              currentSession: emp.clockIn && !emp.clockOut ? {
                startTime: emp.clockIn,
                duration: calculateDuration(emp.clockIn)
              } : undefined
            }));
            setTimeEntries(entries);
          }
        }
      } catch (err) {
        setError("Failed to fetch attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
    
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => clearInterval(timer);
  }, [token]);

  const calculateDuration = (startTime: string): string => {
    const start = new Date(`2000-01-01T${startTime}`);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatTime = (time?: string | null) => {
    if (!time) return "-";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <Play className="h-3 w-3" /> Active
        </Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
          <Pause className="h-3 w-3" /> Paused
        </Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>;
      case 'overtime':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Overtime
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStartSession = (employeeId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.employeeId === employeeId 
        ? { ...entry, status: 'active', clockIn: currentTime.toTimeString().slice(0, 8) }
        : entry
    ));
  };

  const handlePauseSession = (employeeId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.employeeId === employeeId 
        ? { ...entry, status: 'paused' }
        : entry
    ));
  };

  const handleStopSession = (employeeId: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.employeeId === employeeId 
        ? { ...entry, status: 'completed', clockOut: currentTime.toTimeString().slice(0, 8) }
        : entry
    ));
  };

  const handleRefresh = () => {
    // Refresh data
    window.location.reload();
  };

  // Filter data based on search and filters
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeSessions = timeEntries.filter(entry => entry.status === 'active').length;
  const completedSessions = timeEntries.filter(entry => entry.status === 'completed').length;
  const totalEmployees = timeEntries.length;

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Attendance", href: "/admin/attendance" },
          { label: "Time Tracking" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Monitor and manage employee time tracking in real-time</p>
        </div>

        {/* Current Time Display */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Current Time</h3>
                <p className="text-blue-600">Real-time monitoring</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900 font-mono">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-sm text-blue-600">
                  {currentTime.toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active Sessions</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{activeSessions}</div>
              <p className="text-xs text-green-600">Currently working</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{completedSessions}</div>
              <p className="text-xs text-blue-600">Sessions ended</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Employees</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{totalEmployees}</div>
              <p className="text-xs text-purple-600">In system</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
            <CardDescription>Manage time tracking sessions</CardDescription>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Table */}
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking Sessions</CardTitle>
            <CardDescription>
              Monitor active sessions and manage time entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Clock In</TableHead>
                    <TableHead className="font-semibold">Clock Out</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-3 text-blue-600" />
                          <span className="text-gray-600">Loading time tracking data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <XCircle className="h-8 w-8 text-red-400" />
                          <span className="text-red-600 font-medium">Error loading data</span>
                          <span>{error}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {entry.employeeName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{entry.employeeName}</div>
                              <div className="text-sm text-gray-500">{entry.date}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {entry.clockIn ? formatTime(entry.clockIn) : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {entry.clockOut ? formatTime(entry.clockOut) : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {entry.status === 'active' && entry.currentSession ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-600 animate-pulse" />
                              <span className="font-mono text-sm text-green-600">
                                {entry.currentSession.duration}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.status === 'paused' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleStartSession(entry.employeeId)}
                                className="h-8 px-3 bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            {entry.status === 'active' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handlePauseSession(entry.employeeId)}
                                  className="h-8 px-3"
                                >
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pause
                                </Button>
                                                                 <Button 
                                   size="sm" 
                                   variant="outline"
                                   onClick={() => handleStopSession(entry.employeeId)}
                                   className="h-8 px-3"
                                 >
                                   <Square className="h-3 w-3 mr-1" />
                                   Stop
                                 </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 px-3">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-8 w-8 text-gray-400" />
                          <span className="font-medium">No time tracking sessions found</span>
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
