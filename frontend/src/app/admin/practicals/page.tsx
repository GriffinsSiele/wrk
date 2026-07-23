"use client";

import { useEffect, useState } from "react";

type Practical = {
  id: number;
  user_id?: number | null;
  certification_level?: string | null;
  result: string;
  notes?: string | null;
  assessed_at?: string | null;
};

type UserRow = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: string;
};

const DEFAULT_CHECKLIST = {
  intake_protocol: false,
  readiness_scoring: false,
  recovery_plan: false,
  load_management: false,
  client_communication: false,
  scope_boundaries: false,
  documentation: false,
  safety_escalation: false,
  session_structure: false,
  measurement_review: false,
  feedback_loop: false,
  ethics: false,
  professionalism: false,
  closing_protocol: false,
};

export default function AdminPracticalsPage() {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    certification_level: "Level 1",
    result: "PASS",
    notes: "",
  });
  const [checklist, setChecklist] = useState({ ...DEFAULT_CHECKLIST });

  async function loadAll() {
    const [pResp, uResp] = await Promise.all([
      fetch("/api/proxy/compliance/practical-assessments", { cache: "no-store" }),
      fetch("/api/proxy/admin/users", { cache: "no-store" }),
    ]);
    if (pResp.ok) setPracticals(await pResp.json());
    if (uResp.ok) setUsers(await uResp.json());
  }

  function userDisplayName(userId?: number | null) {
    if (!userId) return "—";
    const user = users.find((u) => u.id === userId);
    if (!user) return `User #${userId}`;
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    return name || user.email || `User #${userId}`;
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

  async function submitPractical() {
    setMessage("");
    if (!form.user_id) {
      setMessage("Select a learner/coach");
      return;
    }
    const resp = await fetch("/api/proxy/compliance/practical-assessments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user_id: Number(form.user_id),
        certification_level: form.certification_level,
        result: form.result,
        notes: form.notes,
        checklist_result: checklist,
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      setMessage(err.detail || "Failed to save practical assessment");
      return;
    }
    setMessage(
      form.result === "PASS"
        ? "Practical PASS recorded. Certificate issues automatically if written exam also passed."
        : "Practical FAIL recorded."
    );
    setForm({ user_id: "", certification_level: "Level 1", result: "PASS", notes: "" });
    setChecklist({ ...DEFAULT_CHECKLIST });
    loadAll();
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl" style={{ color: "var(--ox-fg)", fontWeight: 500 }}>
          Practical Assessments
        </h1>
        <p className="font-body text-[14px] mt-1" style={{ color: "var(--ox-muted)" }}>
          Dual-gate certification requires written exam pass + practical PASS before certificate issuance.
        </p>
      </div>

      <div className="rounded-sm p-5 space-y-4" style={{ background: "var(--ox-surface-strong)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Record assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            className="h-10 rounded-sm px-3 text-sm font-body"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} — {u.email} ({u.role})
              </option>
            ))}
          </select>
          <select
            value={form.certification_level}
            onChange={(e) => setForm({ ...form, certification_level: e.target.value })}
            className="h-10 rounded-sm px-3 text-sm font-body"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
          >
            <option>Level 1</option>
            <option>Level 2</option>
            <option>Level 3</option>
          </select>
          <select
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
            className="h-10 rounded-sm px-3 text-sm font-body"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
          >
            <option value="PASS">PASS</option>
            <option value="FAIL">FAIL</option>
          </select>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Assessor notes"
            className="h-10 rounded-sm px-3 text-sm font-body"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
          />
        </div>

        <div>
          <p className="font-display text-[12px] uppercase tracking-[0.16em] mb-3" style={{ color: "var(--ochre)" }}>
            14-point checklist
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.keys(checklist).map((key) => (
              <label key={key} className="flex items-center gap-2 font-body text-[13px]" style={{ color: "var(--ox-fg)" }}>
                <input
                  type="checkbox"
                  checked={(checklist as Record<string, boolean>)[key]}
                  onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                />
                {key.replaceAll("_", " ")}
              </label>
            ))}
          </div>
        </div>

        <button onClick={submitPractical} className="ox-cta h-10 px-6 text-[14px] font-semibold">
          Save practical result
        </button>
        {message && <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>{message}</p>}
      </div>

      <div className="rounded-sm overflow-hidden" style={{ background: "var(--ox-surface-strong)", border: "1px solid var(--ox-line)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Recent practicals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] font-body">
            <thead>
              <tr>
                {["ID", "Name", "Level", "Result", "Assessed"].map((h) => (
                  <th key={h} className="px-5 py-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {practicals.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--ox-line)" }}>
                  <td className="px-5 py-3">{p.id}</td>
                  <td className="px-5 py-3">{userDisplayName(p.user_id)}</td>
                  <td className="px-5 py-3">{p.certification_level}</td>
                  <td className="px-5 py-3">
                    <span
                      className="font-display text-[11px] tracking-[0.14em] uppercase"
                      style={{
                        color: p.result === "PASS" ? "var(--mint)" : "var(--bronze)",
                        borderBottom: "1px solid rgba(150,118,43,0.55)",
                      }}
                    >
                      {p.result}
                    </span>
                  </td>
                  <td className="px-5 py-3">{p.assessed_at ? new Date(p.assessed_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {practicals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center font-body" style={{ color: "var(--ox-muted)" }}>
                    No practical assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
