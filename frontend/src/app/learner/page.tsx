"use client";
import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedBarChart, AreaTrendChart, DonutChart, MultiSegmentDonut } from "@/components/ui/Charts";
import { BookOpen, Calendar, Target, Zap } from "react-feather";
import Link from "next/link";

type SeriesPoint = { label: string; value: number };
type MixSeg = { label: string; value: number; color_key: string };

type LearnerCourse = {
  course_id: number;
  title: string;
  description?: string | null;
  progress: number;
  lessons_completed: number;
  lessons_total: number;
  status: string;
  next_module?: string | null;
};

type LearnerDash = {
  first_name: string;
  course_title?: string | null;
  course_id?: number | null;
  course_progress: number;
  lessons_completed: number;
  lessons_total: number;
  readiness: number;
  gate_progress: number;
  gate_step: number;
  weekly_learning: SeriesPoint[];
  focus_mix: MixSeg[];
  assessment_avg?: number | null;
  assessment_best?: number | null;
  next_module?: string | null;
  has_exam_booking: boolean;
  has_practical_pass: boolean;
  has_certificate: boolean;
  written_passed: boolean;
  courses?: LearnerCourse[];
};

const COLOR_MAP: Record<string, string> = {
  accent: "var(--ox-accent)",
  blue: "var(--ox-blue)",
  indigo: "var(--ox-indigo)",
};

