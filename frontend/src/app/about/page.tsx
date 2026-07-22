"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  AnimatedBarChart,
  DonutChart,
  MultiSegmentDonut,
} from "@/components/ui/Charts";

const VALUES = [
  {
    title: "Evidence over noise",
    body: "Programmes are built from applied practice—not content volume. Every module should survive contact with a real athlete, session, or clinic floor.",
  },
  {
    title: "Dual-gate integrity",
    body: "Written knowledge and demonstrated practice are both required. A badge without either gate is marketing, not specialisation.",
  },
  {
    title: "Regional reality",
    body: "GCC schedules, facilities, languages, and performance cultures shape how Praxis is taught, assessed, and deployed.",
  },
  {
    title: "Deployment, not just diplomas",
    body: "Certification is the midpoint. The product is a coach who can be trusted in a live performance environment.",
  },
];

const AUDIENCES = [
  {
    title: "Aspiring specialists",
    body: "Coaches who want a clear path from general practice into a recognised specialisation—with proof, not just hours logged.",
  },
  {
    title: "Working practitioners",
    body: "Professionals already in the field who need structured depth, assessment, and a credential that holds under scrutiny.",
  },
  {
    title: "Organisations",
    body: "Clubs, academies, and high-performance units that need a reliable pipeline of specialists they can deploy with confidence.",
  },
];

const DISCIPLINE_MIX = [
  { label: "Strength & conditioning", value: 28, color: "var(--ox-accent)" },
  { label: "Rehab & return-to-play", value: 22, color: "var(--mint)" },
  { label: "Performance analysis", value: 18, color: "var(--ox-gold)" },
  { label: "Sport psychology", value: 16, color: "#c4a35a" },
  { label: "Nutrition & recovery", value: 16, color: "#7a9e8e" },
];

