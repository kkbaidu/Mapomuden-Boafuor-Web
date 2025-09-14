import React from "react";
import DoctorShell from "../../components/doctor/DoctorShell";
import AuthGuard from "@/components/AuthGuard";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DoctorShell>{children}</DoctorShell>
    </AuthGuard>
  );
}
