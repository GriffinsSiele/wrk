"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Activity, ArrowUp, BarChart2, BookOpen, Briefcase, RefreshCw, Target, Zap } from "react-feather";

// ── Hero content with stronger tagline and CTA wording 
function HeroContent() {
  useEffect(() => {
    // Staggered hero entrance
    const items = document.querySelectorAll('.hero-enter');
    items.forEach((el, i) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.filter = 'blur(0px)';
        (el as HTMLElement).style.transform = 'translateY(0)';
      }, 120 + i * 90);
    });
  }, []);

  return (
    <>
      {/* Tagline */}
      <div
        className="hero-enter ox-label"
        style={{ opacity: 0, filter: "blur(6px)", transform: "translateY(12px)", transition: "all 0.7s ease" }}
      >
        <span className="ox-dot" />
        Become the engine of human performance – certify, coach, transform.
      </div>

      {/* Headline */}
      <h1
        className="hero-enter mt-8 font-outfit font-bold leading-[0.93] tracking-[-0.04em]"
        style={{
          fontSize: "clamp(48px, 8vw, 96px)",
          color: "var(--ox-fg)",
          opacity: 0,
          filter: "blur(10px)",
          transform: "translateY(24px)",
          transition: "all 0.8s ease",
          maxWidth: "900px",
        }}
      >
        The operating system<br />
        <span style={{ color: "rgba(26,26,26,0.28)" }}>
          for human performance.
        </span>
      </h1>

      {/* Subheadline */}
      <p
        className="hero-enter mt-8 text-[19px] leading-relaxed max-w-lg"
        style={{
          color: "var(--ox-muted)",
          opacity: 0,
          transform: "translateY(14px)",
          transition: "all 0.7s ease",
        }}
      >
        Join a fast‑growing network of elite coaches and forward‑thinking organisations across the UAE and Gulf. Measure, recover, and excel – no medical jargon, just science‑backed insights.
      </p>

      {/* CTAs with richer wording */}
      <div
        className="hero-enter mt-10 flex flex-wrap gap-4"
        style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.7s ease" }}
      >
        <Link
          href="/certification"
          className="ox-cta inline-flex items-center h-12 rounded-full px-8 text-[15px] font-semibold"
        >
          Start your certification journey →
        </Link>
        <Link
          href="/organisations"
          className="ox-ghost-light inline-flex items-center h-12 rounded-full px-8 text-[15px] font-medium"
        >
          Explore partnership opportunities
        </Link>
      </div>
    </>
  );
}

