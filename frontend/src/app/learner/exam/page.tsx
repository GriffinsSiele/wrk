"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ExamSession = {
  id: number;
  title: string;
  date: string;
  location?: string | null;
  capacity: number;
};

type StartResponse = {
  attempt_id: number;
  resumed?: boolean;
  detail?: string;
};

export default function LearnerExamPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error" | "busy">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/proxy/exams/sessions", { cache: "no-store" });
        if (!resp.ok) {
          setStatus("error");
          return;
        }
        setSessions((await resp.json()) as ExamSession[]);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    };
    load();
  }, []);

  async function bookSession(sessionId: number) {
    setStatus("busy");
    setMessage("");
    try {
      const resp = await fetch(`/api/proxy/exams/sessions/${sessionId}/book`, { method: "POST" });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setMessage(typeof data?.detail === "string" ? data.detail : "Booking failed");
        setStatus("idle");
        return;
      }
      setMessage("Registration complete. You can start the written exam when ready.");
      setStatus("idle");
    } catch {
      setMessage("Booking failed");
      setStatus("idle");
    }
  }

  async function startAttempt(sessionId: number) {
    // Separate from Register: start (or resume) an open progressive attempt.
    setStatus("busy");
    setMessage("");
    try {
      const resp = await fetch(`/api/proxy/exams/attempts/start?session_id=${sessionId}`, {
        method: "POST",
      });
      const data = (await resp.json().catch(() => ({}))) as StartResponse & { detail?: string };
      if (!resp.ok) {
        setMessage(typeof data?.detail === "string" ? data.detail : "Could not start attempt");
        setStatus("idle");
        return;
      }
      router.push(`/learner/exam/attempt/${data.attempt_id}`);
    } catch {
      setMessage("Could not start attempt");
      setStatus("idle");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <h1 className="font-display text-3xl mb-2" style={{ fontWeight: 500 }}>
        Online Written Exam
      </h1>
      <p className="font-body text-[14px] mb-4" style={{ color: "var(--ox-muted)" }}>
        Dual-gate pathway: book a session, then sit the Phase 1 integrity exam (one question at a time,
        90 seconds each, no going back, 60-minute overall ceiling). If you disconnect, you can resume
        at the same question.
      </p>
      <ul className="font-body text-[13px] mb-6 space-y-1" style={{ color: "var(--ox-muted)" }}>
        <li>· 90 seconds per question · one-way navigation · answer options shuffled</li>
        <li>· Overall limit 60 minutes · dropped connections pause the question clock (capped)</li>
      </ul>

      {status === "loading" && (
        <p className="font-body" style={{ color: "var(--ox-muted)" }}>
          Loading exam sessions...
        </p>
      )}
      {status === "error" && (
        <p className="font-body" style={{ color: "var(--gold-bright)" }}>
          Unable to load exam sessions.
        </p>
      )}

      {message && (
        <div
          className="rounded-sm p-4 mb-4 font-body text-[14px]"
          style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", color: "var(--mint)" }}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session, idx) => (
          <div
            key={session.id}
            className="rounded-sm p-5"
            style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
          >
            <h2 className="font-semibold text-lg">{session.title}</h2>
            <p className="font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
              Date: {new Date(session.date).toLocaleString()}
            </p>
            <p className="font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
              Mode: {session.location || "Online"}
            </p>
            <p className="font-body text-[13px] mb-4" style={{ color: "var(--ox-muted)" }}>
              Capacity: {session.capacity}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => bookSession(session.id)}
                disabled={status === "busy"}
                className={`${idx === 0 ? "ox-ghost-light" : "ox-ghost-light"} h-9 px-5 text-[13px] font-semibold`}
              >
                Register
              </button>
              <button
                onClick={() => startAttempt(session.id)}
                disabled={status === "busy"}
                className="ox-cta h-9 px-5 text-[13px] font-semibold"
              >
                Start / Resume exam
              </button>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && status === "idle" && (
        <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
          No upcoming sessions. Ask an admin to publish one, or{" "}
          <Link href="/learner" className="underline">
            return to dashboard
          </Link>
          .
        </p>
      )}
    </main>
  );
}
