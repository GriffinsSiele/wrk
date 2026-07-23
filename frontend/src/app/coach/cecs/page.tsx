"use client";

import { useEffect, useState } from "react";

export default function CoachCecsPage() {
  const [cecStatus, setCecStatus] = useState("Current");
  const [certLevel, setCertLevel] = useState("Level 1");
  const [cecCredits, setCecCredits] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const resp = await fetch("/api/proxy/coaches/me/profile", { cache: "no-store" });
      if (!resp.ok) return;
      const data = await resp.json();
      setCecStatus(data?.coach_attributes?.cec_status || "Current");
      setCertLevel(data?.coach_attributes?.certification_level || "Level 1");
      setCecCredits(Number(data?.coach_attributes?.cec_credits || 0));
    };
    load();
  }, []);

  async function save() {
    setMessage("");
    const resp = await fetch("/api/proxy/coaches/me/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cec_status: cecStatus,
        certification_level: certLevel,
        cec_credits: Number(cecCredits),
      }),
    });
    setMessage(resp.ok ? "CEC status saved" : "Failed to save CEC status");
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-display text-3xl mb-2" style={{ fontWeight: 500 }}>Continuing Education (CECs)</h1>
        <p className="font-body text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
          Track annual renewal readiness and maintain active credential standing.
        </p>
        <div className="rounded-sm p-5 space-y-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <div>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>Certification level</label>
            <input
              value={certLevel}
              onChange={(e) => setCertLevel(e.target.value)}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
            />
          </div>
          <div>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>CEC credits</label>
            <input
              type="number"
              value={cecCredits}
              onChange={(e) => setCecCredits(Number(e.target.value))}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
            />
          </div>
          <div>
            <label className="block font-display text-xs tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>CEC status</label>
            <select
              value={cecStatus}
              onChange={(e) => setCecStatus(e.target.value)}
              className="w-full h-10 rounded-sm px-3 text-sm outline-none"
              style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
            >
              <option>Current</option>
              <option>Pending Renewal</option>
              <option>Expired</option>
            </select>
          </div>
          <button onClick={save} className="ox-cta h-10 px-6 text-[14px] font-semibold">Save CEC Record</button>
          {message && <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>{message}</p>}
        </div>
    </main>
  );
}
