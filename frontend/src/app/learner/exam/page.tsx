"use client";

import { useEffect, useState } from "react";

type ExamSession = {
  id: number;
  title: string;
  date: string;
  location?: string | null;
  capacity: number;
};

export default function LearnerExamPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error" | "booking">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/proxy/exams/sessions", { cache: "no-store" });
        if (!resp.ok) {
          setStatus("error");
          return;
        }
        const data = (await resp.json()) as ExamSession[];
        setSessions(data);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    };
    load();
  }, []);

  async function bookSession(sessionId: number) {
    setStatus("booking");
    setMessage("");
    try {
      const resp = await fetch(`/api/proxy/exams/sessions/${sessionId}/book`, { method: "POST" });
      const data = await resp.json();
      if (!resp.ok) {
        setMessage(data?.detail || "Booking failed");
        setStatus("idle");
        return;
      }
      setMessage("Registration complete. You can now start your online exam attempt when the session is open.");
      setStatus("idle");
    } catch {
      setMessage("Booking failed");
      setStatus("idle");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-outfit text-3xl font-bold mb-2">Online Written Exam</h1>
        <p className="text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
          Book and complete the supervised online written exam. A separate practical assessment PASS is also required before your certificate is issued.
        </p>

        {status === "loading" && <p>Loading exam sessions...</p>}
        {status === "error" && <p>Unable to load exam sessions.</p>}

        {message && (
          <div className="rounded-xl p-4 mb-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl p-5" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
              <h2 className="font-semibold text-lg">{session.title}</h2>
              <p className="text-[13px]" style={{ color: "var(--ox-muted)" }}>
                Date: {new Date(session.date).toLocaleString()}
              </p>
              <p className="text-[13px]" style={{ color: "var(--ox-muted)" }}>
                Mode: {session.location || "Online"}
              </p>
              <p className="text-[13px] mb-3" style={{ color: "var(--ox-muted)" }}>
                Capacity: {session.capacity}
              </p>
              <button
                onClick={() => bookSession(session.id)}
                disabled={status === "booking"}
                className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold"
              >
                Register for Session
              </button>
            </div>
          ))}
        </div>
    </main>
  );
}
