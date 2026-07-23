import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-danger-600" />
          </div>
          <p className="text-ink-500 text-sm leading-relaxed pt-2">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200">
        <button onClick={onClose} className="btn-ghost text-sm" disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger text-sm" disabled={loading}>
          {loading ? "Processing..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
