"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Brain, FileText, Pill, Plus } from "lucide-react";

interface AppointmentBrief {
  _id: string;
  appointmentDate: string;
  reason: string;
  status: string;
  type: string;
}
interface PatientDetail {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  location?: string;
}
interface VitalSigns {
  _id?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  oxygenSaturation?: number;
  createdAt?: string;
  bloodPressure?: { systolic: number; diastolic: number };
}
interface MedicalCondition {
  condition: string;
  diagnosedDate?: string;
  status: "active" | "resolved" | "chronic" | string;
  notes?: string;
}
interface Allergy {
  allergen: string;
  reaction?: string;
  severity?: "mild" | "moderate" | "severe" | "critical" | string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [appointments, setAppointments] = useState<AppointmentBrief[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [addingVital, setAddingVital] = useState(false);
  const [newVital, setNewVital] = useState<{
    heartRate?: string;
    temperature?: string;
    weight?: string;
    systolic?: string;
    diastolic?: string;
    oxygen?: string;
  }>({});
  const [savingVital, setSavingVital] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState<
    MedicalCondition[]
  >([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [pastSurgeries, setPastSurgeries] = useState<any[]>([]);
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [familyHistory, setFamilyHistory] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [showNewRx, setShowNewRx] = useState(false);
  const [newRx, setNewRx] = useState<{
    diagnosis: string;
    notes: string;
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }[];
  }>({ diagnosis: "", notes: "", medications: [] });
  const [addingMedication, setAddingMedication] = useState<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string; // NEW
    instructions: string;
  }>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "1",
    instructions: "",
  });
  const [savingRx, setSavingRx] = useState(false);
  const [addingCondition, setAddingCondition] = useState(false);
  const [conditionDraft, setConditionDraft] = useState<{
    condition: string;
    diagnosedDate: string;
    status: string;
    notes: string;
  }>({ condition: "", diagnosedDate: "", status: "active", notes: "" });
  const [addingAllergy, setAddingAllergy] = useState(false);
  const [allergyDraft, setAllergyDraft] = useState<{
    allergen: string;
    reaction: string;
    severity: string;
  }>({ allergen: "", reaction: "", severity: "mild" });
  const [addingMedicationStr, setAddingMedicationStr] = useState("");
  const [editingVitalId, setEditingVitalId] = useState<string | null>(null);
  const [editVitalDraft, setEditVitalDraft] = useState<{
    heartRate?: string;
    temperature?: string;
    weight?: string;
    systolic?: string;
    diastolic?: string;
    oxygen?: string;
  }>({});

  useEffect(() => {
    if (patientId) load();
  }, [patientId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const patientRes = await api.get(`/auth/user/${patientId}`);
      const apptRes = await api.get("/appointments?limit=400");
      const related = (apptRes.data.appointments || [])
        .filter((a: any) => {
          if (!a.patient) return false;
          const pid = typeof a.patient === "object" ? a.patient._id : a.patient;
          return pid === patientId;
        })
        .map((a: any) => ({
          _id: a._id,
          appointmentDate: a.appointmentDate,
          reason: a.reason,
          status: a.status,
          type: a.type,
        }));
      setPatient(patientRes.data.user);

      // fetch medical record (if exists)
      try {
        const medRes = await api.get(`/medical-records/patient/${patientId}`);
        const record = medRes.data?.medicalRecord;
        setVitals(record?.vitalSigns || []);
        setMedicalConditions(record?.medicalConditions || []);
        setAllergies(record?.allergies || []);
        setMedications(record?.currentMedications || []);
        setPastSurgeries(record?.pastSurgeries || []);
        setImmunizations(record?.immunizations || []);
        setFamilyHistory(record?.familyHistory || []);
      } catch (e) {
        /* ignore */
      }
      // fetch prescriptions
      fetchPrescriptions();
      setAppointments(related);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load patient");
    } finally {
      setLoading(false);
    }
  };

  const addVitalSign = async () => {
    if (!patientId) return;
    setSavingVital(true);
    try {
      const payload: any = {};
      if (newVital.heartRate) payload.heartRate = Number(newVital.heartRate);
      if (newVital.temperature)
        payload.temperature = Number(newVital.temperature);
      if (newVital.weight) payload.weight = Number(newVital.weight);
      if (newVital.oxygen) payload.oxygenSaturation = Number(newVital.oxygen);
      if (newVital.systolic && newVital.diastolic)
        payload.bloodPressure = {
          systolic: Number(newVital.systolic),
          diastolic: Number(newVital.diastolic),
        };
      await api.post("/medical-records/vital-signs", payload, {
        headers: { "X-Patient-ID": patientId },
      });
      setNewVital({});
      setAddingVital(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to add vital signs");
    } finally {
      setSavingVital(false);
    }
  };

  const fetchSummary = async () => {
    if (!patientId) return;
    setLoadingSummary(true);
    setAiSummary(null);
    try {
      const res = await api.get(`/doctors/ai-summary/${patientId}`);
      setAiSummary(res.data.summary);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to generate AI summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchPrescriptions = async () => {
    if (!patientId) return;
    setLoadingPrescriptions(true);
    try {
      const res = await api.get(`/prescriptions?patient=${patientId}`);
      setPrescriptions(res.data.prescriptions || []);
    } catch (e: any) {
      /* silent */
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const addMedicationToDraft = () => {
    if (
      !addingMedication.name ||
      !addingMedication.dosage ||
      !addingMedication.frequency ||
      !addingMedication.duration ||
      !addingMedication.quantity
    )
      return;
    const qty = parseInt(addingMedication.quantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    setNewRx((r) => ({
      ...r,
      medications: [
        ...r.medications,
        {
          name: addingMedication.name,
          dosage: addingMedication.dosage,
          frequency: addingMedication.frequency,
          duration: addingMedication.duration,
          quantity: qty,
          instructions: addingMedication.instructions || "",
        },
      ],
    }));
    setAddingMedication({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "1",
      instructions: "",
    });
  };
  const removeMedication = (idx: number) =>
    setNewRx((r) => ({
      ...r,
      medications: r.medications.filter((_, i) => i !== idx),
    }));
  const savePrescription = async () => {
    if (!patientId) return;
    if (!newRx.diagnosis || newRx.medications.length === 0) {
      setError("Diagnosis & at least one medication required");
      return;
    }
    // Ensure all meds have required backend fields
    const payloadMeds = newRx.medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions || "",
      quantity: (m as any).quantity || 1,
    }));
    setSavingRx(true);
    setError(null);
    try {
      const payload = {
        patientId,
        diagnosis: newRx.diagnosis,
        notes: newRx.notes,
        medications: payloadMeds,
      };
      await api.post("/prescriptions", payload);
      setShowNewRx(false);
      setNewRx({ diagnosis: "", notes: "", medications: [] });
      fetchPrescriptions();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create prescription");
    } finally {
      setSavingRx(false);
    }
  };

  const addConditionHandler = async () => {
    if (!conditionDraft.condition || !conditionDraft.diagnosedDate) return;
    try {
      await api.post(
        "/medical-records/conditions",
        { ...conditionDraft },
        { headers: { "X-Patient-ID": patientId } }
      );
      setConditionDraft({
        condition: "",
        diagnosedDate: "",
        status: "active",
        notes: "",
      });
      setAddingCondition(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to add condition");
    }
  };
  const removeConditionHandler = async (id: any) => {
    try {
      await api.delete(`/medical-records/conditions/${id}`, {
        headers: { "X-Patient-ID": patientId },
      });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to remove condition");
    }
  };
  const addAllergyHandler = async () => {
    if (!allergyDraft.allergen || !allergyDraft.reaction) return;
    try {
      await api.post(
        "/medical-records/allergies",
        { ...allergyDraft },
        { headers: { "X-Patient-ID": patientId } }
      );
      setAllergyDraft({ allergen: "", reaction: "", severity: "mild" });
      setAddingAllergy(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to add allergy");
    }
  };
  const removeAllergyHandler = async (id: any) => {
    try {
      await api.delete(`/medical-records/allergies/${id}`, {
        headers: { "X-Patient-ID": patientId },
      });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to remove allergy");
    }
  };
  const addMedicationHandler = async () => {
    if (!addingMedicationStr.trim()) return;
    try {
      await api.post(
        "/medical-records/medications",
        { name: addingMedicationStr.trim() },
        { headers: { "X-Patient-ID": patientId } }
      );
      setAddingMedicationStr("");
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to add medication");
    }
  };
  const removeMedicationHandler = async (name: string) => {
    try {
      await api.delete(
        `/medical-records/medications/${encodeURIComponent(name)}`,
        { headers: { "X-Patient-ID": patientId } }
      );
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to remove medication");
    }
  };
  const startEditVital = (v: VitalSigns) => {
    setEditingVitalId(v._id || null);
    setEditVitalDraft({
      heartRate: v.heartRate?.toString() || "",
      temperature: v.temperature?.toString() || "",
      weight: v.weight?.toString() || "",
      oxygen: v.oxygenSaturation?.toString() || "",
      systolic: v.bloodPressure?.systolic?.toString() || "",
      diastolic: v.bloodPressure?.diastolic?.toString() || "",
    });
  };
  const cancelEditVital = () => {
    setEditingVitalId(null);
    setEditVitalDraft({});
  };
  const saveEditVital = async () => {
    if (!editingVitalId || !patientId) return;
    const payload: any = {
      vitalSignsId: editingVitalId,
      updatedVitalSigns: {},
    };
    if (editVitalDraft.heartRate)
      payload.updatedVitalSigns.heartRate = Number(editVitalDraft.heartRate);
    if (editVitalDraft.temperature)
      payload.updatedVitalSigns.temperature = Number(
        editVitalDraft.temperature
      );
    if (editVitalDraft.weight)
      payload.updatedVitalSigns.weight = Number(editVitalDraft.weight);
    if (editVitalDraft.oxygen)
      payload.updatedVitalSigns.oxygenSaturation = Number(
        editVitalDraft.oxygen
      );
    if (editVitalDraft.systolic && editVitalDraft.diastolic)
      payload.updatedVitalSigns.bloodPressure = {
        systolic: Number(editVitalDraft.systolic),
        diastolic: Number(editVitalDraft.diastolic),
      };
    try {
      setSavingVital(true);
      await api.put("/medical-records/vital-signs", payload, {
        headers: { "X-Patient-ID": patientId },
      });
      cancelEditVital();
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to update vitals");
    } finally {
      setSavingVital(false);
    }
  };
  const deleteVital = async (id?: string) => {
    if (!id || !patientId) return;
    if (!confirm("Delete this vital entry?")) return;
    try {
      await api.delete(`/medical-records/vital-signs/${id}`, {
        headers: { "X-Patient-ID": patientId },
      });
      if (editingVitalId === id) cancelEditVital();
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to delete vital");
    }
  };

  const renderFormattedSummary = (text: string) => {
    const boldItalic = (segment: string): React.ReactNode[] => {
      const nodes: React.ReactNode[] = [];
      const remaining = segment;
      const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
      let match: RegExpExecArray | null;
      let lastIndex = 0;
      while ((match = pattern.exec(segment)) !== null) {
        if (match.index > lastIndex) {
          nodes.push(segment.slice(lastIndex, match.index));
        }
        const token = match[0];
        if (token.startsWith("**")) {
          nodes.push(<strong key={nodes.length}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith("*")) {
          nodes.push(<em key={nodes.length}>{token.slice(1, -1)}</em>);
        } else if (token.startsWith("`")) {
          nodes.push(
            <code
              key={nodes.length}
              className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[11px]"
            >
              {token.slice(1, -1)}
            </code>
          );
        } else {
          nodes.push(token);
        }
        lastIndex = match.index + token.length;
      }
      if (lastIndex < segment.length) nodes.push(segment.slice(lastIndex));
      return nodes;
    };
    const blocks = text
      .trim()
      .split(/\n{2,}/)
      .filter((b) => b.trim().length);
    return blocks.map((block, i) => {
      const lines = block.split(/\n/).filter((l) => l.trim().length);
      const allBullets = lines.every((l) => l.trim().startsWith("- "));
      if (allBullets) {
        return (
          <ul key={i} className="list-disc pl-5 space-y-1 text-sm">
            {lines.map((l, j) => (
              <li key={j}>{boldItalic(l.trim().slice(2))}</li>
            ))}
          </ul>
        );
      }
      return (
        <div key={i} className="space-y-1">
          {lines.map((l, j) => {
            // Heading style if line ends with ':' and short
            const trimmed = l.trim();
            const isHeading = /[:：]$/.test(trimmed) && trimmed.length < 80;
            const content = boldItalic(trimmed.replace(/[:：]$/, ""));
            return isHeading ? (
              <h4
                key={j}
                className="font-semibold text-indigo-600 dark:text-indigo-300 text-sm mt-2 first:mt-0"
              >
                {content}
              </h4>
            ) : (
              <p key={j} className="text-sm leading-relaxed">
                {boldItalic(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  if (!patientId) return <div className="p-6">Invalid patient ID</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Patient Detail
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Clinical summary and history
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSummary}
            disabled={loadingSummary}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Brain className="w-4 h-4" />{" "}
            {loadingSummary ? "Generating..." : "AI Summary"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Back
          </button>
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
          Loading...
        </div>
      )}
      {!loading && patient && (
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 xl:col-span-1">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-4">
              <div>
                <h3 className="font-semibold tracking-tight mb-1">
                  Basic Info
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Patient identifiers
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Name:
                  </span>{" "}
                  {patient.firstName} {patient.lastName}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Email:
                  </span>{" "}
                  {patient.email || "-"}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Phone:
                  </span>{" "}
                  {patient.phone || "-"}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Gender:
                  </span>{" "}
                  {patient.gender || "-"}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Location:
                  </span>{" "}
                  {patient.location || "-"}
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold tracking-tight mb-1">
                    Vital Signs
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Latest measurements
                  </p>
                </div>
                <button
                  onClick={() => setAddingVital((a) => !a)}
                  className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition"
                >
                  {addingVital ? "Cancel" : "Add"}
                </button>
              </div>
              {addingVital && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="HR"
                      value={newVital.heartRate || ""}
                      onChange={(e) =>
                        setNewVital((v) => ({
                          ...v,
                          heartRate: e.target.value,
                        }))
                      }
                      className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                    />
                    <input
                      placeholder="Temp"
                      value={newVital.temperature || ""}
                      onChange={(e) =>
                        setNewVital((v) => ({
                          ...v,
                          temperature: e.target.value,
                        }))
                      }
                      className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                    />
                    <input
                      placeholder="Weight"
                      value={newVital.weight || ""}
                      onChange={(e) =>
                        setNewVital((v) => ({ ...v, weight: e.target.value }))
                      }
                      className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                    />
                    <input
                      placeholder="Oxygen %"
                      value={newVital.oxygen || ""}
                      onChange={(e) =>
                        setNewVital((v) => ({ ...v, oxygen: e.target.value }))
                      }
                      className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                    />
                    <input
                      placeholder="BP Sys"
                      value={newVital.systolic || ""}
                      onChange={(e) =>
                        setNewVital((v) => ({ ...v, systolic: e.target.value }))
                      }
                      className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                    />
                    <input
                      placeholder="BP Dia"
                      value={newVital.diastolic || ""}
                      onChange={(e) =>
                        setNewVital((v) => ({
                          ...v,
                          diastolic: e.target.value,
                        }))
                      }
                      className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60"
                    />
                  </div>
                  <button
                    disabled={savingVital}
                    onClick={addVitalSign}
                    className="w-full text-xs px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {savingVital ? "Saving..." : "Save Vitals"}
                  </button>
                </div>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {vitals.length === 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    No vitals recorded.
                  </div>
                )}
                {vitals
                  .slice()
                  .reverse()
                  .map((v) => (
                    <div
                      key={v._id || v.createdAt}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-xs flex flex-col gap-2 group relative"
                    >
                      {editingVitalId === v._id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              placeholder="HR"
                              value={editVitalDraft.heartRate || ""}
                              onChange={(e) =>
                                setEditVitalDraft((d) => ({
                                  ...d,
                                  heartRate: e.target.value,
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                            />
                            <input
                              placeholder="Temp"
                              value={editVitalDraft.temperature || ""}
                              onChange={(e) =>
                                setEditVitalDraft((d) => ({
                                  ...d,
                                  temperature: e.target.value,
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                            />
                            <input
                              placeholder="Wt"
                              value={editVitalDraft.weight || ""}
                              onChange={(e) =>
                                setEditVitalDraft((d) => ({
                                  ...d,
                                  weight: e.target.value,
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                            />
                            <input
                              placeholder="O₂ %"
                              value={editVitalDraft.oxygen || ""}
                              onChange={(e) =>
                                setEditVitalDraft((d) => ({
                                  ...d,
                                  oxygen: e.target.value,
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                            />
                            <input
                              placeholder="Sys"
                              value={editVitalDraft.systolic || ""}
                              onChange={(e) =>
                                setEditVitalDraft((d) => ({
                                  ...d,
                                  systolic: e.target.value,
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                            />
                            <input
                              placeholder="Dia"
                              value={editVitalDraft.diastolic || ""}
                              onChange={(e) =>
                                setEditVitalDraft((d) => ({
                                  ...d,
                                  diastolic: e.target.value,
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={savingVital}
                              onClick={saveEditVital}
                              className="flex-1 px-2 py-1 rounded bg-emerald-600 text-white text-[11px] disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              disabled={savingVital}
                              onClick={cancelEditVital}
                              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                          {v.heartRate && <span>HR: {v.heartRate}</span>}
                          {v.temperature && (
                            <span>Temp: {v.temperature}°C</span>
                          )}
                          {v.weight && <span>Wt: {v.weight}kg</span>}
                          {v.oxygenSaturation && (
                            <span>O₂: {v.oxygenSaturation}%</span>
                          )}
                          {v.bloodPressure && (
                            <span>
                              BP: {v.bloodPressure.systolic}/
                              {v.bloodPressure.diastolic}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {v.createdAt
                              ? new Date(v.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => startEditVital(v)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteVital(v._id)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* Right column */}
          <div className="space-y-6 xl:col-span-2">
            {aiSummary && (
              <div className="p-6 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-900/30 backdrop-blur-xl shadow-sm relative">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-300 mt-0.5" />
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold tracking-tight">
                        AI Clinical Summary
                      </h3>
                      <button
                        onClick={() => setAiSummary(null)}
                        className="text-xs text-indigo-600 dark:text-indigo-300 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                      {renderFormattedSummary(aiSummary)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Appointments */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold tracking-tight">Appointments</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {appointments.length === 0 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    No appointments.
                  </div>
                )}
                {appointments.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.reason}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                        {a.status.replace("_", " ")} •{" "}
                        {a.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">
                      <div>
                        {new Date(a.appointmentDate).toLocaleDateString()}
                      </div>
                      <div>
                        {new Date(a.appointmentDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Clinical Overview */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold tracking-tight mb-1">
                  Clinical Overview
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Conditions • Allergies • Medications
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Conditions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-tight">
                      Conditions
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {medicalConditions.length}
                      </span>
                      <button
                        onClick={() => setAddingCondition((a) => !a)}
                        className="text-[10px] px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
                      >
                        {addingCondition ? "Cancel" : "Add"}
                      </button>
                    </div>
                  </div>
                  {addingCondition && (
                    <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 space-y-2 text-[11px]">
                      <input
                        placeholder="Condition"
                        value={conditionDraft.condition}
                        onChange={(e) =>
                          setConditionDraft((c) => ({
                            ...c,
                            condition: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={conditionDraft.diagnosedDate}
                          onChange={(e) =>
                            setConditionDraft((c) => ({
                              ...c,
                              diagnosedDate: e.target.value,
                            }))
                          }
                          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                        />
                        <select
                          value={conditionDraft.status}
                          onChange={(e) =>
                            setConditionDraft((c) => ({
                              ...c,
                              status: e.target.value,
                            }))
                          }
                          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                        >
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                          <option value="chronic">Chronic</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Notes"
                        value={conditionDraft.notes}
                        onChange={(e) =>
                          setConditionDraft((c) => ({
                            ...c,
                            notes: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 resize-none"
                      />
                      <button
                        onClick={addConditionHandler}
                        className="w-full px-2 py-1 rounded bg-indigo-600 text-white"
                      >
                        Save
                      </button>
                    </div>
                  )}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {medicalConditions.length === 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        None recorded.
                      </div>
                    )}
                    {medicalConditions.map((c: any, i) => (
                      <div
                        key={c._id || i}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-xs flex flex-wrap gap-x-2 gap-y-1 relative group"
                      >
                        <span className="font-medium">{c.condition}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] uppercase tracking-wide">
                          {c.status}
                        </span>
                        {c.diagnosedDate && (
                          <span className="text-slate-400">
                            {new Date(c.diagnosedDate).toLocaleDateString()}
                          </span>
                        )}
                        {c.notes && (
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                            {c.notes}
                          </span>
                        )}
                        <button
                          onClick={() => removeConditionHandler(c._id)}
                          className="opacity-0 group-hover:opacity-100 transition absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Allergies */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-tight">
                      Allergies
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
                        {allergies.length}
                      </span>
                      <button
                        onClick={() => setAddingAllergy((a) => !a)}
                        className="text-[10px] px-2 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-500"
                      >
                        {addingAllergy ? "Cancel" : "Add"}
                      </button>
                    </div>
                  </div>
                  {addingAllergy && (
                    <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 space-y-2 text-[11px]">
                      <input
                        placeholder="Allergen"
                        value={allergyDraft.allergen}
                        onChange={(e) =>
                          setAllergyDraft((a) => ({
                            ...a,
                            allergen: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                      />
                      <input
                        placeholder="Reaction"
                        value={allergyDraft.reaction}
                        onChange={(e) =>
                          setAllergyDraft((a) => ({
                            ...a,
                            reaction: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                      />
                      <select
                        value={allergyDraft.severity}
                        onChange={(e) =>
                          setAllergyDraft((a) => ({
                            ...a,
                            severity: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                        <option value="critical">Critical</option>
                      </select>
                      <button
                        onClick={addAllergyHandler}
                        className="w-full px-2 py-1 rounded bg-rose-600 text-white"
                      >
                        Save
                      </button>
                    </div>
                  )}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {allergies.length === 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        None recorded.
                      </div>
                    )}
                    {allergies.map((a: any, i) => (
                      <div
                        key={a._id || i}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-xs flex flex-wrap gap-x-2 gap-y-1 relative group"
                      >
                        <span className="font-medium">{a.allergen}</span>
                        {a.severity && (
                          <span
                            className={
                              "px-2 py-0.5 rounded-full text-[10px] " +
                              (a.severity === "severe" ||
                              a.severity === "critical"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-300 dark:bg-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-300 dark:bg-amber-500/20")
                            }
                          >
                            {a.severity}
                          </span>
                        )}
                        {a.reaction && (
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                            {a.reaction}
                          </span>
                        )}
                        <button
                          onClick={() => removeAllergyHandler(a._id)}
                          className="opacity-0 group-hover:opacity-100 transition absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Medications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-tight">
                    Current Medications
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {medications.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        value={addingMedicationStr}
                        onChange={(e) => setAddingMedicationStr(e.target.value)}
                        placeholder="Add med"
                        className="text-[10px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 w-28"
                      />
                      <button
                        onClick={addMedicationHandler}
                        className="text-[10px] px-2 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                  {medications.length === 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      None listed.
                    </div>
                  )}
                  {medications.map((m, i) => (
                    <span
                      key={i}
                      className="group relative px-2 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      {m}
                      <button
                        onClick={() => removeMedicationHandler(m)}
                        className="opacity-0 group-hover:opacity-100 transition ml-2 text-[9px] text-rose-600 dark:text-rose-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {/* Surgeries & Immunizations */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-tight">
                      Past Surgeries
                    </h4>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                      {pastSurgeries.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                    {pastSurgeries.length === 0 && (
                      <div className="text-slate-500 dark:text-slate-400">
                        None recorded.
                      </div>
                    )}
                    {pastSurgeries.map((s, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60"
                      >
                        <div className="font-medium">{s.surgery}</div>
                        <div className="text-slate-500 dark:text-slate-400 flex gap-2 flex-wrap">
                          {s.date && (
                            <span>{new Date(s.date).toLocaleDateString()}</span>
                          )}
                          {s.hospital && (
                            <span className="truncate max-w-[140px]">
                              {s.hospital}
                            </span>
                          )}
                        </div>
                        {s.notes && (
                          <div className="text-slate-500 dark:text-slate-400 mt-1 text-[11px] line-clamp-2">
                            {s.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-tight">
                      Immunizations
                    </h4>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                      {immunizations.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                    {immunizations.length === 0 && (
                      <div className="text-slate-500 dark:text-slate-400">
                        None recorded.
                      </div>
                    )}
                    {immunizations.map((im, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 flex flex-wrap gap-x-3 gap-y-1"
                      >
                        <span className="font-medium">{im.vaccine}</span>
                        {im.date && (
                          <span>{new Date(im.date).toLocaleDateString()}</span>
                        )}
                        {im.nextDue && (
                          <span className="text-indigo-600 dark:text-indigo-300">
                            Next: {new Date(im.nextDue).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Family History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-tight">
                    Family History
                  </h4>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                    {familyHistory.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                  {familyHistory.length === 0 && (
                    <div className="text-slate-500 dark:text-slate-400">
                      None recorded.
                    </div>
                  )}
                  {familyHistory.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 flex flex-wrap gap-2"
                    >
                      <span className="font-medium">{f.relation}:</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                        {Array.isArray(f.conditions)
                          ? f.conditions.join(", ")
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Prescriptions */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold tracking-tight flex items-center gap-2">
            <Pill className="w-4 h-4" /> Prescriptions
          </h3>
          <button
            onClick={() => setShowNewRx(true)}
            className="text-xs px-2 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {loadingPrescriptions && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Loading...
            </div>
          )}
          {!loadingPrescriptions && prescriptions.length === 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              No prescriptions.
            </div>
          )}
          {prescriptions.map((p: any) => (
            <div
              key={p._id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
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
              <div className="flex flex-wrap gap-1">
                {p.medications?.slice(0, 4).map((m: any, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px]"
                    title={`${m.dosage} • ${m.frequency} • Qty ${m.quantity}`}
                  >
                    {m.name}
                  </span>
                ))}
                {p.medications?.length > 4 && (
                  <span className="text-[10px] text-slate-500">
                    +{p.medications.length - 4}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex gap-2 flex-wrap">
                {p.prescriptionDate && (
                  <span>
                    {new Date(p.prescriptionDate).toLocaleDateString()}
                  </span>
                )}
                {p.expiryDate && (
                  <span>
                    Exp: {new Date(p.expiryDate).toLocaleDateString()}
                  </span>
                )}
                {p.filled && (
                  <span className="text-emerald-600 dark:text-emerald-300">
                    Filled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showNewRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !savingRx && setShowNewRx(false)}
          />
          <div className="relative w-full max-w-lg p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight flex items-center gap-2">
                <Pill className="w-4 h-4" /> New Prescription
              </h3>
              <button
                onClick={() => !savingRx && setShowNewRx(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm">
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
                  placeholder="e.g. Acute Bacterial Tonsillitis"
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
                    onClick={addMedicationToDraft}
                    disabled={
                      !addingMedication.name ||
                      !addingMedication.dosage ||
                      !addingMedication.frequency ||
                      !addingMedication.duration ||
                      !addingMedication.quantity
                    }
                    className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Name"
                    value={addingMedication.name}
                    onChange={(e) =>
                      setAddingMedication((m) => ({
                        ...m,
                        name: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Dosage"
                    value={addingMedication.dosage}
                    onChange={(e) =>
                      setAddingMedication((m) => ({
                        ...m,
                        dosage: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Frequency"
                    value={addingMedication.frequency}
                    onChange={(e) =>
                      setAddingMedication((m) => ({
                        ...m,
                        frequency: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Duration"
                    value={addingMedication.duration}
                    onChange={(e) =>
                      setAddingMedication((m) => ({
                        ...m,
                        duration: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Qty"
                    value={addingMedication.quantity}
                    onChange={(e) =>
                      setAddingMedication((m) => ({
                        ...m,
                        quantity: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                  <input
                    placeholder="Instructions"
                    value={addingMedication.instructions}
                    onChange={(e) =>
                      setAddingMedication((m) => ({
                        ...m,
                        instructions: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-xs"
                  />
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
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
                          {m.frequency} • {m.duration} • Qty{" "}
                          {(m as any).quantity || 1}
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
                disabled={savingRx}
                onClick={savePrescription}
                className="w-full text-sm px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {savingRx ? "Saving..." : "Create Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
