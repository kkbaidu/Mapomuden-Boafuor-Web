"use client";
import React, { useEffect, useState } from "react";
import { patientAPI } from "@/services/patientAPI";
import { useRouter } from "next/navigation";

interface PatientRow {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  appointmentCount?: number;
  lastVisit?: string | null;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientAPI.getPatients(1, 300);
      if (res.success) setPatients(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = patients.filter((p) => {
    const s = search.toLowerCase();
    return (
      !search ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s) ||
      p.phone?.includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Patients</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Patients you have interacted with via appointments
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
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
              <th className="text-left font-medium px-4 py-2">Name</th>
              <th className="text-left font-medium px-4 py-2">Email</th>
              <th className="text-left font-medium px-4 py-2">Phone</th>
              <th className="text-left font-medium px-4 py-2">Appointments</th>
              <th className="text-left font-medium px-4 py-2">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                >
                  No patients found.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => router.push(`/doctor/patients/${p._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/doctor/patients/${p._id}`);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`View details for ${p.firstName} ${p.lastName}`}
                  className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <td className="px-4 py-2 whitespace-nowrap font-medium">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {p.email || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {p.phone || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {p.appointmentCount ?? 0}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    {p.lastVisit
                      ? new Date(p.lastVisit).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
