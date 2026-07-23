import React from "react";
import clsx from "clsx";
import { Check, Clock, XCircle, Ban, Plus, Lock } from "lucide-react";

type StatusType =
  | "approved"
  | "pending"
  | "rejected"
  | "cancelled"
  | "available"
  | "booked"
  | "past";

const statusConfig: Record<StatusType, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  approved: {
    bg: "bg-success-50",
    text: "text-success-600",
    label: "Approved",
    icon: <Check size={12} />,
  },
  pending: {
    bg: "bg-warning-50",
    text: "text-warning-600",
    label: "Pending",
    icon: <Clock size={12} />,
  },
  rejected: {
    bg: "bg-danger-50",
    text: "text-danger-600",
    label: "Rejected",
    icon: <XCircle size={12} />,
  },
  cancelled: {
    bg: "bg-neutral-100",
    text: "text-ink-500",
    label: "Cancelled",
    icon: <Ban size={12} />,
  },
  available: {
    bg: "bg-success-50",
    text: "text-success-600",
    label: "Available",
    icon: <Plus size={12} />,
  },
  booked: {
    bg: "bg-danger-50",
    text: "text-danger-600",
    label: "Booked",
    icon: <Lock size={12} />,
  },
  past: {
    bg: "bg-neutral-200",
    text: "text-ink-500",
    label: "Past",
    icon: <span className="text-xs">—</span>,
  },
};

interface StatusPillProps {
  status: StatusType;
  size?: "sm" | "md";
}

const StatusPill: React.FC<StatusPillProps> = ({ status, size = "sm" }) => {
  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap",
        config.bg,
        config.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusPill;
export type { StatusType };
