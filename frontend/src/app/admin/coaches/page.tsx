"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SPECIALTY_OPTIONS } from "@/lib/brand-copy";
import { Field } from "@/components/ui/Field";

type Coach = {
  id: number;
  email: string;
  profile?: { first_name?: string; last_name?: string };
  coach_attributes?: {
    id?: number;
    specialty?: string;
    focus_area?: string;
    emirate?: string;
    languages?: string[];
    availability_status?: boolean;
    certification_level?: string;
    placement_eligible?: boolean;
    cec_status?: string;
  };
};

type Project = { id: number; title: string; status?: string };

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

const CERT_LEVELS = ["Level 1", "Level 2", "Level 3"] as const;
const CEC_STATUSES = ["Current", "Due"] as const;
const SPECIALTIES = SPECIALTY_OPTIONS;

const selectStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
  borderRadius: 2,
} as const;

function coachName(coach: Coach) {
  return [coach.profile?.first_name, coach.profile?.last_name].filter(Boolean).join(" ") || coach.email;
}

export default function AdminTalentPoolPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    emirate: "",
    specialty: "",
    availability: "",
    placement: "",
    certification_level: "",
    focus_area: "",
    cec_status: "",
  });
  const [assignForm, setAssignForm] = useState({
    project_id: "",
    coach_attribute_id: "",
    notes: "",
  });

  const focusAreas = useMemo(() => {
    const values = new Set<string>();
    for (const coach of coaches) {
      const focus = coach.coach_attributes?.focus_area?.trim();
      if (focus) values.add(focus);
    }
    return Array.from(values).sort();
  }, [coaches]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.emirate) params.set("emirate", filters.emirate);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.availability) params.set("availability", filters.availability);
    if (filters.placement === "true") params.set("placement_eligible", "true");
    if (filters.placement === "false") params.set("placement_eligible", "false");
    if (filters.certification_level) params.set("certification_level", filters.certification_level);
    if (filters.focus_area) params.set("focus_area", filters.focus_area);
    if (filters.cec_status) params.set("cec_status", filters.cec_status);
    const query = params.toString() ? `?${params.toString()}` : "";
    const [coachesResp, projectsResp] = await Promise.all([
      fetch(`/api/proxy/coaches${query}`, { cache: "no-store" }),
      fetch("/api/proxy/projects", { cache: "no-store" }),
    ]);
    if (coachesResp.ok) setCoaches(await coachesResp.json());
    if (projectsResp.ok) setProjects(await projectsResp.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function assignToProject() {
    setMessage("");
    if (!assignForm.project_id || !assignForm.coach_attribute_id) {
      setMessage("Choose a named project and a coach");
      return;
    }
    const resp = await fetch(`/api/proxy/projects/${assignForm.project_id}/assign`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        coach_id: Number(assignForm.coach_attribute_id),
        notes: assignForm.notes,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setMessage(typeof data.detail === "string" ? data.detail : "Assignment failed");
      return;
    }
    const project = projects.find((p) => String(p.id) === assignForm.project_id);
    setMessage(`Assigned to ${project?.title || "project"} (pending coach acceptance)`);
    setAssignForm({ project_id: "", coach_attribute_id: "", notes: "" });
  }

  const eligibleCount = coaches.filter((c) => c.coach_attributes?.placement_eligible).length;
  const assignableCoaches = coaches.filter((c) => c.coach_attributes?.id);
  const namedProjects = projects.filter((p) => p.title);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
            Talent pool
          </h1>
          <p className="font-body text-[14px] mt-2" style={{ color: "var(--ox-muted)" }}>
            Coach records with filters for certification status and competency. Assign a filtered coach to a named project here, or continue in{" "}
            <Link href="/admin/projects" style={{ color: "var(--gold)" }}>
              Project Dispatch
            </Link>
            .
          </p>
        </div>
        <div
          className="px-4 py-2 font-display text-[12px] tracking-[0.14em] uppercase"
          style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--ochre)" }}
        >
          {eligibleCount} placement-eligible in view
        </div>
      </div>

      {message && (
        <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select value={filters.certification_level} onChange={(e) => setFilters((p) => ({ ...p, certification_level: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle} aria-label="Certification level">
          <option value="">All certification levels</option>
          {CERT_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <select value={filters.specialty} onChange={(e) => setFilters((p) => ({ ...p, specialty: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle} aria-label="Specialty">
          <option value="">All specialties</option>
          {SPECIALTIES.map((specialty) => (
            <option key={specialty} value={specialty}>{specialty}</option>
          ))}
        </select>
        <select value={filters.focus_area} onChange={(e) => setFilters((p) => ({ ...p, focus_area: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle} aria-label="Competency / focus">
          <option value="">All competencies</option>
          {focusAreas.map((focus) => (
            <option key={focus} value={focus}>{focus}</option>
          ))}
        </select>
        <select value={filters.cec_status} onChange={(e) => setFilters((p) => ({ ...p, cec_status: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle} aria-label="CEC status">
          <option value="">All CEC statuses</option>
          {CEC_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select value={filters.emirate} onChange={(e) => setFilters((p) => ({ ...p, emirate: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle} aria-label="Emirate">
          <option value="">All emirates</option>
          {EMIRATES.map((emirate) => (
            <option key={emirate} value={emirate}>{emirate}</option>
          ))}
        </select>
        <select value={filters.availability} onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle}>
          <option value="">Availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <select value={filters.placement} onChange={(e) => setFilters((p) => ({ ...p, placement: e.target.value }))} className="h-10 px-3 text-sm font-body" style={selectStyle}>
          <option value="">Placement</option>
          <option value="true">Eligible only</option>
          <option value="false">Blocked only</option>
        </select>
        <button onClick={load} className="ox-cta h-10 px-5 text-[12px] tracking-[0.1em] uppercase">
          Apply filters
        </button>
      </div>

      <section className="p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-display text-[15px]" style={{ color: "var(--cream)", fontWeight: 500 }}>
          Assign to named project
        </h2>
        <p className="font-body text-[12px]" style={{ color: "var(--ox-muted)" }}>
          Placement-eligible coaches only complete assignment. The API rejects coaches who lack an active certificate or signed agreements.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Field label="Named project">
            <select value={assignForm.project_id} onChange={(e) => setAssignForm((p) => ({ ...p, project_id: e.target.value }))} className="w-full h-9 px-2 text-sm" style={selectStyle}>
              <option value="">Named project</option>
              {namedProjects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Coach in current filter">
            <select value={assignForm.coach_attribute_id} onChange={(e) => setAssignForm((p) => ({ ...p, coach_attribute_id: e.target.value }))} className="w-full h-9 px-2 text-sm" style={selectStyle}>
              <option value="">Coach in current filter</option>
              {assignableCoaches.map((coach) => (
                <option key={coach.id} value={String(coach.coach_attributes?.id)}>
                  {coachName(coach)}
                  {coach.coach_attributes?.certification_level ? ` · ${coach.coach_attributes.certification_level}` : ""}
                  {coach.coach_attributes?.focus_area ? ` · ${coach.coach_attributes.focus_area}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignment notes">
            <input
              placeholder="Context for the assignment"
              value={assignForm.notes}
              onChange={(e) => setAssignForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full h-9 px-3 text-sm"
              style={selectStyle}
            />
          </Field>
        </div>
        <button onClick={assignToProject} className="ox-cta h-9 px-5 text-[13px] font-semibold">
          Assign coach
        </button>
      </section>

      {loading ? (
        <p className="font-body" style={{ color: "var(--ox-muted)" }}>Loading coaches…</p>
      ) : (
        <div className="overflow-x-auto" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-surface)" }}>
          <table className="w-full text-sm font-body">
            <thead style={{ background: "rgba(217,172,74,0.1)" }}>
              <tr>
                {["Coach", "Level", "Specialty", "Competency", "CEC", "Emirate", "Availability", "Placement"].map((h) => (
                  <th key={h} className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} style={{ borderTop: "1px solid rgba(150,118,43,0.25)" }}>
                  <td className="p-3" style={{ color: "var(--cream)" }}>{coachName(coach)}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.certification_level || "—"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.specialty || "—"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.focus_area || "—"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.cec_status || "—"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.emirate || "—"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>
                    {coach.coach_attributes?.availability_status ? "Available" : "Unavailable"}
                  </td>
                  <td className="p-3" style={{ color: coach.coach_attributes?.placement_eligible ? "var(--gold)" : "var(--ox-muted)" }}>
                    {coach.coach_attributes?.placement_eligible ? "Eligible" : "Blocked"}
                  </td>
                </tr>
              ))}
              {coaches.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center" style={{ color: "var(--ox-muted)" }}>
                    No coaches match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
