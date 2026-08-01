"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";
import Link from "next/link";

/** Pillar copy locked to About v3.0 FINAL, do not invent alternate slogans. */
const pillars = [
  {
    num: "01",
    title: "Human Readiness",
    lead: "Readiness is a dynamic physiological state, the capacity a body has, at this moment, to answer what is being asked of it.",
    paragraphs: [
      "A training session. A change of diet. A demanding week. It is not a fitness score, it is not a personality, and it is not fixed. It can be measured in minutes.",
      "Coaches learn to establish a baseline, read change against it, and set the input to what the reading shows rather than to what the plan says. The discipline is reading the trend, not the number.",
    ],
  },
  {
    num: "02",
    title: "Recovery",
    lead: "The systems do not recover together.",
    paragraphs: [
      "Muscular, nervous, hormonal, cardio-pulmonary and metabolic each run their own curve at their own rate, which is why the same person can be ready to train hard and in no condition to start a diet on the same morning. Assuming they recover in step is a guess, and it is the guess most plans are built on.",
      "Coaches learn to read four connected systems, each against that person’s own baseline:",
    ],
    strands: [
      {
        label: "Physical",
        body: "sleep quality and duration, autonomic balance, tissue load and accumulated volume.",
      },
      {
        label: "Mental",
        body: "brain energy, oxygenation, acid–base balance, hydration and sleep architecture. Measurable, not a matter of opinion.",
      },
      {
        label: "Metabolic",
        body: "fuelling, hydration, energy availability and the timing of intake against load and sleep.",
      },
      {
        label: "Hormonal",
        body: "the signalling that sets the ceiling on adaptation, read by pattern and trend rather than by blood work.",
      },
    ],
    closing:
      "Read the four. Find the limiting system. Set the load to it, or wait. Where a pattern suggests something clinical, refer.",
  },
  {
    num: "03",
    title: "Performance Intelligence",
    lead: "Measurement is only useful if it changes a decision.",
    paragraphs: [
      "The decision is rarely which method. It is whether this person should start it at all, and when.",
      "Coaches learn to run a baseline properly, to compare a person against themselves rather than against a population norm, and to tell a trend from a bad night.",
      "And they learn to write it down (what was measured, what was decided and why) in a form a client, a physician, an employer or a project partner can rely on. The report is the part the client keeps.",
    ],
  },
] as const;

export default function FocusPage() {
  return (<div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "128px 24px 48px", background: "var(--ink)", color: "var(--cream)" }}>
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
                margin: "24px 0 0",
              }}
            >
              The three pillars
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(2.4rem,5.5vw,3.75rem)", fontWeight: 500, lineHeight: 1.1, margin: "14px 0 16px" }}
            >
              What has to be true
              <br />
              before anything works.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p
              className="font-body"
              style={{
                fontSize: "1.15rem",
                color: "rgba(242,237,227,0.68)",
                lineHeight: 1.7,
                maxWidth: 540,
                margin: "0 auto 20px",
              }}
            >
              Conventional practice treats the plan as the thing to control. Olynixx Praxis teaches the inversion: the
              body is the thing to control, and the plan is the instrument.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <Link
              href="/certification"
              className="ox-cta"
              style={{
                padding: "14px 28px",
                display: "inline-block",
                textDecoration: "none",
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 24,
              }}
            >
              View specialisations
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: "40px 24px 56px", maxWidth: 720, margin: "0 auto" }}>
        {pillars.map((pillar, i) => (<ScrollReveal key={pillar.num} delay={i * 80}>
            <article
              style={{
                padding: "28px 0",
                borderBottom: i < pillars.length - 1 ? "1px solid rgba(150,118,43,0.35)" : "none",
              }}
            >
              <div
                className="font-display"
                style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--ochre)", marginBottom: 12 }}
              >
                {pillar.num}
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(1.6rem,3vw,2.1rem)",
                  fontWeight: 500,
                  color: "var(--teal)",
                  marginBottom: 12,
                }}
              >
                {pillar.title}
              </h2>
              <p
                className="font-body"
                style={{ color: "var(--ink)", lineHeight: 1.75, marginBottom: 12, fontSize: "1.05rem" }}
              >
                {pillar.lead}
              </p>
              {pillar.paragraphs.map((p) => (<p
                  key={p.slice(0, 40)}
                  className="font-body"
                  style={{ color: "rgba(12,15,18,0.65)", lineHeight: 1.75, marginBottom: 12 }}
                >
                  {p}
                </p>))}
              {"strands" in pillar && pillar.strands ? (<ul style={{ listStyle: "none", padding: 0, margin: "4px 0 12px" }}>
                  {pillar.strands.map((s) => (<li
                      key={s.label}
                      className="font-body"
                      style={{ color: "rgba(12,15,18,0.65)", lineHeight: 1.7, marginBottom: 8, paddingLeft: 14, borderLeft: "2px solid var(--bronze)" }}
                    >
                      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.label}</span>
                      {": "}
                      {s.body}
                    </li>))}
                </ul>) : null}
              {"closing" in pillar && pillar.closing ? (<p className="font-body" style={{ color: "rgba(12,15,18,0.65)", lineHeight: 1.75 }}>
                  {pillar.closing}
                </p>) : null}
            </article>
          </ScrollReveal>))}
        <KhatamDivider className="mt-8" />
      </section>

      <Footer />
    </div>);
}
