"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/ui/Field";

type ExamSession = { id: number; title: string; date: string; location?: string | null; capacity: number; exam_config_id?: number | null };
type ExamQuestion = { id: number; text: string; pillar_tag?: string | null; difficulty?: string | null };
type ExamAttempt = {
  id: number;
  user_id: number;
  score?: number | null;
  passed?: boolean | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  needs_admin_review?: boolean;
  anomaly_flags?: Array<{ code?: string; detail?: string; at?: string }>;
  name?: string;
};
type ExamConfig = {
  id: number;
  name: string;
  certification_level?: string | null;
  pass_mark: number;
  time_limit_minutes: number;
  max_attempts: number;
  randomise_questions: boolean;
  question_count: number;
  seconds_per_question: number;
  one_way: boolean;
  shuffle_options: boolean;
  max_disconnect_pause_seconds: number;
  submit_grace_minutes: number;
  anomaly_review_threshold: number;
  proctoring_level?: string;
};

const emptyConfig = {
  name: "Level 1 Written",
  certification_level: "Level 1",
  pass_mark: 78,
  time_limit_minutes: 60,
  max_attempts: 3,
  randomise_questions: true,
  question_count: 40,
  proctoring_level: "basic",
  seconds_per_question: 90,
  one_way: true,
  shuffle_options: true,
  max_disconnect_pause_seconds: 300,
  submit_grace_minutes: 2,
  anomaly_review_threshold: 5,
};

