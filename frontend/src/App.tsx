import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AvailabilityGrid from "./components/AvailabilityGrid";
import MyBookings from "./pages/MyBookings";
import ManageHalls from "./pages/admin/ManageHalls";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers";

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">{children}</div>
);

const BookPage: React.FC = () => (
  <PageShell>
    <AvailabilityGrid />
  </PageShell>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: "bg-surface-0 border border-neutral-200 shadow-md rounded-lg text-sm font-medium text-ink-900",
            duration: 3000,
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <Navbar />
                <BookPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <Navbar />
                <PageShell>
                  <MyBookings />
                </PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/halls"
            element={
              <ProtectedRoute adminOnly>
                <Navbar />
                <PageShell>
                  <ManageHalls />
                </PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <Navbar />
                <PageShell>
                  <ManageBookings />
                </PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <Navbar />
                <PageShell>
                  <ManageUsers />
                </PageShell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/book" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
