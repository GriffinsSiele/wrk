"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Zap } from "react-feather";

type Enrollment = {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  progress: number;
  lessons_completed: number;
  lessons_total: number;
  status: string;
  next_module?: string | null;
};

export default function LearnerCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/proxy/courses/my/enrollments", { cache: "no-store" });
        if (!resp.ok) {
          setError("Unable to load enrolled courses");
          return;
        }
        setEnrollments(await resp.json());
      } catch {
        setError("Unable to load enrolled courses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="max-w-5xl w-full mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--cream)", fontWeight: 500 }}>
          My courses
        </h1>
        <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
          Courses you are enrolled in, with live progress toward completion.
        </p>
      </div>

      {loading && (
        <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
          Loading enrollments…
        </p>
      )}

      {error && !loading && (
        <p className="font-body text-[14px]" style={{ color: "var(--gold-bright)" }}>
          {error}
        </p>
      )}

      {!loading && !error && enrollments.length === 0 && (
        <div
          className="rounded-sm p-8 text-center"
          style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
        >
          <BookOpen size={28} className="mx-auto mb-3" style={{ color: "var(--ochre)" }} />
          <p className="font-display text-[1.1rem]" style={{ color: "var(--cream)", fontWeight: 500 }}>
            No enrollments yet
          </p>
          <p className="font-body text-[13px] mt-2" style={{ color: "var(--ox-muted)" }}>
            When admin enrolls you in a course, it will show here with your completion percentage.
          </p>
        </div>
      )}

      {!loading && enrollments.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className="font-display text-[11px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--mint)" }}
            >
              {enrollments.length} enrolled
            </span>
            <span
              className="font-display text-[11px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--ochre)" }}
            >
              {enrollments.filter((e) => e.progress >= 100).length} completed
            </span>
          </div>

          {enrollments.map((course) => {
            const pct = Math.max(0, Math.min(100, course.progress ?? 0));
            const statusLabel = pct >= 100 ? "Completed" : pct > 0 ? "In progress" : "Not started";
            return (
              <article
                key={course.id}
                className="rounded-sm p-5 flex flex-col sm:flex-row gap-4"
                style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
              >
                <div
                  className="w-full sm:w-32 h-24 sm:h-auto rounded-sm flex-shrink-0 grid place-items-center"
                  style={{ background: "rgba(217,172,74,0.08)" }}
                >
                  <Zap size={26} style={{ color: "var(--ox-accent)" }} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className="font-display text-[11px] uppercase tracking-[0.16em]"
                        style={{
                          color: pct >= 100 ? "var(--mint)" : "var(--ochre)",
                          borderBottom: "1px solid rgba(150,118,43,0.55)",
                        }}
                      >
                        {statusLabel}
                      </span>
                      <span className="font-display text-[14px]" style={{ color: "var(--cream)", fontWeight: 500 }}>
                        {pct}% complete
                      </span>
                    </div>
                    <h2 className="font-display text-[1.15rem] leading-snug" style={{ color: "var(--cream)", fontWeight: 500 }}>
                      {course.title}
                    </h2>
                    <p className="font-body text-[13px] mt-1.5 leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                      {course.description || "Structured modules with lessons and assessments."}
                    </p>
                    {course.next_module && pct < 100 && (
                      <p className="font-body text-[12px] mt-2" style={{ color: "var(--ochre)" }}>
                        Next: {course.next_module}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1.5 font-body">
                      <span style={{ color: "var(--ox-indigo)" }}>Progress to completion</span>
                      <span style={{ color: "var(--ox-muted)" }}>
                        {pct}% · {course.lessons_completed} / {course.lessons_total} lessons
                      </span>
                    </div>
                    <div className="w-full rounded-sm h-2 overflow-hidden" style={{ background: "rgba(150,118,43,0.25)" }}>
                      <div
                        className="h-2 rounded-sm transition-all duration-500"
                        style={{ width: `${pct}%`, background: "var(--mint)" }}
                      />
                    </div>
                    <Link
                      href={`/learner/courses/${course.course_id}`}
                      className="mt-3 ox-ghost-light inline-flex items-center h-9 px-5 text-[13px] font-medium w-fit"
                    >
                      {pct >= 100 ? "Review course →" : pct > 0 ? "Continue learning →" : "Start course →"}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
