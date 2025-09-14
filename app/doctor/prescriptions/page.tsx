"use client";
import React, { useEffect, useState } from "react";
import {
  Pill,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
} from "lucide-react";
import api from "@/lib/api";
import { patientAPI } from "@/services/patientAPI";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string; // now required for backend
  quantity: number; // added to satisfy backend model
}
interface Prescription {
  _id: string;
  patient: any;
  doctor: any;
  medications: Medication[];
  diagnosis?: string;
  notes?: string;
  status: string;
  prescriptionDate?: string;
  expiryDate?: string;
  pharmacy?: string;
  filled: boolean;
  filledDate?: string;
}

const STATUS_OPTIONS = ["all", "active", "completed", "cancelled", "expired"];

export default function DoctorPrescriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [creating, setCreating] = useState(false);
  const [newRx, setNewRx] = useState<{
    patientId: string;
    diagnosis: string;
    notes: string;
    medications: Medication[];
    medDraft: Medication;
  }>({
    patientId: "",
    diagnosis: "",
    notes: "",
    medications: [],
    medDraft: {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
    },
  });
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchTimeout, setPatientSearchTimeout] = useState<any>(null);
  const limit = 12;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/prescriptions?limit=${limit}&offset=${(page - 1) * limit}`;
      if (status !== "all") url += `&status=${status}`;
      const res = await api.get(url);
      setPrescriptions(res.data.prescriptions || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(
        Math.max(1, Math.ceil((res.data.pagination?.total || 0) / limit))
      );
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [status, page]);

  const refresh = () => load();
  const medsSummary = (m: Medication[]) =>
    m
      .map((x) => x.name)
      .slice(0, 3)
      .join(", ") + (m.length > 3 ? ` +${m.length - 3}` : "");

  const addMedication = () => {
    const d = newRx.medDraft;
    if (!d.name || !d.dosage || !d.frequency || !d.duration || !d.quantity)
      return;
    setNewRx((r) => ({
      ...r,
      medications: [...r.medications, { ...d, quantity: Number(d.quantity) }],
      medDraft: {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        quantity: 1,
      },
    }));
  };
  const removeMedication = (i: number) =>
    setNewRx((r) => ({
      ...r,
      medications: r.medications.filter((_, idx) => idx !== i),
    }));
  const createPrescription = async () => {
    if (
      !newRx.patientId ||
      !newRx.diagnosis ||
      newRx.medications.length === 0
    ) {
      setError("Patient, diagnosis & at least one medication required");
      return;
    }
    // validate meds fully before send
    const invalid = newRx.medications.find(
      (m) =>
        !m.name ||
        !m.dosage ||
        !m.frequency ||
        !m.duration ||
        !m.instructions?.toString().length ||
        !m.quantity
    );
    if (invalid) {
      setError(
        "Each medication needs name, dosage, frequency, duration, instructions & quantity"
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload = {
        patientId: newRx.patientId,
        diagnosis: newRx.diagnosis,
        notes: newRx.notes,
        medications: newRx.medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions || "",
          quantity: Number(m.quantity) || 1,
        })),
      };
      await api.post("/prescriptions", payload);
      setCreating(false);
      setNewRx({
        patientId: "",
        diagnosis: "",
        notes: "",
        medications: [],
        medDraft: {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          quantity: 1,
        },
      });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (creating) {
      // Load patients when modal opens (only once unless searching)
      if (patientOptions.length === 0) loadPatients();
    }
  }, [creating]);

  const loadPatients = async (query?: string) => {
    try {
      setLoadingPatients(true);
      let res;
      if (query && query.trim()) {
        res = await patientAPI.searchPatients(query.trim(), 1, 30);
        setPatientOptions(res.data || []);
      } else {
        const base = await patientAPI.getPatients(1, 100);
        setPatientOptions(base.data || []);
      }
    } catch (e) {
      // silent
    } finally {
      setLoadingPatients(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Pill className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />{" "}
            Prescriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and review issued prescriptions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="text-xs px-2 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-2 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-700/40"
              />
            ))}
          {!loading && prescriptions.length === 0 && (
            <div className="col-span-full text-sm text-slate-500 dark:text-slate-400">
              No prescriptions found.
            </div>
          )}
          {!loading &&
            prescriptions.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelected(p)}
                className="text-left group relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 hover:shadow-md transition flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">
                    {p.diagnosis || "Diagnosis"}
                  </span>
                  <span
                    className={
                      "px-2 py-0.5 rounded-full text-[10px] capitalize " +
                      (p.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-300")
                    }
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {p.notes || "No notes provided"}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    {p.prescriptionDate
                      ? new Date(p.prescriptionDate).toLocaleDateString()
                      : "-"}
                  </span>
                  <span>{p.filled ? "Filled" : "Unfilled"}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {medsSummary(p.medications)}
                </div>
              </button>
            ))}
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Page {page} of {pages} • {total} total
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                Prev
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-40 flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="w-full max-w-md h-full overflow-y-auto bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold tracking-tight flex items-center gap-2">
                <Pill className="w-4 h-4" /> Prescription
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Diagnosis
                </div>
                <div>{selected.diagnosis || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Patient
                </div>
                <div className="truncate">
                  {typeof selected.patient === "object"
                    ? `${selected.patient.firstName} ${selected.patient.lastName}`
                    : selected.patient}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Issued
                  </div>
                  <div className="text-xs">
                    {selected.prescriptionDate
                      ? new Date(selected.prescriptionDate).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Expiry
                  </div>
                  <div className="text-xs">
                    {selected.expiryDate
                      ? new Date(selected.expiryDate).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Medications
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selected.medications.map((m, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {m.dosage}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {m.frequency} • {m.duration} • Qty {m.quantity}
                      </div>
                      {m.instructions && (
                        <div className="text-slate-400">{m.instructions}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Notes
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selected.notes || "-"}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                <span
                  className={
                    "px-2 py-1 rounded-full " +
                    (selected.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : "bg-slate-500/10 text-slate-600 dark:text-slate-300")
                  }
                >
                  {selected.status}
                </span>
                {selected.filled && (
                  <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                    Filled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !loading && setCreating(false)}
          />
          <div className="relative w-full max-w-lg p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight flex items-center gap-2">
                <Pill className="w-4 h-4" /> New Prescription
              </h3>
              <button
                onClick={() => !loading && setCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Patient
                </label>
                {newRx.patientId ? (
                  <div className="flex items-start justify-between gap-3 p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60">
                    {(() => {
                      const sel = patientOptions.find(
                        (p) => p._id === newRx.patientId
                      );
                      return (
                        <div className="text-xs space-y-0.5">
                          <div className="font-medium">
                            {(sel?.firstName || "") +
                              " " +
                              (sel?.lastName || "")}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {sel?.email || sel?.phone || sel?._id}
                          </div>
                        </div>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() => setNewRx((r) => ({ ...r, patientId: "" }))}
                      className="text-[10px] px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={patientSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPatientSearch(val);
                        if (patientSearchTimeout)
                          clearTimeout(patientSearchTimeout);
                        const to = setTimeout(() => loadPatients(val), 400);
                        setPatientSearchTimeout(to);
                      }}
                      onFocus={() => {
                        if (patientOptions.length === 0) loadPatients();
                      }}
                      placeholder="Search name / email / phone"
                      className="w-full px-2 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                    />
                    <div className="relative">
                      <div className="max-h-52 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70 divide-y divide-slate-200 dark:divide-slate-700">
                        {loadingPatients && (
                          <div className="p-2 text-[11px] text-slate-500">
                            Loading patients...
                          </div>
                        )}
                        {!loadingPatients && patientOptions.length === 0 && (
                          <div className="p-2 text-[11px] text-slate-500">
                            No patients found
                          </div>
                        )}
                        {patientOptions.map((p) => (
                          <button
                            type="button"
                            key={p._id}
                            onClick={() =>
                              setNewRx((r) => ({ ...r, patientId: p._id }))
                            }
                            className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-slate-700/60 focus:bg-indigo-100 dark:focus:bg-slate-700/60 transition text-[11px] flex flex-col gap-0.5"
                          >
                            <span className="font-medium truncate">
                              {(p.firstName || "") + " " + (p.lastName || "")}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 truncate">
                              {p.email || p.phone || p._id}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Select a patient to prescribe for.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Diagnosis
                </label>
                <input
                  value={newRx.diagnosis}
                  onChange={(e) =>
                    setNewRx((r) => ({ ...r, diagnosis: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                  placeholder="Primary diagnosis"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Notes (optional)
                </label>
                <textarea
                  value={newRx.notes}
                  onChange={(e) =>
                    setNewRx((r) => ({ ...r, notes: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 resize-none"
                  placeholder="Additional clinical notes"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Medications
                  </label>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Name"
                    value={newRx.medDraft.name}
                    onChange={(e) =>
                      setNewRx((r) => ({
                        ...r,
                        medDraft: { ...r.medDraft, name: e.target.value },
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Dosage"
                    value={newRx.medDraft.dosage}
                    onChange={(e) =>
                      setNewRx((r) => ({
                        ...r,
                        medDraft: { ...r.medDraft, dosage: e.target.value },
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Frequency"
                    value={newRx.medDraft.frequency}
                    onChange={(e) =>
                      setNewRx((r) => ({
                        ...r,
                        medDraft: { ...r.medDraft, frequency: e.target.value },
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Duration"
                    value={newRx.medDraft.duration}
                    onChange={(e) =>
                      setNewRx((r) => ({
                        ...r,
                        medDraft: { ...r.medDraft, duration: e.target.value },
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={newRx.medDraft.quantity}
                    onChange={(e) =>
                      setNewRx((r) => ({
                        ...r,
                        medDraft: {
                          ...r.medDraft,
                          quantity: Number(e.target.value) || 1,
                        },
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <textarea
                    placeholder="Instructions"
                    value={newRx.medDraft.instructions}
                    onChange={(e) =>
                      setNewRx((r) => ({
                        ...r,
                        medDraft: {
                          ...r.medDraft,
                          instructions: e.target.value,
                        },
                      }))
                    }
                    rows={2}
                    className="col-span-2 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs resize-none"
                  />
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {newRx.medications.map((m, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 flex items-start justify-between gap-2 text-[11px]"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium">
                          {m.name}{" "}
                          <span className="text-slate-500 font-normal">
                            {m.dosage}
                          </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {m.frequency} • {m.duration} • Qty {m.quantity}
                        </div>
                        {m.instructions && (
                          <div className="text-slate-400 line-clamp-2">
                            {m.instructions}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeMedication(i)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  {newRx.medications.length === 0 && (
                    <div className="text-[11px] text-slate-500">
                      No medications added yet.
                    </div>
                  )}
                </div>
              </div>
              <button
                disabled={
                  loading ||
                  !newRx.patientId ||
                  !newRx.diagnosis ||
                  newRx.medications.length === 0
                }
                onClick={createPrescription}
                className="w-full text-sm px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Create Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