export default function AdminExamsPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [configs, setConfigs] = useState<ExamConfig[]>([]);
  const [message, setMessage] = useState("");
  const [configForm, setConfigForm] = useState(emptyConfig);
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);

  const [sessionForm, setSessionForm] = useState({
    title: "Certification Exam Session",
    date: "",
    location: "Online",
    capacity: 30,
    exam_config_id: "",
  });

  const [questionForm, setQuestionForm] = useState({
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "a",
    pillar_tag: "execution",
    difficulty: "medium",
  });

  async function loadAll() {
    const [sessionsResp, questionsResp, attemptsResp, configsResp] = await Promise.all([
      fetch("/api/proxy/exams/sessions", { cache: "no-store" }),
      fetch("/api/proxy/exams/questions", { cache: "no-store" }),
      fetch("/api/proxy/exams/attempts", { cache: "no-store" }),
      fetch("/api/proxy/exams/configs", { cache: "no-store" }),
    ]);
    if (sessionsResp.ok) setSessions(await sessionsResp.json());
    if (questionsResp.ok) setQuestions(await questionsResp.json());
    if (attemptsResp.ok) setAttempts(await attemptsResp.json());
    if (configsResp.ok) setConfigs(await configsResp.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

  async function saveConfig() {
    setMessage("");
    const url = editingConfigId ? `/api/proxy/exams/configs/${editingConfigId}` : "/api/proxy/exams/configs";
    const resp = await fetch(url, {
      method: editingConfigId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(configForm),
    });
    if (!resp.ok) {
      setMessage("Failed to save exam config");
      return;
    }
    setMessage(editingConfigId ? "Exam config updated" : "Exam config created");
    setEditingConfigId(null);
    setConfigForm(emptyConfig);
    loadAll();
  }

  function editConfig(c: ExamConfig) {
    setEditingConfigId(c.id);
    setConfigForm({
      name: c.name,
      certification_level: c.certification_level || "Level 1",
      pass_mark: c.pass_mark,
      time_limit_minutes: c.time_limit_minutes,
      max_attempts: c.max_attempts,
      randomise_questions: c.randomise_questions,
      question_count: c.question_count,
      seconds_per_question: c.seconds_per_question,
      one_way: c.one_way,
      shuffle_options: c.shuffle_options,
      max_disconnect_pause_seconds: c.max_disconnect_pause_seconds,
      submit_grace_minutes: c.submit_grace_minutes,
      anomaly_review_threshold: c.anomaly_review_threshold,
      proctoring_level: c.proctoring_level || "basic",
    });
  }

  async function createSession() {
    setMessage("");
    if (!sessionForm.date) {
      setMessage("Please choose a session date/time");
      return;
    }
    const resp = await fetch("/api/proxy/exams/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: sessionForm.title,
        date: new Date(sessionForm.date).toISOString(),
        is_online: true,
        location: sessionForm.location,
        capacity: Number(sessionForm.capacity),
        exam_config_id: sessionForm.exam_config_id ? Number(sessionForm.exam_config_id) : null,
      }),
    });
    if (!resp.ok) {
      setMessage("Failed to create exam session");
      return;
    }
    setMessage("Exam session created");
    setSessionForm({ title: "Certification Exam Session", date: "", location: "Online", capacity: 30, exam_config_id: "" });
    loadAll();
  }

  async function createQuestion() {
    setMessage("");
    const resp = await fetch("/api/proxy/exams/questions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(questionForm),
    });
    if (!resp.ok) {
      setMessage("Failed to add exam question");
      return;
    }
    setMessage("Exam question added");
    setQuestionForm({
      text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "a",
      pillar_tag: "execution",
      difficulty: "medium",
    });
    loadAll();
  }

  async function approveAttempt(attemptId: number) {
    setMessage("");
    const resp = await fetch(`/api/proxy/exams/attempts/${attemptId}/approve`, { method: "POST" });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setMessage(data.detail || "Failed to approve attempt");
      return;
    }
    if (data.certificate_issued) {
      setMessage(`Certificate issued: ${data.verification_code}`);
    } else if (data.pending === "practical_assessment") {
      setMessage("Written exam approved. Certificate pending practical assessment PASS.");
    } else {
      setMessage(data.message || "Attempt reviewed");
    }
    loadAll();
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
        Exam engine
      </h1>
      <div
        className="p-4 font-body text-[13px] grid grid-cols-1 md:grid-cols-3 gap-3"
        style={{ border: "1px solid rgba(150,118,43,0.4)", background: "rgba(12,15,18,0.28)", color: "rgba(242,237,227,0.7)" }}
      >
        <div>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ochre)" }}>01 · Session</span>
          <p className="mt-1">Create an exam session and add questions.</p>
        </div>
        <div>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ochre)" }}>02 · Learner</span>
          <p className="mt-1">Learner Portal → Exam: start, one-at-a-time answers, resume on disconnect.</p>
        </div>
        <div>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ochre)" }}>03 · Review</span>
          <p className="mt-1">Attempts appear below; anomaly flags mark integrity review; approve written gate when ready.</p>
        </div>
      </div>
      <p className="text-[14px] font-body" style={{ color: "var(--ox-muted)" }}>
        Configure online sessions, maintain the question bank, and review written attempts. Certificates issue only after written + practical PASS.
      </p>
      {message && <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>{message}</p>}

      <section className="rounded-sm p-4 space-y-3" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-semibold">{editingConfigId ? `Edit config #${editingConfigId}` : "Exam configuration (admin-configurable)"}</h2>
        <p className="font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
          Working defaults are 40 questions at 78% pass mark. Every value here is editable. REPs UAE has not issued a proctoring specification; store additional requirements in proctoring level and integrity fields rather than hardcoding them.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Config name">
            <input placeholder="e.g. Level 1 Written" value={configForm.name} onChange={(e) => setConfigForm((p) => ({ ...p, name: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Certification level">
            <input placeholder="e.g. Level 1" value={configForm.certification_level} onChange={(e) => setConfigForm((p) => ({ ...p, certification_level: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Pass mark %">
            <input type="number" placeholder="78" value={configForm.pass_mark} onChange={(e) => setConfigForm((p) => ({ ...p, pass_mark: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Proctoring level">
            <input placeholder="e.g. basic" value={configForm.proctoring_level} onChange={(e) => setConfigForm((p) => ({ ...p, proctoring_level: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Overall time (minutes)">
            <input type="number" placeholder="60" value={configForm.time_limit_minutes} onChange={(e) => setConfigForm((p) => ({ ...p, time_limit_minutes: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Seconds per question">
            <input type="number" placeholder="90" value={configForm.seconds_per_question} onChange={(e) => setConfigForm((p) => ({ ...p, seconds_per_question: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Question count">
            <input type="number" placeholder="40" value={configForm.question_count} onChange={(e) => setConfigForm((p) => ({ ...p, question_count: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Max attempts">
            <input type="number" placeholder="3" value={configForm.max_attempts} onChange={(e) => setConfigForm((p) => ({ ...p, max_attempts: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Disconnect pause cap (seconds)">
            <input type="number" placeholder="300" value={configForm.max_disconnect_pause_seconds} onChange={(e) => setConfigForm((p) => ({ ...p, max_disconnect_pause_seconds: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Blur review threshold">
            <input type="number" placeholder="5" value={configForm.anomaly_review_threshold} onChange={(e) => setConfigForm((p) => ({ ...p, anomaly_review_threshold: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 font-body text-[13px]">
          <label className="flex items-center gap-2"><input type="checkbox" checked={configForm.randomise_questions} onChange={(e) => setConfigForm((p) => ({ ...p, randomise_questions: e.target.checked }))} /> Randomise questions</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={configForm.shuffle_options} onChange={(e) => setConfigForm((p) => ({ ...p, shuffle_options: e.target.checked }))} /> Shuffle options</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={configForm.one_way} onChange={(e) => setConfigForm((p) => ({ ...p, one_way: e.target.checked }))} /> One-way (no going back)</label>
        </div>
        <div className="flex gap-2">
          <button onClick={saveConfig} className="ox-cta h-9 px-5 text-[13px] font-semibold">{editingConfigId ? "Save config" : "Create config"}</button>
          {editingConfigId && (
            <button onClick={() => { setEditingConfigId(null); setConfigForm(emptyConfig); }} className="ox-ghost-light h-9 px-5 text-[13px]">Cancel</button>
          )}
        </div>
        {configs.length > 0 && (
          <ul className="space-y-2 mt-2">
            {configs.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 font-body text-[13px]" style={{ borderTop: "1px solid var(--ox-line)", paddingTop: 8 }}>
                <span>#{c.id} {c.name} · {c.pass_mark}% · {c.question_count}q · {c.seconds_per_question}s/q · {c.time_limit_minutes}m · {c.proctoring_level || "basic"}</span>
                <button onClick={() => editConfig(c)} className="h-8 px-3 text-[12px]" style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--gold)", borderRadius: 2 }}>Edit</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-sm p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold">Create Exam Session</h2>
          <Field label="Session title">
            <input placeholder="e.g. Certification Exam Session" value={sessionForm.title} onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Date and time">
            <input type="datetime-local" value={sessionForm.date} onChange={(e) => setSessionForm((p) => ({ ...p, date: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Location">
            <input placeholder="e.g. Online" value={sessionForm.location} onChange={(e) => setSessionForm((p) => ({ ...p, location: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Capacity">
            <input type="number" min={1} placeholder="30" value={sessionForm.capacity} onChange={(e) => setSessionForm((p) => ({ ...p, capacity: Number(e.target.value) }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          <Field label="Exam config">
            <select value={sessionForm.exam_config_id} onChange={(e) => setSessionForm((p) => ({ ...p, exam_config_id: e.target.value }))} className="w-full h-9 rounded-sm px-2 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
              <option value="">Default env settings</option>
              {configs.map((c) => (
                <option key={c.id} value={String(c.id)}>#{c.id} {c.name}</option>
              ))}
            </select>
          </Field>
          <button onClick={createSession} className="ox-cta h-9 px-5 text-[13px] font-semibold">Create Session</button>
        </section>

        <section className="rounded-sm p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold">Add Question</h2>
          <Field label="Question text">
            <textarea placeholder="Enter the question stem" value={questionForm.text} onChange={(e) => setQuestionForm((p) => ({ ...p, text: e.target.value }))} className="w-full rounded-sm px-3 py-2 text-sm" rows={3} style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </Field>
          {([
            ["option_a", "Option A"],
            ["option_b", "Option B"],
            ["option_c", "Option C"],
            ["option_d", "Option D"],
          ] as const).map(([opt, label]) => (
            <Field key={opt} label={label}>
              <input placeholder={`Answer ${label.slice(-1)}`} value={questionForm[opt]} onChange={(e) => setQuestionForm((p) => ({ ...p, [opt]: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
            </Field>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Field label="Correct option">
              <select value={questionForm.correct_option} onChange={(e) => setQuestionForm((p) => ({ ...p, correct_option: e.target.value }))} className="w-full h-9 rounded-sm px-2 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </Field>
            <Field label="Pillar tag">
              <input placeholder="e.g. execution" value={questionForm.pillar_tag} onChange={(e) => setQuestionForm((p) => ({ ...p, pillar_tag: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
            </Field>
          </div>
          <button
            onClick={createQuestion}
            className="ox-ghost-light h-9 px-5 text-[13px] font-medium"
          >
            Add Question
          </button>
        </section>
      </div>

      <section className="rounded-sm p-4 overflow-x-auto" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-semibold mb-3">Written Attempts (dual-gate review)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--ox-muted)" }}>
              <th className="text-left py-2">Learner</th>
              <th className="text-left py-2">Score</th>
              <th className="text-left py-2">Passed</th>
              <th className="text-left py-2">Flags</th>
              <th className="text-left py-2">Submitted</th>
              <th className="text-left py-2">Approved</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid var(--ox-line)" }}>
                <td className="py-2">{a.name || `User #${a.user_id}`}</td>
                <td className="py-2">{a.score ?? "-"}</td>
                <td className="py-2">{a.passed ? "Yes" : "No"}</td>
                <td className="py-2">
                  {a.needs_admin_review ? (
                    <span title={(a.anomaly_flags || []).map((f) => f.code).join(", ")} style={{ color: "var(--gold-bright)" }}>
                      Review ({(a.anomaly_flags || []).length})
                    </span>
                  ) : (
                    <span style={{ color: "var(--ox-muted)" }}>-</span>
                  )}
                </td>
                <td className="py-2">{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : "-"}</td>
                <td className="py-2">{a.approved_at ? new Date(a.approved_at).toLocaleString() : "Pending"}</td>
                <td className="py-2">
                  <button
                    disabled={!a.passed || Boolean(a.approved_at)}
                    onClick={() => approveAttempt(a.id)}
                    className="ox-ghost-light px-3 h-8 text-[12px] font-medium"
                    style={{
                      opacity: !a.passed || a.approved_at ? 0.45 : 1,
                    }}
                  >
                    Approve written
                  </button>
                </td>
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center" style={{ color: "var(--ox-muted)" }}>
                  No attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold mb-2">Scheduled Sessions</h2>
          <ul className="text-sm space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>{s.title} - {new Date(s.date).toLocaleString()} - {s.location || "Online"}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-sm p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold mb-2">Question Bank ({questions.length})</h2>
          <ul className="text-sm space-y-1 max-h-64 overflow-auto">
            {questions.map((q) => (
              <li key={q.id}>{q.text} ({q.pillar_tag || "general"})</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
