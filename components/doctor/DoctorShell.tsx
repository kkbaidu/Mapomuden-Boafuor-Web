"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Brain,
  UserCog,
  LogOut,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/doctor",
    icon: <Stethoscope className="w-4 h-4" />,
  },
  {
    label: "Appointments",
    href: "/doctor/appointments",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Patients",
    href: "/doctor/patients",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Prescriptions",
    href: "/doctor/prescriptions",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "AI Assistant",
    href: "/doctor/ai-chat",
    icon: <Brain className="w-4 h-4" />,
  },
  {
    label: "Profile",
    href: "/doctor/profile",
    icon: <UserCog className="w-4 h-4" />,
  },
];

// Helper component for nav links (avoid duplication)
function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
              active
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/60"
            )}
          >
            <span
              className={clsx(
                "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200",
                active && "text-indigo-600 dark:text-indigo-300"
              )}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DoctorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* Mobile Sidebar (animated) */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="w-64 fixed md:hidden inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200/70 dark:border-slate-800/60 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg"
          >
            <div className="h-16 px-5 flex items-center border-b border-slate-200/70 dark:border-slate-700/60">
              <span className="font-semibold tracking-tight">
                Mapomuden Doctor
              </span>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} />
            <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/60">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always visible) */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-200/70 dark:border-slate-800/60 bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="h-16 px-5 flex items-center border-b border-slate-200/70 dark:border-slate-700/60 font-semibold tracking-tight">
          Mapomuden Doctor
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/60">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2 rounded-md bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        <header className="h-16 border-b border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold tracking-tight text-lg">
              Doctor Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.role === "doctor" ? "Doctor" : ""}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.[0] || "D"}
              {user?.lastName?.[0] || ""}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
