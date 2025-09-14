"use client";
import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, ClipboardCheck, UserCheck } from "lucide-react";
import { useDoctorAppointments } from "../../../lib/hooks/useDoctorAppointments";

export default function DoctorDashboard() {
  const { stats, upcoming, loading, error, refresh } = useDoctorAppointments();

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats?.today ?? 0,
      icon: CalendarDays,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Completed",
      value: stats?.completed ?? 0,
      icon: ClipboardCheck,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Total Appointments",
      value: stats?.total ?? 0,
      icon: UserCheck,
      color: "from-fuchsia-500 to-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quick snapshot of your clinical activity
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      {error && (
        <div className="p-3 text-sm rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all overflow-hidden min-h-[140px]">
              <div
                className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl`}
              ></div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-semibold mt-2 tracking-tight">
                    {loading ? "..." : card.value}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-inner">
                  <card.icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-2/5 bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold tracking-tight">
              Upcoming Appointments
            </h3>
            <button
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => (window.location.href = "/doctor/appointments")}
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {loading && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Loading...
              </div>
            )}
            {!loading && upcoming.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                No upcoming appointments.
              </div>
            )}
            {!loading &&
              upcoming.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {a.patient?.firstName || "Unknown"}{" "}
                      {a.patient?.lastName || "Patient"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {a.reason}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(a.appointmentDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 capitalize">
                    {a.status.replace("_", " ")}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm"
        >
          <h3 className="font-semibold tracking-tight mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {["New Rx", "Find Patient", "AI Assist", "Profile"].map((a, i) => (
              <button
                key={a}
                className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 p-4 text-left hover:shadow-md transition"
              >
                <span className="block text-sm font-medium mb-1">{a}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {i === 0
                    ? "Create prescription"
                    : i === 1
                    ? "Patient lookup"
                    : i === 2
                    ? "AI guidance"
                    : "Update profile"}
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all bg-gradient-to-r from-indigo-500 to-blue-500" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
