import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CalendarCheck } from "lucide-react";

const AuthLoading: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-surface-100 gap-3">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
      <div className="absolute inset-0 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
    </div>
    <div className="flex items-center gap-2 text-brand-600 font-semibold">
      <CalendarCheck size={18} />
      Hall Booking
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/book" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
