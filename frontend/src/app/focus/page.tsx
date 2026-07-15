"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";

const pillars = [
  {
    tag: "Pillar 01",
    title: "Human Readiness",
    subtitle: "Prepare the human, not just the athlete.",
    description:
      "Human Readiness is the foundation. It is the art and science of understanding a person's physiological, psychological, and social state before any physical demand is placed on them. Our certified coaches are trained to assess readiness signals — sleep quality, stress load, nutrition status, and emotional regulation — and to design sessions that meet people where they are, not where we expect them to be.",
    outcomes: [
      "Readiness screening protocols",
      "Sleep and recovery optimisation",
      "Stress resilience frameworks",
      "Pre-session physiological assessment",
    ],
    accent: "#25C0D2",
    number: "01",
  },
  {
    tag: "Pillar 02",
    title: "Recovery Intelligence",
    subtitle: "Recovery is training. Treat it that way.",
    description:
      "Elite performance is built in the recovery window, not the training session. Recovery Intelligence equips coaches to design and monitor recovery protocols that are evidence-based and individually calibrated. From cold and heat therapy to breathwork, neuromuscular techniques, and sleep architecture — our coaches understand that what happens between sessions defines what is possible in them.",
    outcomes: [
      "Active and passive recovery protocols",
      "Cold, heat, and contrast therapy",
      "Breathwork and nervous system regulation",
      "HRV monitoring and load management",
    ],
    accent: "#3E80CC",
    number: "02",
  },
  {
    tag: "Pillar 03",
    title: "Performance Intelligence",
    subtitle: "Turn data into decisions that move people forward.",
    description:
      "Performance Intelligence bridges science and coaching. It is the ability to read, interpret, and act on performance data — from subjective wellness questionnaires to wearable device outputs — to make smarter coaching decisions. Our coaches are trained to translate numbers into narratives, and narratives into programmes that deliver measurable, meaningful outcomes for individuals and organisations.",
    outcomes: [
      "Wearable data interpretation",
      "Wellness questionnaire design",
      "Periodisation and programming",
      "Performance reporting for organisations",
    ],
    accent: "#2E3C8E",
    number: "03",
  },
];


export default function FocusPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <ScrollReveal>
            <span className="ox-label"><span className="ox-dot" />What We Do</span>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>
              Three pillars.<br />One standard.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ fontSize: "1.2rem", color: "var(--ox-muted)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Olynixx Academy trains and certifies non-medical coaches in a science-backed framework built around three interconnected disciplines.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <Link href="/certification" className="ox-cta" style={{ padding: "14px 32px", display: "inline-block", textDecoration: "none" }}>
              See the certification path →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 1200, margin: "0 auto" }}>
        {pillars.map((pillar, i) => (
          <ScrollReveal key={pillar.number} delay={i * 100}>
            <div
              className="ox-card-dark"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 48,
                padding: "56px 48px",
                marginBottom: 32,
                borderLeft: `3px solid ${pillar.accent}`,
              }}
            >
              <div>
                <div style={{ fontSize: "5rem", fontWeight: 900, color: pillar.accent, opacity: 0.15, lineHeight: 1, marginBottom: 8 }}>{pillar.number}</div>
                <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: pillar.accent, fontWeight: 600 }}>{pillar.tag}</span>
                <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: "12px 0 8px" }}>{pillar.title}</h2>
                <p style={{ color: "var(--ox-muted)", fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.5 }}>{pillar.subtitle}</p>
              </div>
              <div>
                <p style={{ color: "var(--ox-fg-dark)", lineHeight: 1.8, marginBottom: 32, fontSize: "1rem" }}>{pillar.description}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                  {pillar.outcomes.map((o) => (
                    <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(62,128,204,0.08)", borderRadius: 8, border: "1px solid var(--ox-line)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: pillar.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--ox-fg-dark)" }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: "56px 24px 84px", textAlign: "center" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 16 }}>Ready to master all three?</h2>
          <p style={{ color: "var(--ox-muted)", marginBottom: 32 }}>Begin your journey toward becoming a certified Human Readiness Coach.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/certification" className="ox-cta" style={{ padding: "14px 32px", display: "inline-block", textDecoration: "none" }}>Get certified</Link>
            <Link href="/about" className="ox-ghost" style={{ padding: "14px 32px", display: "inline-block", textDecoration: "none" }}>Learn about us</Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
