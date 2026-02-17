import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeeklyAttendanceRecord {
  id: string;
  date: string;
  day: string;
  clockIn: string | null;
  clockOut: string | null;
  formattedHours: string;
  status: string;
}

interface AttendanceHistoryTableProps {
  data: WeeklyAttendanceRecord[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

// Helper function to format time from 24h to 12h format
const formatTime = (timeString: string) => {
  if (!timeString) return "-";

  // Check if it's an ISO string or Date string
  const date = new Date(timeString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Fallback for HH:MM format
  const [hours, minutes] = timeString.split(":");
  if (hours && minutes) {
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }

  return timeString;
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

export function AttendanceHistoryTable({
  data,
  isLoading,
  error,
}: AttendanceHistoryTableProps) {
  return (
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading attendance history...
                </div>
              </TableCell>
            </TableRow>
          ) : data && data.length > 0 ? (
            data.map((record, index) => (
              <TableRow key={`${record.id || 'no-id'}-${record.date}-${index}`}>
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
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                {error
                  ? "Error loading attendance records"
                  : "No attendance records found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
