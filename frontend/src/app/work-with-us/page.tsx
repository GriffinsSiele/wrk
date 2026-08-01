"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import Link from "next/link";

const traits = [
  {
    title: "Qualified already",
    desc: "Coaches, trainers, nutritionists and health professionals with a qualification we can build on, not replace.",
  },
  {
    title: "Tired of hoping",
    desc: "You have watched a sound programme fail on a committed client, and had nothing to say about why. You would rather know.",
  },
  {
    title: "Body first, plan second",
    desc: "You understand the inversion: the body is the thing to control, and the plan is the instrument.",
  },
  {
    title: "Ready to specialise",
    desc: "You want an assessed credential that sits on top of what you hold, and a path into the trusted pool.",
  },
];

const benefits = [
  {
    title: "Specialisation, not replacement",
    desc: "This specialisation sits on top of a qualification you already hold. We don't replace your certification. We specialise it.",
  },
  {
    title: "Join the pool",
    desc: "Certified specialists enter the trusted pool; placements span corporate programmes, health projects, sport, and partner facilities across the UAE.",
  },
  {
    title: "Dual-gate standard",
    desc: "Written examination and observed practical assessment, marked against published criteria, before placement eligibility.",
  },
  {
    title: "Placed where it matters",
    desc: "Learn. Certify. Deploy. Earn the specialisation, join the pool, and get placed where performance matters.",
  },
];

export default function WorkWithUsPage() {
  return (<div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "140px 24px 72px", background: "var(--ink)", color: "var(--cream)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
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
              Join the pool
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,5.5vw,3.75rem)", fontWeight: 500, lineHeight: 1.1, margin: "18px 0 20px" }}>
              Earn the specialisation.<br />Join the pool. Get placed.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="font-body italic" style={{ fontSize: "1.15rem", color: "rgba(242,237,227,0.7)", lineHeight: 1.7, marginBottom: 20 }}>
              We don&apos;t replace your certification. We specialise it.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 36 }}>
              <Link href="/contact" className="ox-cta" style={{ padding: "14px 32px", display: "inline-block", textDecoration: "none", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Request access
              </Link>
              <Link
                href="/certification"
                className="font-display"
                style={{
                  padding: "14px 28px",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(242,237,227,0.45)",
                  color: "var(--cream)",
                  borderRadius: 2,
                }}
              >
                View pathway
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: "72px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <ScrollReveal>
          <h2 className="font-display" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 500, textAlign: "center", marginBottom: 48 }}>
            Who we&apos;re looking for
          </h2>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 28 }}>
          {traits.map((t, i) => (<ScrollReveal key={t.title} delay={i * 70}>
              <div style={{ paddingTop: 16, borderTop: "1px solid rgba(150,118,43,0.35)" }}>
                <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 500, marginBottom: 10, color: "var(--teal)" }}>
                  {t.title}
                </h3>
                <p className="font-body" style={{ color: "rgba(12,15,18,0.62)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {t.desc}
                </p>
              </div>
            </ScrollReveal>))}
        </div>
      </section>

      <section style={{ padding: "24px 24px 96px", maxWidth: 1000, margin: "0 auto" }}>
        <ScrollReveal>
          <h2 className="font-display" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 500, textAlign: "center", marginBottom: 48 }}>
            What you get
          </h2>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 1, background: "rgba(150,118,43,0.35)" }}>
          {benefits.map((b, i) => (<ScrollReveal key={b.title} delay={i * 70}>
              <div style={{ padding: "28px 24px", background: "var(--cream)", height: "100%" }}>
                <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 500, marginBottom: 10, color: "var(--ink)" }}>
                  {b.title}
                </h3>
                <p className="font-body" style={{ color: "rgba(12,15,18,0.62)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {b.desc}
                </p>
              </div>
            </ScrollReveal>))}
        </div>
      </section>

      <Footer />
    </div>);
}
