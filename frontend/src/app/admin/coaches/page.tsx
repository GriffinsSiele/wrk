"use client";

import { useEffect, useState } from "react";

type Coach = {
  id: number;
  email: string;
  profile?: { first_name?: string; last_name?: string };
  coach_attributes?: {
    specialty?: string;
    emirate?: string;
    languages?: string[];
    availability_status?: boolean;
    certification_level?: string;
    placement_eligible?: boolean;
  };
};

export default function AdminTalentPoolPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ emirate: "", specialty: "", availability: "" });

  async function load() {
    const params = new URLSearchParams();
    if (filters.emirate) params.set("emirate", filters.emirate);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.availability) params.set("availability", filters.availability);
    const resp = await fetch(`/api/proxy/coaches${params.toString() ? `?${params.toString()}` : ""}`, { cache: "no-store" });
    if (resp.ok) setCoaches(await resp.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-outfit text-3xl font-bold">Talent Pool Directory</h1>
      <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Search and filter certified coaches by specialty, emirate, availability, and placement eligibility.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          placeholder="Emirate"
          value={filters.emirate}
          onChange={(e) => setFilters((p) => ({ ...p, emirate: e.target.value }))}
          className="h-10 rounded px-3 text-sm"
          style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
        />
        <input
          placeholder="Specialty"
          value={filters.specialty}
          onChange={(e) => setFilters((p) => ({ ...p, specialty: e.target.value }))}
          className="h-10 rounded px-3 text-sm"
          style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
        />
        <select
          value={filters.availability}
          onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))}
          className="h-10 rounded px-3 text-sm"
          style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
        >
          <option value="">Availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <button onClick={load} className="ox-cta h-10 rounded-full px-5 text-[13px] font-semibold">Apply Filters</button>
      </div>

      {loading ? (
        <p>Loading coaches...</p>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)", background: "var(--ox-surface)" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "rgba(62,128,204,0.12)" }}>
              <tr>
                <th className="text-left p-3">Coach</th>
                <th className="text-left p-3">Specialty</th>
                <th className="text-left p-3">Emirate</th>
                <th className="text-left p-3">Languages</th>
                <th className="text-left p-3">Availability</th>
                <th className="text-left p-3">Placement</th>
                <th className="text-left p-3">Level</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} style={{ borderTop: "1px solid rgba(62,128,204,0.25)" }}>
                  <td className="p-3">{[coach.profile?.first_name, coach.profile?.last_name].filter(Boolean).join(" ") || coach.email}</td>
                  <td className="p-3">{coach.coach_attributes?.specialty || "N/A"}</td>
                  <td className="p-3">{coach.coach_attributes?.emirate || "N/A"}</td>
                  <td className="p-3">{(coach.coach_attributes?.languages || []).join(", ") || "N/A"}</td>
                  <td className="p-3">{coach.coach_attributes?.availability_status ? "Available" : "Unavailable"}</td>
                  <td className="p-3">{coach.coach_attributes?.placement_eligible ? "Eligible" : "Blocked"}</td>
                  <td className="p-3">{coach.coach_attributes?.certification_level || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
