"use client";

import { useEffect, useState } from "react";

type ExamSession = { id: number; title: string; date: string; location?: string | null; capacity: number };
type ExamQuestion = { id: number; text: string; pillar_tag?: string | null; difficulty?: string | null };
type ExamAttempt = {
  id: number;
  user_id: number;
  score?: number | null;
  passed?: boolean | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  name?: string;
};

export default function AdminExamsPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [message, setMessage] = useState("");

  const [sessionForm, setSessionForm] = useState({
    title: "Certification Exam Session",
    date: "",
    location: "Online",
    capacity: 30,
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
    const [sessionsResp, questionsResp, attemptsResp] = await Promise.all([
      fetch("/api/proxy/exams/sessions", { cache: "no-store" }),
      fetch("/api/proxy/exams/questions", { cache: "no-store" }),
      fetch("/api/proxy/exams/attempts", { cache: "no-store" }),
    ]);
    if (sessionsResp.ok) setSessions(await sessionsResp.json());
    if (questionsResp.ok) setQuestions(await questionsResp.json());
    if (attemptsResp.ok) setAttempts(await attemptsResp.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

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
      }),
    });
    if (!resp.ok) {
      setMessage("Failed to create exam session");
      return;
    }
    setMessage("Exam session created");
    setSessionForm({ title: "Certification Exam Session", date: "", location: "Online", capacity: 30 });
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
      <h1 className="font-outfit text-3xl font-bold">Exam Management</h1>
      <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Configure online sessions, maintain the question bank, and review written attempts. Certificates issue only after written + practical PASS.
      </p>
      {message && <p className="text-sm" style={{ color: "var(--ox-muted)" }}>{message}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Create Exam Session</h2>
          <input value={sessionForm.title} onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input type="datetime-local" value={sessionForm.date} onChange={(e) => setSessionForm((p) => ({ ...p, date: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input value={sessionForm.location} onChange={(e) => setSessionForm((p) => ({ ...p, location: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input type="number" min={1} value={sessionForm.capacity} onChange={(e) => setSessionForm((p) => ({ ...p, capacity: Number(e.target.value) }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <button onClick={createSession} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Create Session</button>
        </section>

        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Add Question</h2>
          <textarea placeholder="Question text" value={questionForm.text} onChange={(e) => setQuestionForm((p) => ({ ...p, text: e.target.value }))} className="w-full rounded px-3 py-2 text-sm" rows={3} style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          {(["option_a", "option_b", "option_c", "option_d"] as const).map((opt) => (
            <input key={opt} placeholder={opt} value={questionForm[opt]} onChange={(e) => setQuestionForm((p) => ({ ...p, [opt]: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          ))}
          <div className="grid grid-cols-2 gap-2">
            <select value={questionForm.correct_option} onChange={(e) => setQuestionForm((p) => ({ ...p, correct_option: e.target.value }))} className="h-9 rounded px-2 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
              <option value="a">Correct: A</option>
              <option value="b">Correct: B</option>
              <option value="c">Correct: C</option>
              <option value="d">Correct: D</option>
            </select>
            <input value={questionForm.pillar_tag} onChange={(e) => setQuestionForm((p) => ({ ...p, pillar_tag: e.target.value }))} className="h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          </div>
          <button onClick={createQuestion} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Add Question</button>
        </section>
      </div>

      <section className="rounded-xl p-4 overflow-x-auto" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
        <h2 className="font-semibold mb-3">Written Attempts (dual-gate review)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--ox-muted)" }}>
              <th className="text-left py-2">Learner</th>
              <th className="text-left py-2">Score</th>
              <th className="text-left py-2">Passed</th>
              <th className="text-left py-2">Submitted</th>
              <th className="text-left py-2">Approved</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid var(--ox-line)" }}>
                <td className="py-2">{a.name || `User #${a.user_id}`}</td>
                <td className="py-2">{a.score ?? "—"}</td>
                <td className="py-2">{a.passed ? "Yes" : "No"}</td>
                <td className="py-2">{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : "—"}</td>
                <td className="py-2">{a.approved_at ? new Date(a.approved_at).toLocaleString() : "Pending"}</td>
                <td className="py-2">
                  <button
                    disabled={!a.passed || Boolean(a.approved_at)}
                    onClick={() => approveAttempt(a.id)}
                    className="px-3 h-8 rounded text-[12px]"
                    style={{
                      border: "1px solid rgba(62,128,204,0.35)",
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
                <td colSpan={6} className="py-6 text-center" style={{ color: "var(--ox-muted)" }}>
                  No attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold mb-2">Scheduled Sessions</h2>
          <ul className="text-sm space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>{s.title} - {new Date(s.date).toLocaleString()} - {s.location || "Online"}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
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
