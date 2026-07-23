import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Modal, ConfirmDialog, EmptyState, PageLoader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

const ManageUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("STAFF");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      setError(true);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setDepartment("");
    setRole("STAFF");
    setFormErrors({});
    setFormOpen(false);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!department.trim()) errs.department = "Department is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await api.post("/users", { name: name.trim(), email: email.trim(), password, department: department.trim(), role });
      toast.success("User created");
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success("User deleted");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const isCurrentUser = (u: User) => currentUser?.id === u._id || currentUser?.email === u.email;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-ink-900">Manage Users</h2>
        <button onClick={() => { resetForm(); setFormOpen(true); }} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} />
          Add User
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <EmptyState
          title="Couldn't load users"
          description="Something went wrong. Please try again."
          actionLabel="Retry"
          onAction={fetchUsers}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Add your first user to get started."
          actionLabel="Add User"
          onAction={() => { resetForm(); setFormOpen(true); }}
        />
      ) : (
        <>
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-surface-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Department</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Role</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-neutral-200 last:border-b-0 hover:bg-surface-100/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-sm text-ink-900">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-ink-700">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-ink-700">{u.department}</td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            u.role === "ADMIN" ? "bg-brand-50 text-brand-600" : "bg-neutral-200 text-ink-500"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeleteTarget(u)}
                          disabled={isCurrentUser(u)}
                          className="p-2 rounded-lg text-ink-500 hover:text-danger-600 hover:bg-danger-50 focus:outline-none focus:ring-2 focus:ring-danger-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`Delete ${u.name}`}
                          title={isCurrentUser(u) ? "Cannot delete your own account" : `Delete ${u.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u._id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-ink-900">{u.name}</div>
                    <div className="text-xs text-ink-500">{u.email}</div>
                  </div>
                  <span
                    className={clsx(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      u.role === "ADMIN" ? "bg-brand-50 text-brand-600" : "bg-neutral-200 text-ink-500"
                    )}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-ink-500 mb-3">{u.department}</div>
                <button
                  onClick={() => setDeleteTarget(u)}
                  disabled={isCurrentUser(u)}
                  className="text-sm font-medium text-danger-600 bg-danger-50 px-3 py-2 rounded-lg hover:bg-danger-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isCurrentUser(u) ? "Your account" : "Delete user"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={formOpen} onClose={resetForm} title="Add User" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="label-text">Name</label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormErrors((p) => ({ ...p, name: "" })); }}
                className="input-field"
                placeholder="John Doe"
              />
              {formErrors.name && <p className="text-danger-600 text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="user-email" className="label-text">Email</label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFormErrors((p) => ({ ...p, email: "" })); }}
                className="input-field"
                placeholder="user@institution.edu"
              />
              {formErrors.email && <p className="text-danger-600 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="user-password" className="label-text">Password</label>
              <input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFormErrors((p) => ({ ...p, password: "" })); }}
                className="input-field"
                placeholder="Min. 6 characters"
              />
              {formErrors.password && <p className="text-danger-600 text-xs mt-1">{formErrors.password}</p>}
            </div>
            <div>
              <label htmlFor="user-dept" className="label-text">Department</label>
              <input
                id="user-dept"
                type="text"
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setFormErrors((p) => ({ ...p, department: "" })); }}
                className="input-field"
                placeholder="e.g., Computer Science"
              />
              {formErrors.department && <p className="text-danger-600 text-xs mt-1">{formErrors.department}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="user-role" className="label-text">Role</label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-auto"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200">
          <button onClick={resetForm} className="btn-ghost text-sm" disabled={submitting}>Cancel</button>
          <button onClick={handleSubmit} className="btn-primary text-sm flex items-center gap-2" disabled={submitting}>
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Create User
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={`Delete user "${deleteTarget?.email}"? This action cannot be undone.`}
        confirmLabel="Delete user"
        loading={deleting}
      />
    </div>
  );
};

export default ManageUsers;
