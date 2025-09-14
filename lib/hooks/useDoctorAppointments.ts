"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";

export interface WebAppointment {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  appointmentDate: string;
  duration: number;
  type: "in_person" | "video_call" | "phone_call";
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  reason: string;
  notes?: string;
  createdAt?: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
}

interface UseDoctorAppointmentsResult {
  appointments: WebAppointment[];
  loading: boolean;
  error: string | null;
  stats: AppointmentStats | null;
  refresh: () => Promise<void>;
  upcoming: WebAppointment[];
}

export function useDoctorAppointments(): UseDoctorAppointmentsResult {
  const [appointments, setAppointments] = useState<WebAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AppointmentStats | null>(null);

  const calculateStats = useCallback(
    (list: WebAppointment[]): AppointmentStats => {
      const todayStr = new Date().toDateString();
      return {
        total: list.length,
        pending: list.filter((a) => a.status === "pending").length,
        confirmed: list.filter((a) => a.status === "confirmed").length,
        completed: list.filter((a) => a.status === "completed").length,
        cancelled: list.filter((a) => a.status === "cancelled").length,
        today: list.filter(
          (a) => new Date(a.appointmentDate).toDateString() === todayStr
        ).length,
      };
    },
    []
  );

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/appointments?limit=200");
      const raw = res.data.appointments || [];
      // Normalize shape defensively
      const data: WebAppointment[] = raw.map((a: any) => {
        const patient =
          typeof a.patient === "object" && a.patient
            ? {
                firstName: a.patient.firstName || "Unknown",
                lastName: a.patient.lastName || "Patient",
                phone: a.patient.phone,
                email: a.patient.email,
              }
            : { firstName: "Unknown", lastName: "Patient" };
        const normType = (a.type || "in_person").replace("-", "_");
        return {
          _id: a._id,
          patient,
          appointmentDate: a.appointmentDate,
          duration: a.duration || 30,
          type: normType,
          status: a.status,
          reason: a.reason || "General consultation",
          notes: a.notes,
          createdAt: a.createdAt,
        } as WebAppointment;
      });
      setAppointments(data);
      setStats(calculateStats(data));
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(
        (a) =>
          new Date(a.appointmentDate) >= now &&
          ["pending", "confirmed", "in_progress"].includes(a.status)
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
      )
      .slice(0, 5);
  }, [appointments]);

  return {
    appointments,
    loading,
    error,
    stats,
    refresh: fetchAppointments,
    upcoming,
  };
}