// ── Live data panel (static placeholder) ────────────────────────────────────────
function ReadinessPanel() {
  const bars = [70, 90, 55, 85, 65, 95, 75, 50, 80, 60];

  return (
    <div
      className="relative w-full max-w-[440px] mx-auto rounded-2xl overflow-hidden ox-ring"
      style={{
        border: "1px solid rgba(26,26,26,0.08)",
        background: "var(--ox-surface)",
        color: "var(--ox-fg)",
      }}
    >
      {/* Sidebar */}
      <div className="flex">
        <div
          className="hidden sm:flex w-14 flex-col items-center justify-between py-3"
          style={{ borderRight: "1px solid rgba(26,26,26,0.07)" }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl grid place-items-center font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, var(--ox-accent), var(--ox-blue))" }}
            >
              RP
            </div>
            {[BarChart2, BookOpen, Zap].map((Icon, i) => (
              <span
                key={i}
                className="w-9 h-9 grid place-items-center rounded-lg text-base cursor-pointer"
                style={{ color: "rgba(26,26,26,0.3)" }}
              >
                <Icon size={16} />
              </span>
            ))}
          </div>
          <div
          className="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold"
          style={{ background: "rgba(62,128,204,0.12)", color: "var(--ox-indigo)" }}
          >
            JD
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div
            className="flex items-center gap-1 px-3 h-11"
            style={{ borderBottom: "1px solid rgba(26,26,26,0.07)" }}
          >
            {["Readiness", "Recovery", "Load", "Certification"].map((t, i) => (
              <button
                key={t}
                className="relative rounded-md px-3 py-1.5 text-[12px] transition-colors"
                style={i === 0 ? { color: "var(--ox-fg)" } : { color: "rgba(26,26,26,0.4)" }}
              >
                {i === 0 && (
                  <span
                    className="absolute inset-0 -z-0 rounded-md"
                    style={{ border: "1px solid rgba(10,10,10,0.08)", background: "rgba(10,10,10,0.05)" }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div
            className="flex-1 px-5 py-5 space-y-4"
            style={{ background: "var(--ox-bg)", minHeight: 180 }}
          >
            {/* User message */}
            <div className="flex justify-end">
              <div
                className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed"
                style={{ background: "rgba(10,10,10,0.05)", color: "rgba(10,10,10,0.82)" }}
              >
                Show my readiness score breakdown.
              </div>
            </div>
            {/* AI reply */}
            <div className="flex gap-3">
              <div
                className="mt-0.5 w-7 h-7 rounded-lg grid place-items-center text-white flex-shrink-0 text-xs font-bold"
                style={{ background: "linear-gradient(135deg, var(--ox-accent), var(--ox-blue))" }}
              >
                OA
              </div>
              <div className="text-[13px] leading-relaxed flex-1" style={{ color: "rgba(10,10,10,0.82)" }}>
                Current readiness index: <strong>92</strong>/100 — Optimal.
                <div className="mt-3 rounded-lg p-3 text-[12px]" style={{ border: "1px solid rgba(10,10,10,0.08)", background: "rgba(10,10,10,0.02)" }}>
                  <div className="flex justify-between mb-1">
                    <span>HRV Recovery</span>
                    <span style={{ color: "var(--ox-accent)", fontVariantNumeric: "tabular-nums" }}>+14% · 96</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load Capacity</span>
                    <span style={{ color: "rgba(26,26,26,0.5)", fontVariantNumeric: "tabular-nums" }}>Optimal · 88</span>
                  </div>
                </div>
                {/* Mini bar chart */}
                <div className="mt-3 flex items-end gap-1 h-12">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="ox-bar flex-1"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--ox-line)", background: "var(--ox-surface)" }}>
            <div className="flex items-center gap-2 rounded-2xl p-2" style={{ border: "1px solid rgba(10,10,10,0.08)", background: "rgba(10,10,10,0.02)" }}>
              <span className="w-9 h-9 grid place-items-center rounded-xl" style={{ color: "rgba(26,26,26,0.4)" }}>+</span>
              <span className="flex-1 text-[14px]" style={{ color: "rgba(26,26,26,0.3)" }}>Ask anything about your progress…</span>
              <span
                className="w-9 h-9 grid place-items-center rounded-xl text-white text-sm font-bold"
                style={{ background: "linear-gradient(135deg, var(--ox-accent), var(--ox-blue))" }}
              >
                <ArrowUp size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pillars data – now with benefit statements ───────────────────────────────────
const pillars = [
  {
    num: "01",
    title: "Human Readiness",
    desc: "Measure the body’s actual state against its ambition – close the gap safely and quickly.",
    icon: Zap,
  },
  {
    num: "02",
    title: "Recovery Intelligence",
    desc: "Boost recovery capacity so athletes and executives can train harder and work smarter.",
    icon: RefreshCw,
  },
  {
    num: "03",
    title: "Coach Deployment",
    desc: "Match certified coaches to corporate or sport projects via an intelligent pool.",
    icon: Target,
  },
];

// ── Stats data – with a lead‑in tagline ────────────────────────────────────────
const stats = [
  { value: "10+", label: "Certified coaches" },
  { value: "3", label: "Certification levels" },
  { value: "UAE", label: "Primary market" },
  { value: "∞", label: "Potential" },
];

// ── Marquee items (unchanged) ─────────────────────────────────────────────────
const marqueeItems = [
  "Human Readiness",
  "Recovery",
  "Performance Intelligence",
  "Coach Deployment",
  "Certifications",
  "Corporate Wellness",
  "Sport Performance",
  "UAE & Gulf",
  "Human Readiness",
  "Recovery",
  "Performance Intelligence",
  "Coach Deployment",
  "Certifications",
  "Corporate Wellness",
  "Sport Performance",
  "UAE & Gulf",
];

// ── Page component ───────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen overflow-hidden flex items-center"
        style={{ background: "var(--ox-bg)" }}
      >
        {/* Aurora */}
        <div className="ox-aurora" aria-hidden="true" />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--ox-bg))" }}
        />

        {/* Content */}
        <div
          className="relative z-10 mx-auto max-w-screen-2xl w-full flex flex-col lg:flex-row items-center gap-12 px-6 lg:px-12 pt-24 pb-24"
        >
          <div className="flex-1 space-y-0">
            <HeroContent />
          </div>

          {/* Dashboard panel */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <ReadinessPanel />
          </div>
        </div>

        {/* Marquee strip */}
        <div
          className="absolute inset-x-0 bottom-5 overflow-hidden pointer-events-none px-6"
          style={{ maskImage: "linear-gradient(90deg, transparent, var(--ox-bg) 12%, var(--ox-bg) 88%, transparent)" }}
        >
          <div
            className="ox-marquee-track font-mono text-[11px] uppercase tracking-[0.22em] rounded-xl px-5 py-3"
            style={{
              color: "rgba(46,60,142,0.58)",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 14px 30px -24px rgba(46,60,142,0.5)",
            }}
          >
            {marqueeItems.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-10">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE ─────────────────────────────────────────────── */}
      <section className="ox-hairline ox-section" style={{ background: "var(--ox-bg-dark)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal>
            <div className="ox-label mb-6">Coverage</div>
            <h2
              className="font-outfit font-bold tracking-[-0.03em] max-w-2xl"
              style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--ox-fg-dark)" }}
            >
              Built for every organisation that cares about people.
            </h2>
            <p
              className="mt-4 max-w-xl text-[15px] leading-relaxed"
              style={{ color: "var(--ox-muted)" }}
            >
              Olynixx adapts its intelligence to your context. One platform, three specialisations.
            </p>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Briefcase,
                title: "Corporate Wellness",
                desc: "Executive burnout prevention, HRV‑guided programmes, and workplace readiness tracking for UAE enterprises.",
              },
              {
                icon: Activity,
                title: "Sport Performance",
                desc: "Elite athlete readiness, load management, and recovery protocols within a clear non‑medical scope.",
              },
              {
                icon: BookOpen,
                title: "Coach Development",
                desc: "Structured certification pathways with theory, practicum, and CECs to keep coaches at the frontier.",
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 100}>
                <div className="ox-card-dark h-full p-8 rounded-2xl">
                  <div
                    className="w-11 h-11 rounded-xl grid place-items-center text-xl mb-6"
                    style={{ background: "rgba(37,192,210,0.1)", color: "var(--ox-accent)" }}
                  >
                    <card.icon size={20} />
                  </div>
                  <h3 className="text-[16px] font-semibold mb-3" style={{ color: "var(--ox-fg-dark)" }}>{card.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                    {card.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS / LIGHT ───────────────────────────────── */}
      <section className="ox-section" style={{ background: "var(--ox-bg-mid)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal>
            <div className="ox-label mb-6">Our Philosophy</div>
            <h2
              className="font-outfit font-bold tracking-[-0.03em]"
              style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--ox-fg)" }}
            >
              Grounded in measurement.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
              We measure recovery and readiness, compare the body’s actual state to its ambition, and use that intelligence to coach there — safely.
            </p>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {pillars.map((p, i) => (
              <ScrollReveal key={p.num} delay={i * 110}>
                <div className="ox-card h-full p-8 rounded-2xl" style={{ background: "var(--ox-bg)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: "var(--ox-muted)" }}>
                      {p.num}
                    </span>
                    <span className="h-px flex-1" style={{ background: "rgba(26,26,26,0.07)" }} />
                    <p.icon size={20} />
                  </div>
                  <h3 className="font-outfit text-[18px] font-bold mb-3" style={{ color: "var(--ox-fg)" }}>
                    {p.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                    {p.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="ox-hairline ox-section" style={{ background: "var(--ox-bg-dark)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
              <div>
                <div className="ox-label mb-6">Traction</div>
                <h2
                  className="font-outfit font-bold tracking-[-0.03em]"
                  style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--ox-fg-dark)" }}
                >
                  Trusted by the region’s leading wellness innovators.
                </h2>
              </div>
              <span className="ox-label">
                <span className="ox-dot" />
                Always on
              </span>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 80}>
                <div className="ox-card-dark p-8 rounded-2xl text-center">
                  <div
                    className="font-outfit font-bold mb-2"
                    style={{ fontSize: "clamp(36px, 5vw, 56px)", color: "var(--ox-fg-dark)" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[12px] uppercase tracking-[0.18em]" style={{ color: "var(--ox-muted)" }}>
                    {s.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Pipeline animation */}
          <ScrollReveal delay={200}>
            <div className="ox-card-dark mt-6 p-7 rounded-2xl" style={{ background: "var(--ox-surface)" }}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--ox-muted)" }}>
                  Learner → certified coach · pipeline
                </span>
                <span className="font-mono text-[11px]" style={{ color: "var(--ox-muted)" }}>
                  avg. 6 months
                </span>
              </div>
              <div className="rounded-xl p-5 md:p-6" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-surface-strong)" }}>
                <div className="relative">
                  <div
                    className="hidden sm:block absolute left-[9%] right-[9%] top-5 h-px"
                    style={{ background: "linear-gradient(90deg, rgba(62,128,204,0.18), rgba(37,192,210,0.42), rgba(62,128,204,0.18))" }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 relative">
                    {[
                      { id: "01", title: "Enroll", note: "Account setup" },
                      { id: "02", title: "Study", note: "Core modules" },
                      { id: "03", title: "Written", note: "Online exam" },
                      { id: "04", title: "Practical", note: "Assessor PASS" },
                      { id: "05", title: "Certified", note: "Coach profile live" },
                    ].map((step, i) => (
                      <div
                        key={step.id}
                        className="rounded-xl p-3 text-center sm:text-left"
                        style={{ background: i === 4 ? "rgba(37,192,210,0.1)" : "rgba(62,128,204,0.05)", border: "1px solid rgba(62,128,204,0.18)" }}
                      >
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          <div
                            className="w-10 h-10 grid place-items-center rounded-lg text-[12px] font-semibold"
                            style={{
                              border: "1px solid rgba(62,128,204,0.25)",
                              background: i === 4 ? "linear-gradient(135deg, rgba(37,192,210,0.22), rgba(62,128,204,0.2))" : "rgba(255,255,255,0.92)",
                              color: "var(--ox-fg-dark)",
                            }}
                          >
                            {step.id}
                          </div>
                          {i < 4 && (
                            <span className="sm:hidden text-[11px]" style={{ color: "var(--ox-muted)" }}>
                              ↓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: "var(--ox-indigo)" }}>
                          {step.title}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: "var(--ox-muted)" }}>
                          {step.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────── */}
      <section className="ox-hairline ox-section" style={{ background: "var(--ox-bg-dark)" }}>
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal>
            <div
              className="relative rounded-3xl overflow-hidden p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12"
              style={{ background: "linear-gradient(135deg, var(--ox-indigo), var(--ox-blue))" }}
            >
              {/* Glow */}
              <div
                className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(37,192,210,0.25), transparent 70%)", transform: "translate(30%, -30%)" }}
              />

              <div className="z-10 text-white text-center md:text-left">
                <div className="ox-label mb-4">
                  <span className="ox-dot" />
                  Ready to elevate?
                </div>
                <h3
                  className="font-outfit font-bold leading-tight tracking-[-0.03em]"
                  style={{ fontSize: "clamp(30px, 4vw, 48px)" }}
                >
                  Join the elite pool of<br />
                  Olynixx certified coaches.
                </h3>
              </div>

              <div className="z-10 flex flex-col gap-3 w-full sm:w-auto">
                <Link
                  href="/certification"
                  className="ox-cta inline-flex items-center justify-center h-12 rounded-full px-8 text-[15px] font-semibold whitespace-nowrap"
                >
                  Start your certification →
                </Link>
                <p className="text-center text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Study online. Self‑paced.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
