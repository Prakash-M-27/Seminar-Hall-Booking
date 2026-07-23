import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Loader2 } from "lucide-react";

interface BookingModalProps {
  hallName: string;
  period: number;
  time: string;
  date: string;
  onBook: (purpose: string) => Promise<void>;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ hallName, period, time, date, onBook, onClose }) => {
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    textareaRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;
    setLoading(true);
    await onBook(purpose);
    setLoading(false);
  };

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-surface-0 rounded-xl shadow-lg w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-ink-900">Book Hall</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-3">
            <div className="bg-surface-100 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Hall</span>
                <span className="font-medium text-ink-900">{hallName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Date</span>
                <span className="font-medium text-ink-900">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Period</span>
                <span className="font-medium text-ink-900">P{period} ({time})</span>
              </div>
            </div>

            <div>
              <label htmlFor="purpose" className="label-text">
                Purpose of Booking
              </label>
              <textarea
                ref={textareaRef}
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="e.g., Department meeting, Guest lecture..."
                required
              />
              {purpose.length > 0 && (
                <p className="text-xs text-ink-300 mt-1 text-right">{purpose.length} characters</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200">
            <button type="button" onClick={onClose} className="btn-ghost text-sm" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !purpose.trim()}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