export default function LearnerDashboard() {
  const [data, setData] = useState<LearnerDash | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const resp = await fetch("/api/proxy/courses/my/dashboard", { cache: "no-store" });
      if (resp.ok) setData(await resp.json());
      setLoaded(true);
    };
    load();
  }, []);

  const firstName = data?.first_name ?? "Learner";
  const courseProgress = data?.course_progress ?? 0;
  const readiness = data?.readiness ?? courseProgress;
  const gateProgress = data?.gate_progress ?? 0;
  const gateStep = data?.gate_step ?? 1;
  const weeklyLearning = data?.weekly_learning ?? [];
  const trendValues = weeklyLearning.map((p) => p.value);
  const lessonsCompleted = data?.lessons_completed ?? 0;
  const nextModule = data?.next_module ?? "—";
  // Prefer `courses[]`; fall back to legacy single-course dashboard fields.
  const enrolledCourses: LearnerCourse[] =
    data?.courses?.length
      ? data.courses
      : data?.course_id
        ? [
            {
              course_id: data.course_id,
              title: data.course_title || "Course",
              description: null,
              progress: courseProgress,
              lessons_completed: data.lessons_completed ?? 0,
              lessons_total: data.lessons_total ?? 0,
              status: courseProgress >= 100 ? "completed" : "active",
              next_module: data.next_module,
            },
          ]
        : [];
  const focusMix = (data?.focus_mix ?? []).filter((s) => s.value > 0);

  const steps = [
    { step: "01", label: "Study modules", done: gateStep >= 2 || courseProgress > 0 },
    { step: "02", label: "Pass written exam", done: Boolean(data?.written_passed) },
    { step: "03", label: "Practical PASS", done: Boolean(data?.has_practical_pass) },
    { step: "04", label: "Certificate issued", done: Boolean(data?.has_certificate) },
  ];

  if (!loaded) {
    return (
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-8 text-[13px]" style={{ color: "var(--ox-muted)" }}>
        Loading dashboard…
      </main>
    );
  }

  return (
    <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ScrollReveal className="lg:col-span-12">
          <div
            className="p-5 md:p-6 relative overflow-hidden"
            style={{
              background: "rgba(12,15,18,0.45)",
              border: "1px solid rgba(150,118,43,0.4)",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-display text-[11px] uppercase tracking-[0.22em] mb-1.5" style={{ color: "var(--ochre)" }}>
                  Learner pathway
                </div>
                <h1 className="font-display text-2xl md:text-3xl mb-1" style={{ color: "var(--cream)", fontWeight: 500 }}>
                  Welcome back, {firstName}
                </h1>
                <p className="font-body text-[13px] md:text-[14px] max-w-xl" style={{ color: "rgba(242,237,227,0.65)" }}>
                  Dual-gate path: study modules, pass the written exam, then earn a practical PASS.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 shrink-0">
                {[
                  { label: "Course", value: `${courseProgress}%` },
                  { label: "Readiness", value: `${readiness}%` },
                  { label: "Gate", value: `${Math.min(gateStep, 4)} / 4` },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="px-3 py-2 text-center min-w-[72px]"
                    style={{ border: "1px solid rgba(150,118,43,0.45)" }}
                  >
                    <div className="font-display text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ochre)" }}>{chip.label}</div>
                    <div className="font-display text-lg leading-tight" style={{ color: "var(--cream)", fontWeight: 500 }}>{chip.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={40} className="lg:col-span-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className="rounded-xl px-3.5 py-3 ox-kpi-float"
                style={{
                  background: item.done ? "rgba(42,161,135,0.15)" : "var(--ox-surface)",
                  border: `1px solid ${item.done ? "rgba(42,161,135,0.4)" : "var(--ox-line)"}`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ox-accent)" }}>{item.step}</div>
                <div className="text-[13px] font-medium mt-0.5" style={{ color: "var(--ox-fg)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-8 h-full">
          <div className="ox-card rounded-2xl overflow-hidden h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="px-5 py-4 flex justify-between items-center gap-3" style={{ borderBottom: "1px solid var(--ox-line)" }}>
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>My Courses</h2>
              <div className="flex items-center gap-2">
                <span className="text-[12px] px-2.5 py-1" style={{ border: "1px solid rgba(150,118,43,0.4)", color: "var(--ochre)" }}>
                  {enrolledCourses.length} enrolled
                </span>
                <Link href="/learner/courses" className="text-[13px]" style={{ color: "var(--ox-accent)" }}>
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-3">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => {
                  const pct = Math.max(0, Math.min(100, course.progress));
                  const statusLabel = pct >= 100 ? "Completed" : pct > 0 ? "In progress" : "Not started";
                  return (
                    <div
                      key={course.course_id}
                      className="flex flex-col sm:flex-row gap-4 rounded-xl p-4"
                      style={{ border: "1px solid var(--ox-line)", background: "var(--ox-bg)" }}
                    >
                      <div
                        className="w-full sm:w-28 h-20 sm:h-auto rounded-lg flex-shrink-0 grid place-items-center"
                        style={{ background: "rgba(217,172,74,0.08)" }}
                      >
                        <Zap size={24} style={{ color: "var(--ox-accent)" }} />
                      </div>
                      <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className="text-[11px] uppercase tracking-[0.16em] px-2 py-0.5"
                              style={{
                                color: pct >= 100 ? "var(--mint)" : "var(--ox-accent)",
                                background: pct >= 100 ? "rgba(42,161,135,0.14)" : "rgba(217,172,74,0.12)",
                              }}
                            >
                              {statusLabel}
                            </span>
                            <span className="font-display text-[13px]" style={{ color: "var(--cream)", fontWeight: 500 }}>
                              {pct}% complete
                            </span>
                          </div>
                          <h3 className="font-bold text-[15px] leading-snug mb-1" style={{ color: "var(--ox-fg)" }}>
                            {course.title}
                          </h3>
                          <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "var(--ox-muted)" }}>
                            {course.description || "Structured modules with lessons and assessments."}
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between text-[12px] mb-1.5">
                            <span style={{ color: "var(--ox-indigo)" }}>Progress to completion</span>
                            <span style={{ color: "var(--ox-muted)" }}>
                              {pct}% · {course.lessons_completed} / {course.lessons_total} lessons
                            </span>
                          </div>
                          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(150,118,43,0.25)" }}>
                            <div
                              className="h-2 rounded-full ox-progress-fill transition-all duration-500"
                              style={{ width: `${pct}%`, background: "var(--gold)" }}
                            />
                          </div>
                          <Link
                            href={`/learner/courses/${course.course_id}`}
                            className="mt-3 ox-cta inline-flex items-center h-9 rounded-full px-5 text-[13px] font-semibold"
                          >
                            {pct >= 100 ? "Review course →" : pct > 0 ? "Continue learning →" : "Start course →"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl p-5 flex flex-col justify-center" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-bg)" }}>
                  <p className="font-medium text-[15px]" style={{ color: "var(--ox-fg)" }}>No courses enrolled yet</p>
                  <p className="text-[13px] mt-1 mb-4" style={{ color: "var(--ox-muted)" }}>
                    When you are enrolled in a specialisation course, progress will appear here.
                  </p>
                  <Link href="/learner/courses" className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold inline-flex items-center w-fit">
                    Open courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} className="lg:col-span-4 h-full">
          <div className="ox-card rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <h2 className="font-semibold text-[15px] mb-3" style={{ color: "var(--ox-fg)" }}>Certification Gates</h2>
            <div className="flex justify-center flex-1 items-center">
              <DonutChart value={gateProgress} label="gate" sublabel="complete" size={124} thickness={12} />
            </div>
            <p className="text-[12px] text-center mt-2 mb-3" style={{ color: "var(--ox-muted)" }}>
              Written + practical both required before issuance.
            </p>
            <div className="flex flex-col gap-2 mt-auto">
              <Link href="/learner/exam" className="w-full inline-flex items-center justify-center py-2.5 rounded-full text-[13px] font-medium ox-cta gap-2">
                <Calendar size={14} /> {data?.has_exam_booking ? "View exam booking" : "Book online exam"}
              </Link>
              <Link href="/learner/certificate" className="w-full inline-flex items-center justify-center py-2.5 rounded-full text-[13px] font-medium ox-ghost-light">
                View certificate status
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="flex items-center gap-2 mb-3" style={{ color: "var(--ox-accent)" }}>
              <Target size={16} />
              <span className="text-[12px] uppercase tracking-[0.14em]">Readiness</span>
            </div>
            <div className="flex-1 grid place-items-center">
              <DonutChart value={readiness} label="ready" sublabel="index" size={118} thickness={11} />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={130} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="flex items-center gap-2 mb-3" style={{ color: "var(--ox-blue)" }}>
              <BookOpen size={16} />
              <span className="text-[12px] uppercase tracking-[0.14em]">Focus mix</span>
            </div>
            <div className="flex-1 grid place-items-center">
              {focusMix.length ? (
                <MultiSegmentDonut
                  size={118}
                  thickness={14}
                  centerValue={String(lessonsCompleted)}
                  centerLabel="lessons"
                  segments={focusMix.map((s) => ({
                    value: s.value,
                    color: COLOR_MAP[s.color_key] || "var(--ox-blue)",
                    label: s.label,
                  }))}
                />
              ) : (
                <p className="text-[12px] text-center" style={{ color: "var(--ox-muted)" }}>No activity yet</p>
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col justify-between" style={{ background: "var(--ox-surface)" }}>
            <div>
              <div className="text-[12px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--ox-muted)" }}>Next milestone</div>
              <p className="font-display text-xl mb-1.5 leading-snug" style={{ color: "var(--ox-fg)", fontWeight: 500 }}>{nextModule}</p>
              <p className="text-[13px]" style={{ color: "var(--ox-muted)" }}>Continue lessons to unlock the next module.</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span style={{ color: "var(--ox-muted)" }}>Unlock</span>
                <span style={{ color: "var(--ox-fg)" }}>{courseProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(150,118,43,0.25)" }}>
                <div
                  className="h-2 rounded-full ox-progress-fill"
                  style={{ width: `${courseProgress}%`, background: "var(--mint)" }}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={180} className="lg:col-span-6 h-full">
          <div className="ox-card rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Weekly Learning Velocity</h2>
              <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ox-muted)" }}>Activity</span>
            </div>
            <div className="flex-1">
              <AnimatedBarChart data={weeklyLearning} height={150} />
            </div>
            <p className="mt-2 text-[12px]" style={{ color: "var(--ox-muted)" }}>
              Based on your recent lesson completions.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={210} className="lg:col-span-6 h-full">
          <div className="ox-card rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Learning Trend</h2>
              <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ox-muted)" }}>Last 6 days</span>
            </div>
            <div className="rounded-xl p-3 flex-1" style={{ border: "1px solid var(--ox-line)", background: "rgba(12,15,18,0.22)" }}>
              <AreaTrendChart values={trendValues} gradientId="learnerTrend" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                {
                  label: "Average",
                  value: data?.assessment_avg != null ? `${data.assessment_avg}%` : "—",
                },
                {
                  label: "Best",
                  value: data?.assessment_best != null ? `${data.assessment_best}%` : "—",
                },
                { label: "Status", value: readiness >= 60 ? "On track" : "Building" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg py-2" style={{ background: "rgba(217,172,74,0.08)" }}>
                  <p className="text-[11px]" style={{ color: "var(--ox-muted)" }}>{s.label}</p>
                  <p className="font-semibold text-[14px]" style={{ color: "var(--ox-fg)" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
