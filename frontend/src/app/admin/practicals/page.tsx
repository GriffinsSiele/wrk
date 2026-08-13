"use client";

import { useEffect, useMemo, useState } from "react";

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

type ChecklistItem = { key: string; label: string; required?: boolean };

type ChecklistTemplate = {
  id: number;
  name: string;
  certification_level: string;
  is_active: boolean;
  items: ChecklistItem[];
  min_required_pass?: number | null;
};

const fieldStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
  borderRadius: 2,
} as const;

export default function AdminPracticalsPage() {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    certification_level: "Level 1",
    result: "PASS",
    notes: "",
    template_id: "",
  });
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [tplForm, setTplForm] = useState({
    name: "Level 1 Practical",
    certification_level: "Level 1",
    min_required_pass: "",
    itemsText: "intake_protocol|Intake protocol|true\nethics|Ethics|true",
  });

  const activeTemplate = useMemo(() => {
    if (form.template_id) {
      return templates.find((t) => String(t.id) === form.template_id) || null;
    }
    return (
      templates.find((t) => t.is_active && t.certification_level === form.certification_level) ||
      templates.find((t) => t.is_active) ||
      null
    );
  }, [templates, form.template_id, form.certification_level]);

  async function load() {
    const [pResp, uResp, tResp] = await Promise.all([
      fetch("/api/proxy/compliance/practical-assessments", { cache: "no-store" }),
      fetch("/api/proxy/admin/users", { cache: "no-store" }),
      fetch("/api/proxy/compliance/checklist-templates", { cache: "no-store" }),
    ]);
    if (pResp.ok) setPracticals(await pResp.json());
    if (uResp.ok) setUsers(await uResp.json());
    if (tResp.ok) setTemplates(await tResp.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  useEffect(() => {
    if (!activeTemplate?.items) return;
    const next: Record<string, boolean> = {};
    for (const item of activeTemplate.items) {
      next[item.key] = false;
    }
    setChecklist(next);
  }, [activeTemplate?.id]);

  async function saveTemplate() {
    setMessage("");
    const items = tplForm.itemsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, label, required] = line.split("|").map((s) => s.trim());
        return { key, label: label || key, required: required !== "false" };
      })
      .filter((i) => i.key);
    if (!items.length) {
      setMessage("Add at least one checklist item (key|label|required)");
      return;
    }
    const resp = await fetch("/api/proxy/compliance/checklist-templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: tplForm.name,
        certification_level: tplForm.certification_level,
        is_active: true,
        items,
        min_required_pass: tplForm.min_required_pass ? Number(tplForm.min_required_pass) : null,
      }),
    });
    if (!resp.ok) {
      setMessage("Failed to save checklist template");
      return;
    }
    setMessage("Checklist template saved");
    load();
  }

  async function savePractical() {
    setMessage("");
    if (!form.user_id) {
      setMessage("Select a learner");
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
        template_id: form.template_id ? Number(form.template_id) : activeTemplate?.id || null,
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      setMessage(err.detail || "Failed to save practical assessment");
      return;
    }
    const saved = await resp.json();
    setMessage(`Practical saved as ${saved.result}`);
    load();
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
          Practical assessments
        </h1>
        <p className="font-body text-[14px] mt-2" style={{ color: "var(--ox-muted)" }}>
          Configurable checklist + pass criteria. Dual-gate still requires written approval + practical PASS.
        </p>
      </div>
      {message && (
        <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>
          {message}
        </p>
      )}

      <section className="p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-display text-[15px]" style={{ color: "var(--cream)", fontWeight: 500 }}>
          Checklist template (admin-defined)
        </h2>
        <p className="font-body text-[12px]" style={{ color: "var(--ox-muted)" }}>
          One item per line: <code>key|Label|true</code> (required flag). Leave min pass blank to require all required items.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={tplForm.name} onChange={(e) => setTplForm((p) => ({ ...p, name: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} placeholder="Template name" />
          <input value={tplForm.certification_level} onChange={(e) => setTplForm((p) => ({ ...p, certification_level: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} placeholder="Level" />
          <input type="number" value={tplForm.min_required_pass} onChange={(e) => setTplForm((p) => ({ ...p, min_required_pass: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} placeholder="Min required to PASS (optional)" />
        </div>
        <textarea
          rows={6}
          value={tplForm.itemsText}
          onChange={(e) => setTplForm((p) => ({ ...p, itemsText: e.target.value }))}
          className="w-full px-3 py-2 text-sm font-body"
          style={fieldStyle}
        />
        <button onClick={saveTemplate} className="ox-cta h-9 px-5 text-[13px] font-semibold">
          Save template
        </button>
        {templates.length > 0 && (
          <ul className="font-body text-[13px] space-y-1 mt-2" style={{ color: "var(--ox-muted)" }}>
            {templates.map((t) => (
              <li key={t.id}>
                #{t.id} {t.name} · {t.certification_level} · {t.items?.length || 0} items
                {t.is_active ? " · active" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-4 space-y-3" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-display text-[15px]" style={{ color: "var(--cream)", fontWeight: 500 }}>
          Record practical result
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))} className="h-9 px-2 text-sm" style={fieldStyle}>
            <option value="">Select learner</option>
            {users
              .filter((u) => u.role === "learner" || u.role === "coach")
              .map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email} (#{u.id})
                </option>
              ))}
          </select>
          <select value={form.template_id} onChange={(e) => setForm((p) => ({ ...p, template_id: e.target.value }))} className="h-9 px-2 text-sm" style={fieldStyle}>
            <option value="">Active template for level</option>
            {templates.map((t) => (
              <option key={t.id} value={String(t.id)}>
                #{t.id} {t.name}
              </option>
            ))}
          </select>
          <input value={form.certification_level} onChange={(e) => setForm((p) => ({ ...p, certification_level: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} />
          <select value={form.result} onChange={(e) => setForm((p) => ({ ...p, result: e.target.value }))} className="h-9 px-2 text-sm" style={fieldStyle}>
            <option value="PASS">Requested PASS (overridden by criteria if template set)</option>
            <option value="FAIL">Requested FAIL</option>
          </select>
        </div>
        <textarea
          placeholder="Assessor notes"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 text-sm"
          style={fieldStyle}
        />
        <div>
          <h3 className="font-display text-[12px] tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
            {activeTemplate ? activeTemplate.name : "No template — tick optional notes only"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(activeTemplate?.items || []).map((item) => (
              <label key={item.key} className="flex items-center gap-2 font-body text-[13px]" style={{ color: "var(--ox-fg)" }}>
                <input
                  type="checkbox"
                  checked={Boolean(checklist[item.key])}
                  onChange={(e) => setChecklist((p) => ({ ...p, [item.key]: e.target.checked }))}
                />
                {item.label}
                {item.required ? " *" : ""}
              </label>
            ))}
          </div>
        </div>
        <button onClick={savePractical} className="ox-cta h-9 px-5 text-[13px] font-semibold">
          Save practical result
        </button>
      </section>

      <section style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>
            Recent practicals
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr style={{ color: "var(--ox-muted)" }}>
                <th className="text-left px-5 py-2">ID</th>
                <th className="text-left px-5 py-2">User</th>
                <th className="text-left px-5 py-2">Level</th>
                <th className="text-left px-5 py-2">Result</th>
                <th className="text-left px-5 py-2">Assessed</th>
              </tr>
            </thead>
            <tbody>
              {practicals.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--ox-line)" }}>
                  <td className="px-5 py-2">{p.id}</td>
                  <td className="px-5 py-2">{p.user_id}</td>
                  <td className="px-5 py-2">{p.certification_level}</td>
                  <td className="px-5 py-2">{p.result}</td>
                  <td className="px-5 py-2">{p.assessed_at ? new Date(p.assessed_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {practicals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center" style={{ color: "var(--ox-muted)" }}>
                    No practical assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
