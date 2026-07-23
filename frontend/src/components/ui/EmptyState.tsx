import React from "react";
import { CalendarX } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) onAction();
    if (actionTo) navigate(actionTo);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-200 flex items-center justify-center mb-4">
        {icon || <CalendarX size={24} className="text-ink-300" />}
      </div>
      <h3 className="text-lg font-semibold text-ink-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && (
        <button onClick={handleAction} className="btn-primary text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
