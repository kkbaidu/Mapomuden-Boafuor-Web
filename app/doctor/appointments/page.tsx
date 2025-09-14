"use client";
import React, { useState } from "react";
import { useDoctorAppointments } from "../../../lib/hooks/useDoctorAppointments";
import { appointmentAPI } from "@/services/appointmentAPI";
import {
  X,
  CalendarDays,
  Clock,
  User,
  FileText,
  Check,
  Ban,
} from "lucide-react";

export default function DoctorAppointmentsPage() {
  return <AppointmentsClient />;
}

function AppointmentsClient() {
  const { appointments, loading, error, refresh } = useDoctorAppointments();
  const [selected, setSelected] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // NEW: local copy for optimistic updates
  const [localAppointments, setLocalAppointments] = useState<any[]>([]);
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Toasts
  const [toasts, setToasts] = useState<
    { id: number; type: "success" | "error"; message: string }[]
  >([]);
  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((tt) => tt.id !== id));
    }, 3500);
  };

  // Sync local when upstream changes
  React.useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  // Reset page when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, search]);

  const statusBadgeClasses = (status: string) => {
    const base = "px-2 py-1 text-[10px] rounded-full font-medium capitalize";
    switch (status) {
      case "pending":
        return (
          base +
          " bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        );
      case "confirmed":
        return (
          base +
          " bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
        );
      case "in_progress":
        return (
          base +
          " bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
        );
      case "completed":
        return (
          base +
          " bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        );
      case "cancelled":
        return (
          base +
          " bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
        );
      case "no_show":
        return (
          base +
          " bg-slate-200 text-slate-700 dark:bg-slate-600/40 dark:text-slate-300"
        );
      default:
        return (
          base +
          " bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-300"
        );
    }
  };

  const open = (apt: any) => {
    setSelected(apt);
    setActionError(null);
  };

  const close = () => {
    if (actionLoading) return; // prevent closing during action
    setSelected(null);
    setActionError(null);
  };

  const confirmAppointment = async () => {
    if (!selected) return;
    setActionLoading(true);
    setActionError(null);
    const originalStatus = selected.status;
    // Optimistic update
    setSelected((s: any) => ({ ...s, status: "confirmed" }));
    setLocalAppointments((list) =>
      list.map((a) =>
        a._id === selected._id ? { ...a, status: "confirmed" } : a
      )
    );
    try {
      await appointmentAPI.updateAppointmentStatus(selected._id, "confirmed");
      refresh();
      addToast("success", "Appointment confirmed");
    } catch (e: any) {
      // Revert on failure
      setSelected((s: any) => ({ ...s, status: originalStatus }));
      setLocalAppointments((list) =>
        list.map((a) =>
          a._id === selected._id ? { ...a, status: originalStatus } : a
        )
      );
      addToast("error", e.message || "Failed to confirm");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAppointment = async () => {
    if (!selected) return;
    setActionLoading(true);
    setActionError(null);
    const originalStatus = selected.status;
    setSelected((s: any) => ({ ...s, status: "cancelled" }));
    setLocalAppointments((list) =>
      list.map((a) =>
        a._id === selected._id ? { ...a, status: "cancelled" } : a
      )
    );
    try {
      await appointmentAPI.cancelAppointment(
        selected._id,
        "Cancelled by doctor"
      );
      refresh();
      addToast("success", "Appointment cancelled");
    } catch (e: any) {
      setSelected((s: any) => ({ ...s, status: originalStatus }));
      setLocalAppointments((list) =>
        list.map((a) =>
          a._id === selected._id ? { ...a, status: originalStatus } : a
        )
      );
      addToast("error", e.message || "Failed to cancel");
    } finally {
      setActionLoading(false);
    }
  };

  // Derived filtered list
  const filteredAppointments = React.useMemo(() => {
    return localAppointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (
        typeFilter !== "all" &&
        a.type !== typeFilter &&
        a.type?.replace("-", "_") !== typeFilter
      )
        return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const patientName = `${a.patient?.firstName || ""} ${
          a.patient?.lastName || ""
        }`.toLowerCase();
        if (
          !patientName.includes(term) &&
          !(a.reason || "").toLowerCase().includes(term)
        )
          return false;
      }
      return true;
    });
  }, [localAppointments, statusFilter, typeFilter, search]);

  const total = filteredAppointments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  const gotoPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="space-y-6 relative">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 text-xs rounded-md shadow border flex items-center gap-2 backdrop-blur-md ${
              t.type === "success"
                ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/15 border-rose-400/40 text-rose-700 dark:text-rose-300"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Appointments</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and review your schedule
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
            >
              {[
                "all",
                "pending",
                "confirmed",
                "in_progress",
                "completed",
                "cancelled",
                "no_show",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
            >
              {["all", "in_person", "video_call", "phone_call"].map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient / reason"
            className="flex-1 md:flex-none px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 min-w-[180px]"
          />
          <button
            onClick={refresh}
            className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>
      {/* Pagination controls (top optional) */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => gotoPage(1)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            «
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => gotoPage(currentPage - 1)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="px-2">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => gotoPage(currentPage + 1)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            ›
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => gotoPage(totalPages)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            »
          </button>
        </div>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100/60 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="text-left font-medium px-4 py-2">Patient</th>
              <th className="text-left font-medium px-4 py-2">Reason</th>
              <th className="text-left font-medium px-4 py-2">Date</th>
              <th className="text-left font-medium px-4 py-2">Time</th>
              <th className="text-left font-medium px-4 py-2">Type</th>
              <th className="text-left font-medium px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filteredAppointments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No appointments match filters.
                </td>
              </tr>
            )}
            {!loading &&
              paginated.map((a) => {
                const dt = new Date(a.appointmentDate);
                return (
                  <tr
                    key={a._id}
                    onClick={() => open(a)}
                    className="cursor-pointer border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition"
                  >
                    <td className="px-4 py-2 whitespace-nowrap font-medium">
                      {a.patient?.firstName} {a.patient?.lastName}
                    </td>
                    <td
                      className="px-4 py-2 max-w-xs truncate"
                      title={a.reason}
                    >
                      {a.reason}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {dt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {dt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize">
                      {a.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={statusBadgeClasses(a.status)}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls (bottom mandatory) */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => gotoPage(1)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            «
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => gotoPage(currentPage - 1)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="px-2">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => gotoPage(currentPage + 1)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            ›
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => gotoPage(totalPages)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-40"
          >
            »
          </button>
        </div>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-slate-900/60 backdrop-blur-sm"
            onClick={close}
          />
          <div className="w-full max-w-md h-full overflow-y-auto bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold tracking-tight flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <CalendarDays className="w-5 h-5" /> Appointment
              </h2>
              <button
                onClick={close}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {actionError && (
              <div className="text-xs rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 px-3 py-2">
                {actionError}
              </div>
            )}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                    Status
                  </div>
                  <span className={statusBadgeClasses(selected.status)}>
                    {selected.status.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                    Type
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 capitalize">
                    {selected.type?.replace("_", " ")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                    Date
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    {new Date(selected.appointmentDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                    Time
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    {new Date(selected.appointmentDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                  Patient
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>
                    {selected.patient?.firstName} {selected.patient?.lastName}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                  Reason
                </div>
                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selected.reason || "-"}
                </div>
              </div>
              {selected.notes && (
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400">
                    Notes
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-wrap">
                    {selected.notes}
                  </div>
                </div>
              )}
            </div>
            {selected.status === "pending" && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={confirmAppointment}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />{" "}
                  {actionLoading ? "..." : "Confirm"}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={cancelAppointment}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" /> {actionLoading ? "..." : "Cancel"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
