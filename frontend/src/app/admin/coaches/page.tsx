"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPECIALTY_OPTIONS } from "@/lib/brand-copy";

type Coach = {
  id: number;
  email: string;
  profile?: { first_name?: string; last_name?: string };
  coach_attributes?: {
    id?: number;
    specialty?: string;
    emirate?: string;
    languages?: string[];
    availability_status?: boolean;
    certification_level?: string;
    placement_eligible?: boolean;
  };
};

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

const SPECIALTIES = SPECIALTY_OPTIONS;

const selectStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
  borderRadius: 2,
} as const;

export default function AdminTalentPoolPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    emirate: "",
    specialty: "",
    availability: "",
    placement: "",
  });

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.emirate) params.set("emirate", filters.emirate);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.availability) params.set("availability", filters.availability);
    // Eligible=true is filtered server-side; ineligible is filtered client-side after fetch.
    if (filters.placement === "true") params.set("placement_eligible", "true");
    const resp = await fetch(`/api/proxy/coaches${params.toString() ? `?${params.toString()}` : ""}`, {
      cache: "no-store",
    });
    if (resp.ok) {
      let rows: Coach[] = await resp.json();
      if (filters.placement === "false") {
        rows = rows.filter((c) => !c.coach_attributes?.placement_eligible);
      }
      setCoaches(rows);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eligibleCount = coaches.filter((c) => c.coach_attributes?.placement_eligible).length;

  return (<div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
            Talent pool
          </h1>
          <p className="font-body text-[14px] mt-2" style={{ color: "var(--ox-muted)" }}>
            Filter certified coaches, then dispatch from{" "}
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <select
          value={filters.emirate}
          onChange={(e) => setFilters((p) => ({ ...p, emirate: e.target.value }))}
          className="h-10 px-3 text-sm font-body"
          style={selectStyle}
          aria-label="Emirate"
        >
          <option value="">All emirates</option>
          {EMIRATES.map((emirate) => (<option key={emirate} value={emirate}>
              {emirate}
            </option>))}
        </select>
        <select
          value={filters.specialty}
          onChange={(e) => setFilters((p) => ({ ...p, specialty: e.target.value }))}
          className="h-10 px-3 text-sm font-body"
          style={selectStyle}
          aria-label="Specialty"
        >
          <option value="">All specialties</option>
          {SPECIALTIES.map((specialty) => (<option key={specialty} value={specialty}>
              {specialty}
            </option>))}
        </select>
        <select
          value={filters.availability}
          onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))}
          className="h-10 px-3 text-sm font-body"
          style={selectStyle}
        >
          <option value="">Availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <select
          value={filters.placement}
          onChange={(e) => setFilters((p) => ({ ...p, placement: e.target.value }))}
          className="h-10 px-3 text-sm font-body"
          style={selectStyle}
        >
          <option value="">Placement</option>
          <option value="true">Eligible only</option>
          <option value="false">Blocked only</option>
        </select>
        <button onClick={load} className="ox-cta h-10 px-5 text-[12px] tracking-[0.1em] uppercase">
          Apply filters
        </button>
      </div>

      {loading ? (<p className="font-body" style={{ color: "var(--ox-muted)" }}>Loading coaches…</p>) : (<div className="overflow-x-auto" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-surface)" }}>
          <table className="w-full text-sm font-body">
            <thead style={{ background: "rgba(217,172,74,0.1)" }}>
              <tr>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Coach</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Specialty</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Emirate</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Languages</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Availability</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Placement</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (<tr key={coach.id} style={{ borderTop: "1px solid rgba(150,118,43,0.25)" }}>
                  <td className="p-3" style={{ color: "var(--cream)" }}>
                    {[coach.profile?.first_name, coach.profile?.last_name].filter(Boolean).join(" ") || coach.email}
                  </td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.specialty || "-"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>{coach.coach_attributes?.emirate || "-"}</td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>
                    {(coach.coach_attributes?.languages || []).join(", ") || "-"}
                  </td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>
                    {coach.coach_attributes?.availability_status ? "Available" : "Unavailable"}
                  </td>
                  <td className="p-3" style={{ color: coach.coach_attributes?.placement_eligible ? "var(--gold)" : "var(--ox-muted)" }}>
                    {coach.coach_attributes?.placement_eligible ? "Eligible" : "Blocked"}
                  </td>
                  <td className="p-3" style={{ color: "var(--ox-muted)" }}>
                    {coach.coach_attributes?.certification_level || "-"}
                  </td>
                </tr>))}
              {coaches.length === 0 && (<tr>
                  <td colSpan={7} className="p-6 text-center" style={{ color: "var(--ox-muted)" }}>
                    No coaches match these filters.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>)}
    </div>);
}
