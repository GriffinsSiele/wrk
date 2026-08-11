"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Question = {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  pillar_tag?: string | null;
};

type Progress = {
  attempt_id: number;
  current_index: number;
  total_questions: number;
  seconds_per_question: number;
  question: Question | null;
  question_remaining_seconds: number;
  overall_remaining_seconds: number;
  answered_count: number;
  paused: boolean;
  completed: boolean;
  needs_admin_review: boolean;
  one_way: boolean;
  score?: number;
  passed?: boolean;
};

const OPTIONS: Array<{ key: "a" | "b" | "c" | "d"; label: keyof Question }> = [
  { key: "a", label: "option_a" },
  { key: "b", label: "option_b" },
  { key: "c", label: "option_c" },
  { key: "d", label: "option_d" },
];

function formatMmSs(total: number) {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function LearnerExamAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = String(params?.id || "");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selected, setSelected] = useState<"a" | "b" | "c" | "d" | null>(null);
  const [qRemain, setQRemain] = useState(0);
  const [oRemain, setORemain] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error" | "done">("loading");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ score?: number | null; passed?: boolean | null } | null>(null);
  const ticking = useRef(true);
  const pausedRef = useRef(false);

  const applyProgress = useCallback((data: Progress) => {
    setProgress(data);
    setQRemain(data.question_remaining_seconds);
    setORemain(data.overall_remaining_seconds);
    pausedRef.current = data.paused;
    setSelected(null);
    if (data.completed) {
      setStatus("done");
    } else {
      setStatus("ready");
    }
  }, []);

  const fetchCurrent = useCallback(async () => {
    const resp = await fetch(`/api/proxy/exams/attempts/${attemptId}/current`, { cache: "no-store" });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setError(typeof data?.detail === "string" ? data.detail : "Unable to load attempt");
      setStatus("error");
      return null;
    }
    applyProgress(data as Progress);
    return data as Progress;
  }, [attemptId, applyProgress]);

  const fetchResult = useCallback(async () => {
    const resp = await fetch(`/api/proxy/exams/attempts/${attemptId}/result`, { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      setResult({ score: data.score, passed: data.passed });
    }
  }, [attemptId]);

  const reportAnomaly = useCallback(
    async (code: string, detail?: string) => {
      try {
        await fetch(`/api/proxy/exams/attempts/${attemptId}/anomaly`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, detail }),
        });
      } catch {
        /* best-effort */
      }
    },
    [attemptId],
  );

  const pauseRemote = useCallback(async () => {
    if (pausedRef.current || status === "done") return;
    try {
      const resp = await fetch(`/api/proxy/exams/attempts/${attemptId}/disconnect`, { method: "POST" });
      if (resp.ok) {
        const data = (await resp.json()) as Progress;
        applyProgress(data);
      }
    } catch {
      /* ignore */
    }
  }, [attemptId, applyProgress, status]);

  const resumeRemote = useCallback(async () => {
    try {
      const resp = await fetch(`/api/proxy/exams/attempts/${attemptId}/resume`, { method: "POST" });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        applyProgress(data as Progress);
        if ((data as Progress).completed) await fetchResult();
      }
    } catch {
      /* ignore */
    }
  }, [attemptId, applyProgress, fetchResult]);

  useEffect(() => {
    if (!attemptId) return;
    fetchCurrent().then((p) => {
      if (p?.completed) fetchResult();
    });
  }, [attemptId, fetchCurrent, fetchResult]);

  // Local countdown is UX-only; server remaining on each fetch is authoritative.
  useEffect(() => {
    ticking.current = true;
    const id = window.setInterval(() => {
      if (!ticking.current || pausedRef.current) return;
      setQRemain((v) => Math.max(0, v - 1));
      setORemain((v) => Math.max(0, v - 1));
    }, 1000);
    return () => {
      ticking.current = false;
      window.clearInterval(id);
    };
  }, [progress?.current_index, progress?.paused]);

  // When local 90s hits 0, brief delay then re-sync (server blank-locks + advances).
  useEffect(() => {
    if (status !== "ready" || pausedRef.current) return;
    if (qRemain > 0) return;
    const t = window.setTimeout(() => {
      fetchCurrent().then((p) => {
        if (p?.completed) fetchResult();
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [qRemain, status, fetchCurrent, fetchResult]);

  // Overall 60m ceiling — also re-sync when local overall hits 0.
  useEffect(() => {
    if (status !== "ready") return;
    if (oRemain > 0) return;
    fetchCurrent().then((p) => {
      if (p?.completed) fetchResult();
    });
  }, [oRemain, status, fetchCurrent, fetchResult]);

  // Hide/offline pause the question clock; blur only reports (no pause).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        reportAnomaly("visibility_hidden", "Tab hidden or app backgrounded");
        pauseRemote();
      } else {
        resumeRemote();
      }
    };
    const onBlur = () => reportAnomaly("tab_blur", "Window blur");
    const onOffline = () => {
      reportAnomaly("client_disconnect", "Browser offline");
      pauseRemote();
    };
    const onOnline = () => resumeRemote();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [reportAnomaly, pauseRemote, resumeRemote]);

  async function lockAndAdvance() {
    if (!progress || status !== "ready" || progress.paused) return;
    setStatus("submitting");
    setError("");
    try {
      const resp = await fetch(`/api/proxy/exams/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ selected }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(typeof data?.detail === "string" ? data.detail : "Could not lock answer");
        setStatus("ready");
        return;
      }
      const next = data as Progress;
      applyProgress(next);
      if (next.completed) {
        await fetchResult();
      }
    } catch {
      setError("Network error while submitting answer");
      setStatus("ready");
    }
  }

  if (status === "loading") {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="font-body" style={{ color: "var(--ox-muted)" }}>
          Loading attempt...
        </p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="font-body mb-4" style={{ color: "var(--gold-bright)" }}>
          {error || "Attempt unavailable"}
        </p>
        <Link href="/learner/exam" className="ox-cta inline-flex h-9 px-5 text-[13px] font-semibold items-center">
          Back to exam booking
        </Link>
      </main>
    );
  }

  if (status === "done" || progress?.completed) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl mb-3" style={{ fontWeight: 500 }}>
          Attempt complete
        </h1>
        <p className="font-body text-[14px] mb-4" style={{ color: "var(--ox-muted)" }}>
          Your answers are locked. An admin will review the written result
          {progress?.needs_admin_review ? " (this attempt was flagged for review due to integrity signals)" : ""}.
        </p>
        {(result || progress) && (
          <div
            className="rounded-sm p-5 mb-6"
            style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
          >
            <p className="font-body text-[15px]">
              Score: <strong>{result?.score ?? "—"}%</strong>
            </p>
            <p className="font-body text-[15px]">
              Result:{" "}
              <strong style={{ color: result?.passed ? "var(--mint)" : "var(--gold-bright)" }}>
                {result?.passed == null ? "Pending" : result.passed ? "PASS" : "FAIL"}
              </strong>
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Link href="/learner/certificate" className="ox-cta inline-flex h-9 px-5 text-[13px] font-semibold items-center">
            Certificate path
          </Link>
          <button
            type="button"
            onClick={() => router.push("/learner/exam")}
            className="ox-ghost-light h-9 px-5 text-[13px] font-semibold"
          >
            Exam sessions
          </button>
        </div>
      </main>
    );
  }

  const q = progress?.question;
  const qNum = (progress?.current_index ?? 0) + 1;
  const total = progress?.total_questions ?? 0;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="font-body text-[12px] uppercase tracking-wide" style={{ color: "var(--ox-muted)" }}>
            Question {qNum} of {total} · one-way · no going back
          </p>
          <h1 className="font-display text-2xl" style={{ fontWeight: 500 }}>
            Written examination
          </h1>
        </div>
        <div className="flex gap-4 font-body text-[13px]">
          <div>
            <span style={{ color: "var(--ox-muted)" }}>Question </span>
            <strong style={{ color: qRemain <= 15 ? "var(--gold-bright)" : "inherit" }}>
              {formatMmSs(qRemain)}
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--ox-muted)" }}>Overall </span>
            <strong>{formatMmSs(oRemain)}</strong>
          </div>
        </div>
      </div>

      {progress?.paused && (
        <div
          className="rounded-sm p-4 mb-4 font-body text-[14px]"
          style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", color: "var(--gold-bright)" }}
        >
          Connection paused — per-question clock frozen.{" "}
          <button type="button" className="underline" onClick={() => resumeRemote()}>
            Resume now
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-sm p-3 mb-4 font-body text-[13px]" style={{ color: "var(--gold-bright)" }}>
          {error}
        </div>
      )}

      {q && (
        <div className="rounded-sm p-5 mb-5" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          {q.pillar_tag && (
            <p className="font-body text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--ox-muted)" }}>
              {q.pillar_tag}
            </p>
          )}
          <p className="font-body text-[16px] leading-relaxed mb-5">{q.text}</p>
          <div className="space-y-2">
            {OPTIONS.map(({ key, label }) => (
              <label
                key={key}
                className="flex gap-3 items-start p-3 rounded-sm cursor-pointer"
                style={{
                  border: `1px solid ${selected === key ? "var(--gold)" : "var(--ox-line)"}`,
                  background: selected === key ? "rgba(217,172,74,0.08)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="answer"
                  className="mt-1"
                  checked={selected === key}
                  disabled={!!progress?.paused || status === "submitting"}
                  onChange={() => setSelected(key)}
                />
                <span className="font-body text-[14px]">
                  <strong className="uppercase mr-2">{key}.</strong>
                  {String(q[label] || "")}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={lockAndAdvance}
          disabled={!selected || !!progress?.paused || status === "submitting"}
          className="ox-cta h-10 px-6 text-[13px] font-semibold disabled:opacity-50"
        >
          {status === "submitting" ? "Locking..." : qNum >= total ? "Lock final answer" : "Lock answer & continue"}
        </button>
        <p className="font-body text-[12px]" style={{ color: "var(--ox-muted)" }}>
          Mark your best guess and move on. You cannot return to earlier questions.
        </p>
      </div>
    </main>
  );
}
