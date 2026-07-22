"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";
import Link from "next/link";

const pillars = [
  {
    num: "01",
    title: "Human Readiness",
    subtitle: "Prepare the human, not just the athlete.",
    description:
      "Understanding physiological, psychological, and social state before demand is placed. Coaches assess readiness signals — sleep, stress load, nutrition status, emotional regulation — and design sessions that meet people where they are.",
    outcomes: [
      "Readiness screening protocols",
      "Sleep and recovery optimisation",
      "Stress resilience frameworks",
      "Pre-session assessment",
    ],
  },
  {
    num: "02",
    title: "Recovery Intelligence",
    subtitle: "Recovery is training. Treat it that way.",
    description:
      "Elite performance is built in the recovery window. Coaches design evidence-based, individually calibrated recovery protocols — from contrast therapy to breathwork, neuromuscular techniques, and sleep architecture.",
    outcomes: [
      "Active and passive recovery protocols",
      "Cold, heat, and contrast therapy",
      "Nervous system regulation",
      "Load management fundamentals",
    ],
  },
  {
    num: "03",
    title: "Performance Intelligence",
    subtitle: "Turn observation into decisions that move people forward.",
    description:
      "The ability to interpret readiness and performance signals — subjective wellness and objective markers — and translate them into programmes that deliver measurable outcomes for individuals and organisations.",
    outcomes: [
      "Data interpretation for coaches",
      "Wellness questionnaire design",
      "Periodisation and programming",
      "Reporting for organisations",
    ],
  },
];

export default function FocusPage() {
  return (
    <div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "140px 24px 72px", background: "var(--ink)", color: "var(--cream)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <ScrollReveal>
            <BrandMark variant="midnight" size={56} />
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <p
              className="font-display"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--ochre)",
                margin: "28px 0 0",
              }}
            >
              Our Focus
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(2.4rem,5.5vw,3.75rem)", fontWeight: 500, lineHeight: 1.1, margin: "18px 0 20px" }}
            >
              Three disciplines.<br />One standard.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="font-body" style={{ fontSize: "1.15rem", color: "rgba(242,237,227,0.68)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 28px" }}>
              Olynixx Praxis trains and certifies non-medical coaches in a science-backed specialisation across readiness, recovery, and performance.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <Link href="/certification" className="ox-cta" style={{ padding: "14px 28px", display: "inline-block", textDecoration: "none", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 32 }}>
              View specialisations
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: "72px 24px 96px", maxWidth: 1000, margin: "0 auto" }}>
        {pillars.map((pillar, i) => (
          <ScrollReveal key={pillar.num} delay={i * 80}>
            <article style={{ padding: "48px 0", borderBottom: i < pillars.length - 1 ? "1px solid rgba(150,118,43,0.35)" : "none" }}>
              <div className="font-display" style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--ochre)", marginBottom: 16 }}>
                {pillar.num}
              </div>
              <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,3vw,2.1rem)", fontWeight: 500, color: "var(--teal)", marginBottom: 8 }}>
                {pillar.title}
              </h2>
              <p className="font-body italic" style={{ color: "var(--bronze)", marginBottom: 20, fontSize: "1.05rem" }}>
                {pillar.subtitle}
              </p>
              <p className="font-body" style={{ color: "rgba(12,15,18,0.65)", lineHeight: 1.75, maxWidth: 640, marginBottom: 28 }}>
                {pillar.description}
              </p>
              <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
                {pillar.outcomes.map((o) => (
                  <li key={o} className="font-body" style={{ fontSize: 14, color: "rgba(12,15,18,0.7)", paddingLeft: 14, borderLeft: "2px solid var(--bronze)" }}>
                    {o}
                  </li>
                ))}
              </ul>
            </article>
          </ScrollReveal>
        ))}
        <KhatamDivider className="mt-16" />
      </section>

      <Footer />
    </div>
  );
}
