"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserCog, Save, RefreshCw, Plus, X } from "lucide-react";

interface Specialization {
  name: string;
  certification?: string;
  yearsOfExperience: number;
}
interface Education {
  degree: string;
  institution: string;
  year: number;
}
interface Certification {
  name: string;
  institution: string;
  year: number;
  expiryDate?: string;
}
interface ConsultationFees {
  inPerson: number;
  videoCall: number;
  phoneCall: number;
  currency: string;
}
interface DoctorProfile {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
  };
  licenseNumber: string;
  specializations: Specialization[];
  hospital?: string;
  clinic?: string;
  address?: string;
  bio?: string;
  experience: number;
  languages: string[];
  education: Education[];
  certifications: Certification[];
  consultationFees: ConsultationFees;
}

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [langInput, setLangInput] = useState("");
  const [specDraft, setSpecDraft] = useState<Specialization>({
    name: "",
    certification: "",
    yearsOfExperience: 1,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors/profile/me");
      setProfile(res.data.doctorProfile);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const updateField = (field: keyof DoctorProfile, value: any) => {
    setProfile((p) => (p ? { ...p, [field]: value } : p));
  };

  const addLanguage = () => {
    if (!langInput.trim()) return;
    setProfile((p) =>
      p ? { ...p, languages: [...p.languages, langInput.trim()] } : p
    );
    setLangInput("");
  };
  const removeLanguage = (l: string) =>
    setProfile((p) =>
      p ? { ...p, languages: p.languages.filter((x) => x !== l) } : p
    );

  const addSpec = () => {
    if (!specDraft.name.trim()) return;
    setProfile((p) =>
      p ? { ...p, specializations: [...p.specializations, specDraft] } : p
    );
    setSpecDraft({ name: "", certification: "", yearsOfExperience: 1 });
  };
  const removeSpec = (name: string) =>
    setProfile((p) =>
      p
        ? {
            ...p,
            specializations: p.specializations.filter((s) => s.name !== name),
          }
        : p
    );

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        bio: profile.bio,
        hospital: profile.hospital,
        clinic: profile.clinic,
        address: profile.address,
        experience: profile.experience,
        languages: profile.languages,
        specializations: profile.specializations,
        consultationFees: profile.consultationFees,
      };
      await api.put("/doctors/profile", payload);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />{" "}
            Doctor Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update professional information visible to patients.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={load}
            disabled={loading || saving}
            className="px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-600 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className="w-3 h-3" /> Reload
          </button>
          <button
            onClick={save}
            disabled={saving || loading}
            className="px-3 py-2 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1 disabled:opacity-50"
          >
            <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading profile...
        </div>
      )}
      {!loading && profile && (
        <div className="space-y-8">
          {/* Basic */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-5">
            <h2 className="font-semibold tracking-tight">Professional Bio</h2>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Bio
                </label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 resize-none"
                  placeholder="Short professional introduction"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Hospital
                </label>
                <input
                  value={profile.hospital || ""}
                  onChange={(e) => updateField("hospital", e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                  placeholder="Hospital name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Clinic
                </label>
                <input
                  value={profile.clinic || ""}
                  onChange={(e) => updateField("clinic", e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                  placeholder="Clinic name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Address
                </label>
                <input
                  value={profile.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                  placeholder="Practice address"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Years Experience
                </label>
                <input
                  type="number"
                  min={0}
                  value={profile.experience}
                  onChange={(e) =>
                    updateField("experience", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                />
              </div>
            </div>
          </div>
          {/* Languages & Specializations */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight">Languages</h3>
                <div className="flex items-center gap-1">
                  <input
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    placeholder="Add language"
                    className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                  />
                  <button
                    onClick={addLanguage}
                    className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {profile.languages.map((l) => (
                  <span
                    key={l}
                    className="group px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1"
                  >
                    {l}
                    <button
                      onClick={() => removeLanguage(l)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {profile.languages.length === 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    No languages added.
                  </span>
                )}
              </div>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight">
                  Specializations
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <input
                    placeholder="Name"
                    value={specDraft.name}
                    onChange={(e) =>
                      setSpecDraft((s) => ({ ...s, name: e.target.value }))
                    }
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 w-28"
                  />
                  <input
                    placeholder="Cert"
                    value={specDraft.certification}
                    onChange={(e) =>
                      setSpecDraft((s) => ({
                        ...s,
                        certification: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 w-24"
                  />
                  <input
                    type="number"
                    placeholder="Years"
                    min={0}
                    value={specDraft.yearsOfExperience}
                    onChange={(e) =>
                      setSpecDraft((s) => ({
                        ...s,
                        yearsOfExperience: Number(e.target.value),
                      }))
                    }
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 w-16"
                  />
                  <button
                    onClick={addSpec}
                    className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {profile.specializations.map((s) => (
                  <div
                    key={s.name + s.yearsOfExperience}
                    className="p-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-900/50 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                          {s.yearsOfExperience}y
                        </span>
                      </div>
                      {s.certification && (
                        <div className="text-slate-500 dark:text-slate-400">
                          {s.certification}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeSpec(s.name)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {profile.specializations.length === 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    No specializations added.
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Consultation Fees */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight">Consultation Fees</h3>
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              {(
                ["inPerson", "videoCall", "phoneCall"] as Array<
                  keyof ConsultationFees
                >
              ).map((k) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                    {k === "inPerson"
                      ? "In-Person"
                      : k === "videoCall"
                      ? "Video Call"
                      : "Phone Call"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={(profile.consultationFees as any)[k]}
                    onChange={(e) =>
                      updateField("consultationFees", {
                        ...profile.consultationFees,
                        [k]: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Currency
                </label>
                <input
                  value={profile.consultationFees.currency}
                  onChange={(e) =>
                    updateField("consultationFees", {
                      ...profile.consultationFees,
                      currency: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
