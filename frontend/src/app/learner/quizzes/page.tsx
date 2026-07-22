"use client";

import { useEffect, useMemo, useState } from "react";

type QuizQuestion = {
  id: number | string;
  text: string;
  question?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  options?: string[];
};

type QuizData = {
  id: number;
  module_id: number;
  questions: QuizQuestion[];
};

export default function LearnerQuizzesPage() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "submitting">("loading");

  useEffect(() => {
    const loadQuiz = async () => {
      setStatus("loading");
      try {
        // Phase 1: using module 1 quiz as a functional baseline.
        const quizResp = await fetch("/api/proxy/modules/1/quiz", { cache: "no-store" });
        if (!quizResp.ok) {
          setStatus("error");
          return;
        }
        const data = (await quizResp.json()) as QuizData;
        setQuiz(data);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    };
    loadQuiz();
  }, []);

  const totalQuestions = useMemo(() => quiz?.questions?.length ?? 0, [quiz]);

  async function submitQuiz() {
    if (!quiz) return;
    setStatus("submitting");
    try {
      const resp = await fetch(`/api/proxy/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!resp.ok) {
        setStatus("error");
        return;
      }
      const data = (await resp.json()) as { score: number; passed: boolean };
      setResult(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-display text-3xl mb-2" style={{ fontWeight: 500 }}>Module Quiz</h1>
        <p className="text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
          Complete knowledge checks at the end of each module.
        </p>

        {status === "loading" && <p>Loading quiz...</p>}
        {status === "error" && (
          <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            Quiz is not available yet. Ask admin to publish a module quiz.
          </div>
        )}

        {quiz && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
              <div className="text-[13px]" style={{ color: "var(--ox-muted)" }}>Questions: {totalQuestions}</div>
            </div>
            {quiz.questions.map((q, idx) => {
              const key = String(q.id);
              return (
                <div key={key} className="rounded-xl p-5" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
                  <h2 className="font-semibold mb-3">{idx + 1}. {q.text || q.question || "Question"}</h2>
                  {(["a", "b", "c", "d"] as const).map((opt) => {
                    const fallbackIndex = { a: 0, b: 1, c: 2, d: 3 }[opt];
                    const keyed = q[`option_${opt}` as keyof QuizQuestion] as string;
                    const optionText = keyed || q.options?.[fallbackIndex] || `Option ${opt.toUpperCase()}`;
                    const selected = answers[key] === opt;
                    return (
                      <label key={opt} className="flex items-center gap-3 mb-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${key}`}
                          value={opt}
                          checked={selected}
                          onChange={() => setAnswers((prev) => ({ ...prev, [key]: opt }))}
                        />
                        <span>{optionText}</span>
                      </label>
                    );
                  })}
                </div>
              );
            })}
            <button
              onClick={submitQuiz}
              disabled={status === "submitting"}
              className="ox-cta h-10 px-6 text-[14px] font-semibold"
            >
              {status === "submitting" ? "Submitting..." : "Submit Quiz"}
            </button>
            {result && (
              <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
                Score: <strong>{result.score}%</strong> - {result.passed ? "Passed" : "Not passed"}
              </div>
            )}
          </div>
        )}
    </main>
  );
}
