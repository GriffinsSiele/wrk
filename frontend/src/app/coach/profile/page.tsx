"use client";

import { useEffect, useState } from "react";
import { SPECIALTY_OPTIONS } from "@/lib/brand-copy";

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

const FOCUS_AREAS = [
  "Executive Recovery",
  "Sport Performance",
  "Community Readiness",
  "Corporate Wellness",
  "Workplace Wellbeing",
  "Human Performance",
  "Recovery Protocols",
  "Leadership Resilience",
] as const;

const LANGUAGES = [
  "English",
  "Arabic",
  "French",
  "Urdu",
  "Hindi",
  "Tagalog",
  "Mandarin",
  "Spanish",
] as const;

const fieldStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
} as const;

function withCurrentOption(options: readonly string[], current?: string | null) {
  if (current && !options.includes(current)) {
    return [current, ...options];
  }
  return [...options];
}

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
      // Split writes: coach attrs vs user profile (placement_eligible is server-only).
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
  const selectedLanguages = attrs.languages || [];
  const languageOptions = [
    ...LANGUAGES,
    ...selectedLanguages.filter((lang) => !(LANGUAGES as readonly string[]).includes(lang)),
  ];

  function toggleLanguage(lang: string) {
    if (!profile) return;
    const current = attrs.languages || [];
    const next = current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang];
    setProfile({ ...profile, coach_attributes: { ...attrs, languages: next } });
  }

  return (<main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <h1 className="font-display text-3xl mb-2" style={{ fontWeight: 500 }}>
        Coach Profile
      </h1>
      <p className="font-body text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
        Update your specialties, emirate, languages, and availability. Placement eligibility is computed from active
        certification + signed agreements.
      </p>

      {profile && (<div
          className="mb-5 rounded-sm px-4 py-3 font-body text-[14px]"
          style={{
            background: "rgba(12,15,18,0.28)",
            border: "1px solid rgba(150,118,43,0.45)",
          }}
        >
          Placement status:{" "}
          <strong style={{ color: attrs.placement_eligible ? "var(--mint)" : "var(--ochre)" }}>
            {attrs.placement_eligible ? "Eligible" : "Not eligible"}
          </strong>
          {!attrs.placement_eligible && (<span style={{ color: "var(--ox-muted)" }}>, sign agreements under Agreements to unlock dispatch.</span>)}
        </div>)}

      {status === "loading" && <p>Loading profile...</p>}
      {status === "error" && !profile && <p>Unable to load profile.</p>}

      {profile && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["First name", profile.first_name || "", (v: string) => setProfile({ ...profile, first_name: v })],
            ["Last name", profile.last_name || "", (v: string) => setProfile({ ...profile, last_name: v })],
          ].map(([label, value, onChange]) => (<div key={label as string} className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
              <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
                {label as string}
              </label>
              <input
                value={value as string}
                onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
                className="w-full h-10 rounded-sm px-3 text-sm outline-none"
                style={fieldStyle}
              />
            </div>))}

          <div className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
              Specialty
            </label>
            <select
              value={attrs.specialty || ""}
              onChange={(e) => setProfile({ ...profile, coach_attributes: { ...attrs, specialty: e.target.value || null } })}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={fieldStyle}
            >
              <option value="">Select specialty</option>
              {withCurrentOption(SPECIALTIES, attrs.specialty).map((item) => (<option key={item} value={item}>
                  {item}
                </option>))}
            </select>
          </div>

          <div className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
              Focus area
            </label>
            <select
              value={attrs.focus_area || ""}
              onChange={(e) => setProfile({ ...profile, coach_attributes: { ...attrs, focus_area: e.target.value || null } })}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={fieldStyle}
            >
              <option value="">Select focus area</option>
              {withCurrentOption(FOCUS_AREAS, attrs.focus_area).map((item) => (<option key={item} value={item}>
                  {item}
                </option>))}
            </select>
          </div>

          <div className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
              Emirate
            </label>
            <select
              value={attrs.emirate || ""}
              onChange={(e) => setProfile({ ...profile, coach_attributes: { ...attrs, emirate: e.target.value || null } })}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={fieldStyle}
            >
              <option value="">Select emirate</option>
              {withCurrentOption(EMIRATES, attrs.emirate).map((item) => (<option key={item} value={item}>
                  {item}
                </option>))}
            </select>
          </div>

          <div className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
              Languages
            </label>
            <select
              value=""
              onChange={(e) => {
                const lang = e.target.value;
                if (!lang || selectedLanguages.includes(lang)) return;
                setProfile({
                  ...profile,
                  coach_attributes: { ...attrs, languages: [...selectedLanguages, lang] },
                });
              }}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={fieldStyle}
              aria-label="Add language"
            >
              <option value="">Add a language</option>
              {languageOptions
                .filter((lang) => !selectedLanguages.includes(lang))
                .map((lang) => (<option key={lang} value={lang}>
                    {lang}
                  </option>))}
            </select>
            {selectedLanguages.length > 0 ? (<div className="mt-2 flex flex-wrap gap-1.5">
                {selectedLanguages.map((lang) => (<button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className="text-[11px] px-2 py-0.5"
                    style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
                  >
                    {lang} ×
                  </button>))}
              </div>) : (<p className="mt-2 font-body text-[11px]" style={{ color: "var(--ox-muted)" }}>
                No languages selected yet.
              </p>)}
          </div>

          {[
            ["CEC status", attrs.cec_status || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, cec_status: v } })],
            ["Certification level", attrs.certification_level || "", (v: string) => setProfile({ ...profile, coach_attributes: { ...attrs, certification_level: v } })],
          ].map(([label, value, onChange]) => (<div key={label as string} className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
              <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
                {label as string}
              </label>
              <input
                value={value as string}
                onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
                className="w-full h-10 rounded-sm px-3 text-sm outline-none"
                style={fieldStyle}
              />
            </div>))}

          <div className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
              Availability
            </label>
            <select
              value={String(attrs.availability_status ?? true)}
              onChange={(e) =>
                setProfile({ ...profile, coach_attributes: { ...attrs, availability_status: e.target.value === "true" } })
              }
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={fieldStyle}
            >
              <option value="true">Open to assignments</option>
              <option value="false">Not open</option>
            </select>
          </div>

          <div className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
              Travel willingness
            </label>
            <select
              value={String(attrs.travel_willingness ?? true)}
              onChange={(e) =>
                setProfile({ ...profile, coach_attributes: { ...attrs, travel_willingness: e.target.value === "true" } })
              }
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={fieldStyle}
            >
              <option value="true">Willing to travel</option>
              <option value="false">No travel</option>
            </select>
          </div>
        </div>)}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={saveProfile} disabled={status === "saving"} className="ox-cta h-10 px-6 text-[14px] font-semibold">
          {status === "saving" ? "Saving..." : "Save profile"}
        </button>
        {message && <span className="font-body" style={{ color: message.toLowerCase().includes("fail") || message.toLowerCase().includes("unable") ? "var(--gold-bright)" : "var(--mint)" }}>{message}</span>}
      </div>
    </main>);
}
