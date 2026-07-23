import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { StatusPill, ConfirmDialog, EmptyState, PageLoader } from "../../components/ui";
import type { StatusType } from "../../components/ui/StatusPill";
import { Check, Ban, X } from "lucide-react";

interface Booking {
  _id: string;
  hall: { name: string; location: string };
  user: { name: string; email: string; department: string };
  date: string;
  period: number;
  purpose: string;
  status: string;
}

const PERIOD_TIMES: Record<number, string> = {
  1: "9:00-9:55", 2: "9:55-10:50", 3: "11:05-12:00", 4: "12:00-12:55",
  5: "1:45-2:40", 6: "2:40-3:35", 7: "3:50-4:45",
};

const statusToPill = (s: string): StatusType => {
  const map: Record<string, StatusType> = { PENDING: "pending", APPROVED: "approved", REJECTED: "rejected", CANCELLED: "cancelled" };
  return map[s] || "pending";
};

const ManageBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; label: string } | null>(null);
  const [acting, setActing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (filterDate) params.append("date", filterDate);
      if (filterStatus) params.append("status", filterStatus);
      const res = await api.get(`/bookings?${params}`);
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
  }, [filterDate, filterStatus]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approvedToday: bookings.filter((b) => b.status === "APPROVED" && b.date.startsWith(today)).length,
    };
  }, [bookings]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActing(true);
    try {
      await api.put(`/bookings/${confirmAction.id}/${confirmAction.action}`);
      toast.success(`Booking ${confirmAction.action}d`);
      setConfirmAction(null);
      fetchBookings();
    } catch {
      toast.error(`Couldn't ${confirmAction.action} this booking`);
    } finally {
      setActing(false);
    }
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterStatus("");
  };

  const hasFilters = filterDate || filterStatus;

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <EmptyState
        title="Couldn't load bookings"
        description="Something went wrong. Please try again."
        actionLabel="Retry"
        onAction={fetchBookings}
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink-900 mb-6">All Bookings</h2>

      <div className="card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-500">Pending:</span>
          <span className="font-semibold text-warning-600 bg-warning-50 px-2 py-0.5 rounded-full">{summary.pending}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-500">Approved today:</span>
          <span className="font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">{summary.approvedToday}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="input-field w-full sm:w-auto"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 min-h-[44px] px-2 py-1">
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={hasFilters ? "Try adjusting your filters." : "No bookings have been made yet."}
          actionLabel={hasFilters ? "Clear filters" : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-surface-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Hall</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Requester</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Period</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Purpose</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-neutral-200 last:border-b-0 hover:bg-surface-100/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-ink-900">{b.hall?.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-ink-900">{b.user?.name}</div>
                        <div className="text-xs text-ink-500">{b.user?.department}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-700">
                        {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-700">P{b.period}</td>
                      <td className="px-4 py-3 text-sm text-ink-700 max-w-[180px] truncate">{b.purpose}</td>
                      <td className="px-4 py-3"><StatusPill status={statusToPill(b.status)} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => setConfirmAction({ id: b._id, action: "approve", label: "Approve" })}
                                className="inline-flex items-center gap-1 text-sm font-medium text-success-600 hover:text-success-700 bg-success-50 hover:bg-success-100 px-2.5 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-success-600"
                              >
                                <Check size={14} /> Approve
                              </button>
                          <button
                            onClick={() => setConfirmAction({ id: b._id, action: "reject", label: "Reject" })}
                            className="btn-danger-ghost text-xs py-2 px-3 min-h-[44px]"
                          >
                                Reject
                              </button>
                            </>
                          )}
                          {b.status !== "CANCELLED" && b.status !== "PENDING" && (
                            <button
                              onClick={() => setConfirmAction({ id: b._id, action: "cancel", label: "Cancel" })}
                              className="btn-ghost text-xs py-1 px-2"
                            >
                              <Ban size={14} className="mr-1" /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-ink-900">{b.hall?.name}</div>
                    <div className="text-xs text-ink-500">{b.user?.name} &middot; {b.user?.department}</div>
                  </div>
                  <StatusPill status={statusToPill(b.status)} />
                </div>
                <div className="text-sm text-ink-700 space-y-1 mb-3">
                  <div>
                    {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — P{b.period} ({PERIOD_TIMES[b.period] || ""})
                  </div>
                  <div className="text-ink-500 text-xs">{b.purpose}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {b.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => setConfirmAction({ id: b._id, action: "approve", label: "Approve" })}
                        className="text-sm font-medium text-success-600 bg-success-50 px-3 py-2 rounded-lg hover:bg-success-100 min-h-[44px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setConfirmAction({ id: b._id, action: "reject", label: "Reject" })}
                        className="text-sm font-medium text-danger-600 bg-danger-50 px-3 py-2 rounded-lg hover:bg-danger-100 min-h-[44px]"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status !== "CANCELLED" && b.status !== "PENDING" && (
                    <button
                      onClick={() => setConfirmAction({ id: b._id, action: "cancel", label: "Cancel" })}
                      className="text-sm font-medium text-ink-500 bg-surface-200 px-3 py-2 rounded-lg hover:bg-neutral-200 min-h-[44px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={`${confirmAction?.label || ""} booking`}
        message={`Are you sure you want to ${confirmAction?.action?.toLowerCase()} this booking?`}
        confirmLabel={confirmAction?.label || "Confirm"}
        loading={acting}
      />
    </div>
  );
};

export default ManageBookings;
