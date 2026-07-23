import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Modal, ConfirmDialog, EmptyState, PageLoader } from "../../components/ui";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

interface Hall {
  _id: string;
  name: string;
  capacity: number;
  location: string;
}

const ManageHalls: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Hall | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHalls = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/halls");
      setHalls(res.data);
    } catch {
      setError(true);
      toast.error("Failed to load halls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const resetForm = () => {
    setName("");
    setCapacity("");
    setLocation("");
    setEditId(null);
    setFormErrors({});
    setFormOpen(false);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (hall: Hall) => {
    setName(hall.name);
    setCapacity(hall.capacity.toString());
    setLocation(hall.location);
    setEditId(hall._id);
    setFormErrors({});
    setFormOpen(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Hall name is required";
    if (!capacity || parseInt(capacity) < 1) errs.capacity = "Capacity must be a positive number";
    if (!location.trim()) errs.location = "Location is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const data = { name: name.trim(), capacity: parseInt(capacity), location: location.trim() };
      if (editId) {
        await api.put(`/halls/${editId}`, data);
        toast.success("Hall updated");
      } else {
        await api.post("/halls", data);
        toast.success("Hall created");
      }
      resetForm();
      fetchHalls();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/halls/${deleteTarget._id}`);
      toast.success("Hall deleted");
      setDeleteTarget(null);
      fetchHalls();
    } catch {
      toast.error("Failed to delete hall");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-ink-900">Manage Halls</h2>
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} />
          Add Hall
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <EmptyState
          title="Couldn't load halls"
          description="Something went wrong. Please try again."
          actionLabel="Retry"
          onAction={fetchHalls}
        />
      ) : halls.length === 0 ? (
        <EmptyState
          title="No halls added yet"
          description="Add your first seminar hall to get started."
          actionLabel="Add Hall"
          onAction={openCreate}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-surface-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Capacity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Location</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map((h) => (
                    <tr key={h._id} className="border-b border-neutral-200 last:border-b-0 hover:bg-surface-100/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-sm text-ink-900">{h.name}</td>
                      <td className="px-4 py-3 text-sm text-ink-700">{h.capacity}</td>
                      <td className="px-4 py-3 text-sm text-ink-700">{h.location}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(h)}
                            className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={`Edit ${h.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(h)}
                            className="p-2 rounded-lg text-ink-500 hover:text-danger-600 hover:bg-danger-50 focus:outline-none focus:ring-2 focus:ring-danger-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={`Delete ${h.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {halls.map((h) => (
              <div key={h._id} className="card p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-medium text-sm text-ink-900">{h.name}</div>
                    <div className="text-xs text-ink-500">{h.location}</div>
                  </div>
                  <span className="text-xs font-medium text-ink-500 bg-surface-200 px-2 py-0.5 rounded-full">{h.capacity} seats</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(h)}
                    className="text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 min-h-[44px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(h)}
                    className="text-sm font-medium text-danger-600 bg-danger-50 px-3 py-1.5 rounded-lg hover:bg-danger-100 min-h-[44px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={formOpen} onClose={resetForm} title={editId ? "Edit Hall" : "Add Hall"}>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="hall-name" className="label-text">Hall Name</label>
            <input
              id="hall-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setFormErrors((p) => ({ ...p, name: "" })); }}
              className="input-field"
              placeholder="e.g., Seminar Hall 1"
            />
            {formErrors.name && <p className="text-danger-600 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="hall-capacity" className="label-text">Capacity</label>
            <input
              id="hall-capacity"
              type="number"
              value={capacity}
              onChange={(e) => { setCapacity(e.target.value); setFormErrors((p) => ({ ...p, capacity: "" })); }}
              className="input-field"
              placeholder="e.g., 100"
              min={1}
            />
            {formErrors.capacity && <p className="text-danger-600 text-xs mt-1">{formErrors.capacity}</p>}
          </div>
          <div>
            <label htmlFor="hall-location" className="label-text">Location</label>
            <input
              id="hall-location"
              type="text"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setFormErrors((p) => ({ ...p, location: "" })); }}
              className="input-field"
              placeholder="e.g., Block A, Floor 2"
            />
            {formErrors.location && <p className="text-danger-600 text-xs mt-1">{formErrors.location}</p>}
          </div>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200">
          <button onClick={resetForm} className="btn-ghost text-sm" disabled={submitting}>Cancel</button>
          <button onClick={handleSubmit} className="btn-primary text-sm flex items-center gap-2" disabled={submitting}>
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {editId ? "Update Hall" : "Create Hall"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete hall"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete hall"
        loading={deleting}
      />
    </div>
  );
};

export default ManageHalls;
