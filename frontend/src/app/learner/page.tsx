"use client";
import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedBarChart, AreaTrendChart, DonutChart, MultiSegmentDonut } from "@/components/ui/Charts";
import { BookOpen, Calendar, Target, Zap } from "react-feather";
import Link from "next/link";

type SeriesPoint = { label: string; value: number };
type MixSeg = { label: string; value: number; color_key: string };

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
  assessment_avg: number;
  assessment_best: number;
  next_module?: string | null;
  has_exam_booking: boolean;
  has_practical_pass: boolean;
  has_certificate: boolean;
  written_passed: boolean;
};

const COLOR_MAP: Record<string, string> = {
  accent: "var(--ox-accent)",
  blue: "var(--ox-blue)",
  indigo: "var(--ox-indigo)",
};

const quizTrendPath = "M8 58 C28 54, 48 42, 72 44 C96 46, 116 30, 140 24 C164 18, 188 14, 212 10 C232 8, 252 8, 272 6";

export default function LearnerDashboard() {
  const [data, setData] = useState<LearnerDash | null>(null);

  useEffect(() => {
    const load = async () => {
      const resp = await fetch("/api/proxy/courses/my/dashboard", { cache: "no-store" });
      if (!resp.ok) return;
      setData(await resp.json());
    };
    load();
  }, []);

  const firstName = data?.first_name ?? "Learner";
  const courseProgress = data?.course_progress ?? 0;
  const readiness = data?.readiness ?? 0;
  const gateProgress = data?.gate_progress ?? 0;
  const gateStep = data?.gate_step ?? 1;
  const weeklyLearning = data?.weekly_learning?.length
    ? data.weekly_learning
    : [
        { label: "Mon", value: 10 },
        { label: "Tue", value: 14 },
        { label: "Wed", value: 12 },
        { label: "Thu", value: 16 },
        { label: "Fri", value: 13 },
        { label: "Sat", value: 9 },
      ];
  const courseId = data?.course_id ?? 1;
  const courseTitle = data?.course_title ?? "Human Readiness Certification (Level 1)";
  const lessonsCompleted = data?.lessons_completed ?? 0;
  const lessonsTotal = data?.lessons_total ?? 8;
  const nextModule = data?.next_module ?? "Module 2";
  const focusMix = data?.focus_mix ?? [
    { label: "Video", value: 45, color_key: "accent" },
    { label: "Quizzes", value: 30, color_key: "blue" },
    { label: "Reading", value: 25, color_key: "indigo" },
  ];

  const steps = [
    { step: "01", label: "Study modules", done: gateStep >= 2 || courseProgress > 0 },
    { step: "02", label: "Pass written exam", done: Boolean(data?.written_passed) },
    { step: "03", label: "Practical PASS", done: Boolean(data?.has_practical_pass) },
    { step: "04", label: "Certificate issued", done: Boolean(data?.has_certificate) },
  ];

  return (
    <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ScrollReveal className="lg:col-span-12">
          <div
            className="ox-hero-shimmer rounded-2xl p-5 md:p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(46,60,142,0.94), rgba(62,128,204,0.92))",
              boxShadow: "0 24px 56px -34px rgba(46,60,142,0.65)",
            }}
          >
            <div
              className="absolute -top-12 -right-10 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(37,192,210,0.35), transparent 70%)" }}
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Learner Command
                </div>
                <h1 className="font-outfit font-bold text-2xl md:text-3xl text-white mb-1">Welcome back, {firstName}</h1>
                <p className="text-[13px] md:text-[14px] max-w-xl" style={{ color: "rgba(255,255,255,0.78)" }}>
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
                    className="rounded-xl px-3 py-2 text-center min-w-[72px]"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.7)" }}>{chip.label}</div>
                    <div className="font-outfit font-bold text-white text-lg leading-tight">{chip.value}</div>
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
                  background: item.done ? "rgba(37,192,210,0.1)" : "var(--ox-surface)",
                  border: `1px solid ${item.done ? "rgba(37,192,210,0.35)" : "var(--ox-line)"}`,
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
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--ox-line)" }}>
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>My Courses</h2>
              <Link href={`/learner/courses/${courseId}`} className="text-[13px]" style={{ color: "var(--ox-accent)" }}>Browse all →</Link>
            </div>
            <div className="p-5 flex-1">
              <div className="flex flex-col sm:flex-row gap-4 rounded-xl p-4 h-full" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-bg)" }}>
                <div
                  className="w-full sm:w-36 h-24 sm:h-auto rounded-lg flex-shrink-0 grid place-items-center"
                  style={{ background: "linear-gradient(135deg, rgba(37,192,210,0.12), rgba(62,128,204,0.12))" }}
                >
                  <Zap size={28} style={{ color: "var(--ox-accent)" }} />
                </div>
                <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--ox-accent)" }}>
                      Level 1 · In Progress
                    </div>
                    <h3 className="font-bold text-[15px] leading-snug mb-1.5" style={{ color: "var(--ox-fg)" }}>{courseTitle}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                      Physiology of readiness and recovery with structured modules and assessments.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span style={{ color: "var(--ox-indigo)" }}>Progress</span>
                      <span style={{ color: "var(--ox-muted)" }}>{courseProgress}% · {lessonsCompleted} / {lessonsTotal} lessons</span>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(26,26,26,0.08)" }}>
                      <div
                        className="h-2 rounded-full ox-progress-fill"
                        style={{ width: `${courseProgress}%`, background: "linear-gradient(90deg, var(--ox-accent), var(--ox-blue))" }}
                      />
                    </div>
                    <Link href={`/learner/courses/${courseId}`} className="mt-3 ox-cta inline-flex items-center h-9 rounded-full px-5 text-[13px] font-semibold">
                      Continue learning →
                    </Link>
                  </div>
                </div>
              </div>
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
              <MultiSegmentDonut
                size={118}
                thickness={14}
                centerValue={`${Math.max(1, Math.round(lessonsCompleted * 0.8))}h`}
                centerLabel="week"
                segments={focusMix.map((s) => ({
                  value: s.value,
                  color: COLOR_MAP[s.color_key] || "var(--ox-blue)",
                  label: s.label,
                }))}
              />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col justify-between" style={{ background: "var(--ox-surface)" }}>
            <div>
              <div className="text-[12px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--ox-muted)" }}>Next milestone</div>
              <p className="font-outfit font-bold text-xl mb-1.5 leading-snug" style={{ color: "var(--ox-fg)" }}>{nextModule}</p>
              <p className="text-[13px]" style={{ color: "var(--ox-muted)" }}>Continue lessons to unlock the next module.</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span style={{ color: "var(--ox-muted)" }}>Unlock</span>
                <span style={{ color: "var(--ox-fg)" }}>{courseProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(62,128,204,0.15)" }}>
                <div
                  className="h-2 rounded-full ox-progress-fill"
                  style={{ width: `${courseProgress}%`, background: "linear-gradient(90deg, var(--ox-accent), var(--ox-indigo))" }}
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
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Assessment Trend</h2>
              <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ox-muted)" }}>Exam readiness</span>
            </div>
            <div className="rounded-xl p-3 flex-1" style={{ border: "1px solid var(--ox-line)", background: "rgba(62,128,204,0.05)" }}>
              <AreaTrendChart path={quizTrendPath} gradientId="learnerTrend" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Average", value: `${data?.assessment_avg ?? 0}%` },
                { label: "Best", value: `${data?.assessment_best ?? 0}%` },
                { label: "Status", value: readiness >= 60 ? "On track" : "Building" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg py-2" style={{ background: "rgba(62,128,204,0.08)" }}>
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
