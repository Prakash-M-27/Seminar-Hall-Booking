import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CalendarCheck, Menu, X, ChevronDown, LogOut } from "lucide-react";
import clsx from "clsx";

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
    setMenuOpen(false);
  }, [location.pathname, closeMobile]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (!user) return null;

  const navLinks = [
    { to: "/book", label: "Book Hall" },
    { to: "/my-bookings", label: "My Bookings" },
    ...(isAdmin
      ? [
          { to: "/admin/halls", label: "Halls" },
          { to: "/admin/bookings", label: "All Bookings" },
          { to: "/admin/users", label: "Users" },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-surface-0 border-b border-neutral-200 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/book" className="flex items-center gap-2 text-brand-600 font-semibold text-lg">
            <CalendarCheck size={22} />
            <span className="hidden sm:inline">Hall Booking</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive(link.to)
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink-500 hover:text-ink-900 hover:bg-surface-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="w-px h-6 bg-neutral-200" />
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-ink-700 max-w-[120px] truncate">{user.name}</span>
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    isAdmin ? "bg-brand-50 text-brand-600" : "bg-neutral-200 text-ink-500"
                  )}
                >
                  {user.role}
                </span>
                <ChevronDown size={14} className={clsx("text-ink-500 transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-surface-0 rounded-xl border border-neutral-200 shadow-lg z-50 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-200">
                      <p className="text-sm font-medium text-ink-900">{user.name}</p>
                      <p className="text-xs text-ink-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2.5 rounded-lg text-ink-500 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-900/40 animate-fade-in" onClick={closeMobile} />
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-72 bg-surface-0 shadow-lg animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{user.name}</p>
                  <span
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      isAdmin ? "bg-brand-50 text-brand-600" : "bg-neutral-200 text-ink-500"
                    )}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={closeMobile}
                className="p-2.5 rounded-lg text-ink-500 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 py-2 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={clsx(
                    "flex items-center px-4 py-3 text-sm font-medium transition-colors",
                    isActive(link.to)
                      ? "bg-brand-50 text-brand-600 border-r-2 border-brand-600"
                      : "text-ink-500 hover:bg-surface-100 hover:text-ink-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-neutral-200 p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