const PATHWAY_BARS = [
  { label: "Learn", value: 100 },
  { label: "Assess", value: 72 },
  { label: "Certify", value: 48 },
  { label: "Deploy", value: 28 },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--ox-cream)" }}>
      <Navbar />
      {/* Hero — one composition */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: "var(--ox-line)",
          background:
            "radial-gradient(ellipse 90% 70% at 12% -10%, rgba(150,118,43,0.14), transparent 55%), radial-gradient(ellipse 70% 55% at 100% 0%, rgba(42,161,135,0.1), transparent 50%), linear-gradient(180deg, #f7f1e6 0%, var(--ox-cream) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%231a1a18' stroke-width='0.6'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 pt-28 sm:pt-32 pb-10 sm:pb-12 text-center">
          <div className="flex justify-center">
            <BrandMark variant="transparent" size={64} priority />
          </div>
          <p
            className="mt-5 text-[11px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: "var(--ox-gold)" }}
          >
            About Praxis
          </p>
          <h1
            className="mt-3 font-display text-[clamp(2.35rem,6vw,3.75rem)] leading-[1.05] tracking-tight"
            style={{ color: "var(--ox-ink)" }}
          >
            Where trusted specialists are made
          </h1>
          <div className="mt-5 flex justify-center">
            <Strapline size="lg" />
          </div>
          <p
            className="mt-6 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "var(--ox-muted)", fontFamily: "var(--font-body)" }}
          >
            Olynixx Praxis is the specialisation layer for performance coaches—built to turn
            serious practitioners into people organisations can trust with athletes.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/certification"
              className="ox-cta inline-flex items-center h-12 px-8 text-[13px] tracking-[0.14em] uppercase"
            >
              Explore certification
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center h-12 px-8 text-[13px] tracking-[0.1em] uppercase font-display"
              style={{
                border: "1px solid rgba(150,118,43,0.55)",
                color: "var(--ox-ink)",
                borderRadius: 2,
              }}
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section
        className="py-6 sm:py-8"
        style={{ background: "var(--ink)", color: "var(--cream)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <ScrollReveal>
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              Why we exist
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl leading-tight">
              The industry has courses. It needs specialists.
            </h2>
            <p
              className="mt-3 text-base sm:text-lg leading-relaxed"
              style={{ color: "rgba(247,241,230,0.72)", fontFamily: "var(--font-body)" }}
            >
              Performance environments do not fail for lack of slideshows. They fail when
              credentials outrun competence. Praxis exists to close that gap: structured learning,
              dual-gate assessment, and a path into real deployment—so specialisation means
              something when the session starts.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Model + charts */}
      <section className="pt-6 sm:pt-8 pb-10 sm:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="text-center max-w-2xl mx-auto">
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              The Praxis model
            </p>
            <h2
              className="mt-2 font-display text-3xl sm:text-4xl leading-tight"
              style={{ color: "var(--ink)" }}
            >
              Learn. Certify. Deploy.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
              Three stages, one standard. Charts below are illustrative of how the pathway is
              designed—not live platform metrics.
            </p>
          </ScrollReveal>

          <div className="mt-6 grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <ScrollReveal>
              <div
                className="border p-6 sm:p-8"
                style={{
                  borderColor: "var(--ox-line)",
                  background: "linear-gradient(165deg, #fffefb 0%, var(--ox-cream) 100%)",
                  borderRadius: 2,
                }}
              >
                <h3 className="font-display text-xl" style={{ color: "var(--ox-ink)" }}>
                  Funnel of the pathway
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                  More people start learning than finish certification. Fewer still are ready for
                  deployment. That narrowing is intentional—quality over throughput.
                </p>
                <div className="mt-6">
                  <AnimatedBarChart data={PATHWAY_BARS} height={180} />
                </div>
                <p className="mt-4 text-[11px] tracking-wide" style={{ color: "var(--ox-muted)" }}>
                  Illustrative relative volume across stages
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div
                className="border p-6 sm:p-8"
                style={{
                  borderColor: "var(--ox-line)",
                  background: "linear-gradient(165deg, #fffefb 0%, var(--ox-cream) 100%)",
                  borderRadius: 2,
                }}
              >
                <h3 className="font-display text-xl" style={{ color: "var(--ox-ink)" }}>
                  Dual-gate standard
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                  Both gates must pass. Knowledge without practice is incomplete; practice without
                  knowledge is unsafe.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-6 place-items-center">
                  <div className="text-center">
                    <DonutChart
                      value={100}
                      sublabel="Written"
                      colors={["var(--ox-accent)"]}
                      size={132}
                    />
                    <p className="mt-3 text-sm font-medium" style={{ color: "var(--ox-ink)" }}>
                      Gate A — knowledge
                    </p>
                  </div>
                  <div className="text-center">
                    <DonutChart
                      value={100}
                      sublabel="Practice"
                      colors={["var(--mint)"]}
                      size={132}
                    />
                    <p className="mt-3 text-sm font-medium" style={{ color: "var(--ox-ink)" }}>
                      Gate B — demonstration
                    </p>
                  </div>
                </div>
                <p
                  className="mt-6 text-center text-sm font-medium"
                  style={{ color: "var(--ox-ink)" }}
                >
                  Certificate unlocks only when both gates are complete
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="flex justify-center py-2">
        <KhatamDivider />
      </div>

      {/* Discipline mix + capability curve */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <ScrollReveal>
              <p
                className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "var(--ox-gold)" }}
              >
                Specialisation breadth
              </p>
              <h2
                className="mt-3 font-display text-3xl sm:text-4xl leading-tight"
                style={{ color: "var(--ox-ink)" }}
              >
                Built across the performance stack
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                Praxis sits at the intersection of coaching craft and applied science. The mix
                below shows how we think about curriculum weight across core specialisation
                domains—not a live enrolment breakdown.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Strength, conditioning, and physical preparation",
                  "Rehab, return-to-play, and load management",
                  "Analysis, psychology, nutrition, and recovery",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed"
                    style={{ color: "var(--ox-muted)" }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--ox-gold)" }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={90}>
              <div
                className="border p-6 sm:p-8"
                style={{
                  borderColor: "var(--ox-line)",
                  background: "var(--ox-cream-deep, #f0e8d8)",
                  borderRadius: 2,
                }}
              >
                <MultiSegmentDonut
                  segments={DISCIPLINE_MIX}
                  size={200}
                  centerValue="5"
                  centerLabel="domains"
                />
                <p className="mt-4 text-center text-[11px]" style={{ color: "var(--ox-muted)" }}>
                  Illustrative curriculum emphasis
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="py-10 sm:py-12 border-y"
        style={{ borderColor: "var(--ox-line)", background: "var(--ox-cream-deep, #f0e8d8)" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="text-center max-w-2xl mx-auto">
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--ox-gold)" }}
            >
              What we stand for
            </p>
            <h2
              className="mt-3 font-display text-3xl sm:text-4xl"
              style={{ color: "var(--ox-ink)" }}
            >
              Principles that shape every programme
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid sm:grid-cols-2 gap-6 lg:gap-8">
            {VALUES.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 60}>
                <div className="flex gap-4">
                  <span
                    className="font-display text-2xl leading-none shrink-0"
                    style={{ color: "var(--ox-gold)" }}
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl" style={{ color: "var(--ox-ink)" }}>
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                      {v.body}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="text-center max-w-2xl mx-auto">
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--ox-gold)" }}
            >
              Who it&apos;s for
            </p>
            <h2
              className="mt-3 font-display text-3xl sm:text-4xl"
              style={{ color: "var(--ox-ink)" }}
            >
              Built for people who take the craft seriously
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {AUDIENCES.map((a, i) => (
              <ScrollReveal key={a.title} delay={i * 70}>
                <div className="text-center md:text-left">
                  <div
                    className="mx-auto md:mx-0 h-px w-10 mb-4"
                    style={{ background: "var(--ox-gold)" }}
                    aria-hidden
                  />
                  <h3 className="font-display text-xl" style={{ color: "var(--ox-ink)" }}>
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                    {a.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="pb-12 sm:pb-16 pt-2">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <ScrollReveal>
            <div className="flex justify-center mb-4">
              <KhatamDivider />
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl leading-tight"
              style={{ color: "var(--ox-ink)" }}
            >
              Ready to specialise with integrity?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ox-muted)" }}>
              See the certification path, or tell us what you&apos;re building—we&apos;ll help you
              find the right entry point.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/certification"
                className="ox-cta inline-flex items-center h-12 px-8 text-[13px] tracking-[0.14em] uppercase"
              >
                View certification
              </Link>
              <Link
                href="/standards"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--ox-ink)" }}
              >
                Read our standards →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <Footer />
    </div>
  );
}
