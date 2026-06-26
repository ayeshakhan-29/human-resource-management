"use client";

import { LogIn, LogOut, CheckCircle2, Loader2 } from "lucide-react";

type AttendanceStatus = "not_checked_in" | "checked_in" | "checked_out";

interface AttendanceActionCardProps {
  attendanceStatus: AttendanceStatus;
  isActionInProgress: boolean;
  checkInTime: Date | null;
  workingHours: number;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function AttendanceActionCard({
  attendanceStatus,
  isActionInProgress,
  checkInTime,
  workingHours,
  onCheckIn,
  onCheckOut,
}: AttendanceActionCardProps) {
  const isLoaded = true;

  const renderButton = () => {
    if (attendanceStatus === "not_checked_in") {
      return (
        <button
          onClick={onCheckIn}
          disabled={isActionInProgress || !isLoaded}
          className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
          aria-label="Check in to start your work day"
        >
          {isActionInProgress ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline">Checking In...</span>
              <span className="sm:hidden">Checking in...</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              Check In
            </>
          )}
        </button>
      );
    }

    if (attendanceStatus === "checked_in") {
      return (
        <button
          onClick={onCheckOut}
          disabled={isActionInProgress || !isLoaded}
          className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-rose-600 to-red-600 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-rose-500 hover:to-red-500 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
          aria-label="Check out and end your work day"
        >
          {isActionInProgress ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline">Checking Out...</span>
              <span className="sm:hidden">Checking out...</span>
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              Check Out
            </>
          )}
        </button>
      );
    }

    return (
      <button
        disabled
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gray-50 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-gray-400 ring-1 ring-gray-200 cursor-not-allowed"
        aria-label="Already checked out for today"
      >
        <CheckCircle2 className="h-5 w-5" />
        Already Checked Out
      </button>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            {attendanceStatus === "not_checked_in" ? (
              <LogIn className="h-5 w-5 text-blue-600" />
            ) : attendanceStatus === "checked_in" ? (
              <LogOut className="h-5 w-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Attendance Action</h3>
            <p className="text-xs text-gray-500">
              {attendanceStatus === "not_checked_in"
                ? "Start your work day"
                : attendanceStatus === "checked_in"
                  ? "End your work day"
                  : "Today's attendance completed"}
            </p>
          </div>
        </div>

        <div className="mb-4">{renderButton()}</div>

        {checkInTime && attendanceStatus === "checked_in" && (
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Checked in at</span>
              <span className="font-medium text-gray-900">
                {checkInTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1.5">
              <span className="text-gray-500">Working for</span>
              <span className="font-medium text-gray-900">{workingHours.toFixed(1)} hours</span>
            </div>
          </div>
        )}

        {attendanceStatus === "checked_out" && (
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-center text-sm font-medium text-emerald-700">
              You&apos;ve completed your attendance for today
            </p>
          </div>
        )}

        {attendanceStatus === "not_checked_in" && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-center text-sm text-gray-500">
              Click the button above to start tracking your work hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
