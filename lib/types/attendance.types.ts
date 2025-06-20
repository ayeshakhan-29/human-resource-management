export interface AttendanceData {
  id: number;
  date: string;
  clockIn: string;
  clockOut: string | null;
  totalHours?: string;
  status: string;
}

export interface ClockInResponse {
  message: string;
  attendance: Omit<AttendanceData, 'clockOut' | 'totalHours'> & {
    clockIn: string;
  };
}

export interface ClockOutResponse {
  message: string;
  attendance: AttendanceData & {
    clockOut: string;
    totalHours: string;
  };
}

export interface AttendanceRecord {
  id: number;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  // Add other attendance-related fields as needed
}

export interface AttendanceError {
  error: string;
  message?: string;
}
