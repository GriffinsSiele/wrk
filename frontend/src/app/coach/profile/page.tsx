"use client";

import { useEffect, useState } from "react";

type CoachProfileResponse = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  phone?: string | null;
  coach_attributes?: {
    specialty?: string | null;
    focus_area?: string | null;
    emirate?: string | null;
    languages?: string[];
    availability_status?: boolean | null;
    travel_willingness?: boolean | null;
    certification_level?: string | null;
    placement_eligible?: boolean | null;
    cec_credits?: number | null;
    cec_status?: string | null;
  };
};

export default function CoachProfilePage() {
  const [profile, setProfile] = useState<CoachProfileResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/proxy/coaches/me/profile", { cache: "no-store" });
        if (!resp.ok) {
          setStatus("error");
          return;
        }
        const data = (await resp.json()) as CoachProfileResponse;
        setProfile(data);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    };
    load();
  }, []);

  async function saveProfile() {
    if (!profile) return;
    setStatus("saving");
    setMessage("");
    try {
      const coachPatch = await fetch("/api/proxy/coaches/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          specialty: profile.coach_attributes?.specialty || null,
          focus_area: profile.coach_attributes?.focus_area || null,
          emirate: profile.coach_attributes?.emirate || null,
          languages: profile.coach_attributes?.languages || [],
          availability_status: profile.coach_attributes?.availability_status ?? true,
          travel_willingness: profile.coach_attributes?.travel_willingness ?? true,
          certification_level: profile.coach_attributes?.certification_level || null,
          cec_status: profile.coach_attributes?.cec_status || null,
        }),
      });

      const userPatch = await fetch("/api/proxy/users/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          bio: profile.bio || null,
          phone: profile.phone || null,
        }),
      });

      if (!coachPatch.ok || !userPatch.ok) {
        setStatus("error");
        setMessage("Failed to save profile");
        return;
      }
      setStatus("idle");
      setMessage("Profile saved");
    } catch {
      setStatus("error");
      setMessage("Failed to save profile");
    }
  }

  const attrs = profile?.coach_attributes || {};

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-outfit text-3xl font-bold mb-2">Coach Profile</h1>
        <p className="text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
          Update your specialties, emirate, languages, and availability. Placement eligibility is computed from active certification + signed agreements.
        </p>

        {profile && (
          <div
            className="mb-5 rounded-xl px-4 py-3 text-[14px]"
            style={{
              background: attrs.placement_eligible ? "rgba(37,192,210,0.1)" : "rgba(62,128,204,0.08)",
              border: "1px solid var(--ox-line)",
            }}
          >
            Placement status: <strong>{attrs.placement_eligible ? "Eligible" : "Not eligible"}</strong>
            {!attrs.placement_eligible && (
              <span style={{ color: "var(--ox-muted)" }}> — sign agreements under Agreements to unlock dispatch.</span>
            )}
          </div>
        )}

        {status === "loading" && <p>Loading profile...</p>}
        {status === "error" && !profile && <p>Unable to load profile.</p>}

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["First name", profile.first_name || "", (v: string) => setProfile({ ...profile, first_name: v })],
              ["Last name", profile.last_name || "", (v: string) => setProfile({ ...profile, last_name: v })],
              ["Specialty", attrs.specialty || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, specialty: v } })],
              ["Focus area", attrs.focus_area || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, focus_area: v } })],
              ["Emirate", attrs.emirate || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, emirate: v } })],
              ["Languages (comma separated)", (attrs.languages || []).join(", "), (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, languages: v.split(",").map((x) => x.trim()).filter(Boolean) } })],
              ["CEC status", attrs.cec_status || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, cec_status: v } })],
              ["Certification level", attrs.certification_level || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, certification_level: v } })],
            ].map(([label, value, onChange]) => (
              <div key={label as string} className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
                <label className="block text-xs mb-2" style={{ color: "var(--ox-muted)" }}>{label as string}</label>
                <input
                  value={value as string}
                  onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 text-sm outline-none"
                  style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
                />
              </div>
            ))}
            <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
              <label className="block text-xs mb-2" style={{ color: "var(--ox-muted)" }}>Availability</label>
              <select
                value={String(attrs.availability_status ?? true)}
                onChange={(e) => setProfile({ ...profile, coach_attributes: { ...attrs, availability_status: e.target.value === "true" } })}
                className="w-full h-10 rounded-lg px-3 text-sm outline-none"
                style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
              >
                <option value="true">Open to assignments</option>
                <option value="false">Not open</option>
              </select>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
              <label className="block text-xs mb-2" style={{ color: "var(--ox-muted)" }}>Travel willingness</label>
              <select
                value={String(attrs.travel_willingness ?? true)}
                onChange={(e) => setProfile({ ...profile, coach_attributes: { ...attrs, travel_willingness: e.target.value === "true" } })}
                className="w-full h-10 rounded-lg px-3 text-sm outline-none"
                style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
              >
                <option value="true">Willing to travel</option>
                <option value="false">No travel</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button onClick={saveProfile} disabled={status === "saving"} className="ox-cta h-10 rounded-full px-6 text-[14px] font-semibold">
            {status === "saving" ? "Saving..." : "Save profile"}
          </button>
          {message && <span style={{ color: "var(--ox-muted)" }}>{message}</span>}
        </div>
    </main>
  );
}
