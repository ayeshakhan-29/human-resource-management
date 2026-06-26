"use client";

import { Clock } from "lucide-react";
import { StatusBadge } from "@/components/attendance/StatusBadge";

type AttendanceStatus = "not_checked_in" | "checked_in" | "checked_out";

interface LiveClockCardProps {
  currentTime: Date;
  attendanceStatus: AttendanceStatus;
}

export function LiveClockCard({ currentTime, attendanceStatus }: LiveClockCardProps) {
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  const timeString = `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const weekday = currentTime.toLocaleDateString("en-US", { weekday: "long" });
  const month = currentTime.toLocaleDateString("en-US", { month: "long" });
  const day = currentTime.getDate();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Current Time</h3>
            <p className="text-xs text-gray-500">Live clock and status</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 tabular-nums">
                {timeString}
              </span>
              <span className="text-base sm:text-xl font-semibold text-gray-400 sm:mt-2">{ampm}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              {weekday}, {month} {day}
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Live
              </span>
            </div>
            <StatusBadge
              status={
                attendanceStatus === "checked_in"
                  ? "present"
                  : attendanceStatus === "checked_out"
                    ? "checked_out"
                    : "absent"
              }
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
