import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { StatusPill, EmptyState, ConfirmDialog } from "../components/ui";
import type { StatusType } from "../components/ui/StatusPill";
import { PageLoader } from "../components/ui";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

interface Booking {
  _id: string;
  hall: { name: string; location: string };
  date: string;
  period: number;
  purpose: string;
  status: string;
}

const PERIOD_TIMES: Record<number, string> = {
  1: "9:00 - 9:55",
  2: "9:55 - 10:50",
  3: "11:05 - 12:00",
  4: "12:00 - 12:55",
  5: "1:45 - 2:40",
  6: "2:40 - 3:35",
  7: "3:50 - 4:45",
};

type SortField = "date" | "status";
type SortDir = "asc" | "desc";

const statusOrder: Record<string, number> = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  CANCELLED: 3,
};

const statusToPill = (s: string): StatusType => {
  const map: Record<string, StatusType> = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  };
  return map[s] || "pending";
};

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch {
      setError(true);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (cmp === 0) cmp = a.period - b.period;
      } else {
        cmp = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [bookings, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${cancelTarget._id}/cancel`);
      toast.success("Booking cancelled");
      setCancelTarget(null);
      fetchBookings();
    } catch {
      toast.error("Couldn't cancel this booking — try again.");
    } finally {
      setCancelling(false);
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-ink-300" />;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="text-brand-600" />
    ) : (
      <ChevronDown size={14} className="text-brand-600" />
    );
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <EmptyState
        title="Couldn't load your bookings"
        description="Something went wrong. Please try again."
        actionLabel="Retry"
        onAction={fetchBookings}
      />
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="You haven't booked a hall yet"
        description="Browse available halls and time slots to make your first booking."
        actionLabel="Book a Hall"
        actionTo="/book"
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink-900 mb-6">My Bookings</h2>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-surface-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Hall</th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 text-xs font-semibold text-ink-500 uppercase tracking-wider hover:text-ink-900 focus:outline-none"
                >
                  Date <SortIcon field="date" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Period</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Purpose</th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 text-xs font-semibold text-ink-500 uppercase tracking-wider hover:text-ink-900 focus:outline-none"
                >
                  Status <SortIcon field="status" />
                </button>
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((b) => (
              <tr key={b._id} className="border-b border-neutral-200 last:border-b-0 hover:bg-surface-100/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-ink-900">{b.hall?.name}</div>
                  <div className="text-xs text-ink-500">{b.hall?.location}</div>
                </td>
                <td className="px-4 py-3 text-sm text-ink-700">
                  {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-sm text-ink-700">
                  P{b.period} <span className="text-ink-500">({PERIOD_TIMES[b.period] || ""})</span>
                </td>
                <td className="px-4 py-3 text-sm text-ink-700 max-w-[200px] truncate">{b.purpose}</td>
                <td className="px-4 py-3">
                  <StatusPill status={statusToPill(b.status)} />
                </td>
                <td className="px-4 py-3 text-right">
                  {(b.status === "PENDING" || b.status === "APPROVED") && (
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="text-sm font-medium text-danger-600 hover:text-danger-700 focus:outline-none focus:underline"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sortedBookings.map((b) => (
          <div key={b._id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-ink-900">{b.hall?.name}</div>
                <div className="text-xs text-ink-500">{b.hall?.location}</div>
              </div>
              <StatusPill status={statusToPill(b.status)} />
            </div>
            <div className="text-sm text-ink-700 space-y-1 mb-3">
              <div>
                {new Date(b.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                {" — "}P{b.period} ({PERIOD_TIMES[b.period] || ""})
              </div>
              <div className="text-ink-500 text-xs">{b.purpose}</div>
            </div>
            {(b.status === "PENDING" || b.status === "APPROVED") && (
              <button
                onClick={() => setCancelTarget(b)}
                className="text-sm font-medium text-danger-600 hover:text-danger-700 focus:outline-none min-h-[44px] px-3 py-2"
              >
                Cancel booking
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel booking"
        message={`Cancel your booking for ${cancelTarget?.hall?.name} on ${
          cancelTarget ? new Date(cancelTarget.date).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""
        }? This cannot be undone.`}
        confirmLabel="Cancel booking"
        loading={cancelling}
      />
    </div>
  );
};

export default MyBookings;
