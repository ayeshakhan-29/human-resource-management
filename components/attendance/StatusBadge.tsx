import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; ring: string }> = {
  present: {
    label: "Working",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  checked_out: {
    label: "Checked Out",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  late: {
    label: "Late",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  absent: {
    label: "Absent",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-600/20",
  },
  half_day: {
    label: "Half Day",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-600/20",
  },
  holiday: {
    label: "Holiday",
    dot: "bg-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-600/20",
  },
  weekend: {
    label: "Weekend",
    dot: "bg-sky-500",
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/20",
  },
  leave: {
    label: "On Leave",
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
  },
  early_leave: {
    label: "Early Leave",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/20",
  },
};

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" | "lg" }) {
  const config = statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
    dot: "bg-gray-400",
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset font-medium",
        config.bg,
        config.text,
        config.ring,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : size === "md" ? "px-3 py-1 text-sm" : "px-4 py-1.5 text-sm"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
