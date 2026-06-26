"use client";

import { CalendarIcon, FilterX, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  filterDate: string;
  historyStatus: string;
  searchQuery: string;
  onDateChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onExport: () => void;
}

export function FilterBar({
  filterDate,
  historyStatus,
  searchQuery,
  onDateChange,
  onStatusChange,
  onSearchChange,
  onClear,
  onExport,
}: FilterBarProps) {
  const hasFilters = filterDate || historyStatus !== "all" || searchQuery;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="w-full sm:w-48">
          <Label htmlFor="search" className="text-xs font-medium text-gray-500 mb-1.5 block">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="search"
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="w-full sm:w-40">
          <Label htmlFor="filterDate" className="text-xs font-medium text-gray-500 mb-1.5 block">
            Date
          </Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="w-full sm:w-40">
          <Label htmlFor="statusFilter" className="text-xs font-medium text-gray-500 mb-1.5 block">
            Status
          </Label>
          <Select value={historyStatus} onValueChange={onStatusChange}>
            <SelectTrigger id="statusFilter" className="h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="half_day">Half Day</SelectItem>
              <SelectItem value="leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 sm:self-end"
            aria-label="Clear all filters"
          >
            <FilterX className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <button
        onClick={onExport}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="Export attendance data as CSV"
      >
        <Download className="h-4 w-4 text-gray-500" />
        Export CSV
      </button>
    </div>
  );
}
