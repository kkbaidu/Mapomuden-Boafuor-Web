"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Stethoscope,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Pill,
  Brain,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/doctor");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      router.push("/doctor");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 text-slate-50 overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[34rem] h-[34rem] bg-blue-500/30 dark:bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left / Branding Panel */}
        <div className="hidden md:flex flex-col gap-8 py-4 pr-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight leading-tight">
                  Mapomuden Doctor Portal
                </h1>
                <p className="text-sm text-slate-200/80 max-w-sm">
                  Deliver better care with streamlined appointments, clinical
                  summaries, prescriptions and AI support.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                {
                  icon: Shield,
                  label: "Secure Access",
                  desc: "HIPAA mindful handling",
                },
                {
                  icon: Clock,
                  label: "Smart Scheduling",
                  desc: "Realtime status",
                },
                { icon: Pill, label: "Rx Management", desc: "Fast issuance" },
                {
                  icon: Brain,
                  label: "AI Insights",
                  desc: "Clinical summaries",
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-2"
                >
                  <f.icon className="w-4 h-4 text-indigo-200" />
                  <div>
                    <p className="font-medium text-slate-50/90 leading-tight">
                      {f.label}
                    </p>
                    <p className="text-[10px] text-slate-300/70 mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto text-[11px] text-slate-300/60">
            © {new Date().getFullYear()} Mapomuden. All rights reserved.
          </div>
        </div>

        {/* Right / Auth Card */}
        <Card className="relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/60 shadow-xl shadow-slate-900/10 dark:shadow-black/40">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex items-center justify-center md:hidden">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <CardTitle className="text-2xl tracking-tight font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                Sign In
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                Access your clinical workspace
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2 pb-8">
            {error && (
              <div className="flex items-start gap-2 text-sm rounded-md border border-red-400/40 bg-red-100/70 dark:bg-red-500/10 dark:border-red-500/30 px-3 py-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  className="text-gray-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10 text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Only verified doctors can sign in</span>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-sm font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                size="lg"
                isLoading={isLoading || authLoading}
                disabled={isLoading || authLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
            <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Contact administration if you need access.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
