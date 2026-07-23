import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import BookingModal from "./BookingModal";
import { PageLoader, EmptyState } from "./ui";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import clsx from "clsx";

interface Period {
  period: number;
  time: string;
  isBooked: boolean;
  isPast?: boolean;
  booking: {
    id: string;
    purpose: string;
    status: string;
    bookedBy: { name: string; department: string };
  } | null;
}

interface HallData {
  hall: { id: string; name: string; capacity: number; location: string };
  periods: Period[];
}

const PERIODS = [
  { period: 1, time: "9:00 - 9:55" },
  { period: 2, time: "9:55 - 10:50" },
  { period: 3, time: "11:05 - 12:00" },
  { period: 4, time: "12:00 - 12:55" },
  { period: 5, time: "1:45 - 2:40" },
  { period: 6, time: "2:40 - 3:35" },
  { period: 7, time: "3:50 - 4:45" },
];

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const isSunday = (dateStr: string): boolean => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 0;
};

const nextNonSunday = (dateStr: string, offset: number): string => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + offset);
  while (date.getDay() === 0) {
    date.setDate(date.getDate() + (offset > 0 ? 1 : -1));
  }
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
};

const AvailabilityGrid: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [availability, setAvailability] = useState<HallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    hallId: string;
    hallName: string;
    period: number;
    time: string;
  } | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const fetchAvailability = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/availability?date=${selectedDate}`);
      setAvailability(res.data.availability);
    } catch {
      setError(true);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate]);

  const handleSlotClick = (
    hallId: string,
    hallName: string,
    period: number,
    time: string,
    isBooked: boolean,
    isPast?: boolean
  ) => {
    if (isBooked || isPast) return;
    setSelectedSlot({ hallId, hallName, period, time });
    setModalOpen(true);
  };

  const handleBook = async (purpose: string) => {
    if (!selectedSlot) return;
    try {
      await api.post("/bookings", {
        hallId: selectedSlot.hallId,
        date: selectedDate,
        period: selectedSlot.period,
        purpose,
      });
      toast.success("Booking request submitted");
      setModalOpen(false);
      setSelectedSlot(null);
      fetchAvailability();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  const navigateDate = (offset: number) => {
    setSelectedDate(nextNonSunday(selectedDate, offset));
  };

  const isHoliday = isSunday(selectedDate);
  const canGoPrev = selectedDate > today;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-ink-900">Book a Seminar Hall</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate(-1)}
            disabled={!canGoPrev}
            className="p-2.5 rounded-lg border border-neutral-200 bg-surface-0 text-ink-500 hover:bg-surface-100 hover:text-ink-900 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Previous day"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-neutral-200 bg-surface-0 text-sm font-medium text-ink-900 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors min-h-[44px]"
          >
            <CalendarDays size={16} className="text-ink-500 flex-shrink-0" />
            <span className="truncate">{formatDate(selectedDate)}</span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => {
              const val = e.target.value;
              if (val && isSunday(val)) {
                setSelectedDate(nextNonSunday(val, 1));
              } else {
                setSelectedDate(val);
              }
            }}
            className="sr-only"
          />
          <button
            onClick={() => navigateDate(1)}
            className="p-2.5 rounded-lg border border-neutral-200 bg-surface-0 text-ink-500 hover:bg-surface-100 hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Next day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-ink-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-success-50 border border-success-100" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-danger-50 border border-danger-100" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-neutral-200 border border-neutral-300" />
          <span>Past</span>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : isHoliday ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🏛️</div>
          <h3 className="text-lg font-semibold text-ink-900 mb-1">Sunday is a holiday</h3>
          <p className="text-sm text-ink-500">Seminar halls are closed on Sundays. Please select a weekday.</p>
        </div>
      ) : error ? (
        <EmptyState
          title="Couldn't load availability"
          description="Something went wrong. Please try again."
          actionLabel="Retry"
          onAction={fetchAvailability}
        />
      ) : availability.length === 0 ? (
        <EmptyState
          title="No halls configured"
          description="There are no seminar halls available for booking yet."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider sticky left-0 bg-surface-0 z-10 w-48">
                    Hall
                  </th>
                  {PERIODS.map((p) => (
                    <th
                      key={p.period}
                      className="px-2 py-3 text-center text-xs font-semibold text-ink-500 min-w-[90px]"
                    >
                      <div className="font-semibold text-ink-700">P{p.period}</div>
                      <div className="font-normal text-ink-300 mt-0.5">{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {availability.map((row, rowIdx) => (
                  <tr
                    key={row.hall.id}
                    className={clsx("border-b border-neutral-200 last:border-b-0", rowIdx % 2 === 1 && "bg-surface-100/50")}
                  >
                    <td className="px-4 py-3 sticky left-0 bg-surface-0 z-10 border-r border-neutral-200">
                      <div className="font-medium text-ink-900 text-sm">{row.hall.name}</div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        {row.hall.location}
                      </div>
                    </td>
                    {row.periods.map((p) => {
                      const isClickable = !p.isBooked && !p.isPast;
                      return (
                        <td key={p.period} className="px-1.5 py-2 text-center">
                          <button
                            onClick={() =>
                              handleSlotClick(row.hall.id, row.hall.name, p.period, p.time, p.isBooked, p.isPast)
                            }
                            disabled={!isClickable}
                            className={clsx(
                              "w-full py-3 px-1.5 rounded-lg text-xs font-medium transition-all duration-150 border",
                              p.isPast
                                ? "bg-neutral-200 text-ink-500 border-neutral-300 cursor-not-allowed"
                                : p.isBooked
                                  ? p.booking?.status === "CANCELLED"
                                    ? "bg-neutral-100 text-ink-500 border-neutral-200 cursor-not-allowed"
                                    : "bg-danger-50 text-danger-600 border-danger-100 cursor-not-allowed"
                                  : "bg-success-50 text-success-600 border-success-100 hover:bg-success-100 hover:border-success-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600"
                            )}
                            title={
                              p.isPast
                                ? "Past period"
                                : p.isBooked && p.booking
                                  ? `${p.booking.purpose} — ${p.booking.bookedBy?.name}`
                                  : "Click to book"
                            }
                          >
                            {p.isPast ? (
                              <span className="text-ink-300">&mdash;</span>
                            ) : p.isBooked ? (
                              <div className="space-y-0.5">
                                <div className="font-semibold">
                                  {p.booking?.status === "CANCELLED" ? "Cancelled" : "Booked"}
                                </div>
                                {p.booking?.bookedBy?.name && (
                                  <div className="text-[10px] opacity-75 truncate max-w-[75px] mx-auto">
                                    {p.booking.bookedBy.name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="flex items-center justify-center gap-1">
                                <span className="text-success-600 text-base leading-none">+</span>
                                Book
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && selectedSlot && (
        <BookingModal
          hallName={selectedSlot.hallName}
          period={selectedSlot.period}
          time={selectedSlot.time}
          date={selectedDate}
          onBook={handleBook}
          onClose={() => {
            setModalOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
};

export default AvailabilityGrid;
