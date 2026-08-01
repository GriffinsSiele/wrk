"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";
import { DonutChart } from "@/components/ui/Charts";
import { CONTACT_FAQS } from "@/lib/contact-faqs";

const STEPS = [
  {
    num: "01",
    title: "Enrol",
    desc: "Create your learner account and enrol in the specialisation pathway. Access modules and materials.",
  },
  {
    num: "02",
    title: "Study",
    desc: "Complete self-paced modules across Human Readiness, Recovery, and Performance Intelligence.",
  },
  {
    num: "03",
    title: "Practise",
    desc: "Work through module quizzes and case studies. Track progress in your learner dashboard.",
  },
  {
    num: "04",
    title: "Written exam",
    desc: "Book and complete your supervised online written assessment when ready (timed MCQ, 70% pass mark).",
  },
  {
    num: "05",
    title: "Practical PASS",
    desc: "Receive a practical assessment PASS from an assessor. Written pass and practical PASS are both required.",
  },
  {
    num: "06",
    title: "Join the pool",
    desc: "Certificate issues, your account can upgrade to Coach, and you sign agreements to become placement-eligible.",
  },
];

const AUDIENCE = [
  {
    title: "Built for",
    body: "Coaches, trainers, nutritionists and health professionals who have run out of road with the plan they were taught to write, and who would rather know than hope.",
  },
  {
    title: "Not a replacement",
    body: "This specialisation sits on top of a qualification you already hold rather than replacing it. You do not need another method. You need to know who it will work on, and when.",
  },
  {
    title: "Pace & effort",
    body: "Self-paced. Most learners finish modules in 6–8 weeks at 3–5 hours per week. Book the exam when you’re ready.",
  },
];

const DISCIPLINES = [
  {
    num: "01",
    title: "Human Readiness",
    desc: "Readiness is a dynamic physiological state, the capacity a body has, at this moment, to answer what is being asked of it. Coaches learn to establish a baseline, read change against it, and set the input to what the reading shows rather than to what the plan says.",
  },
  {
    num: "02",
    title: "Recovery",
    desc: "The systems do not recover together. Coaches learn to read four connected systems (Physical, Mental, Metabolic, Hormonal) each against that person’s own baseline. Find the limiting system. Set the load to it, or wait. Where a pattern suggests something clinical, refer.",
  },
  {
    num: "03",
    title: "Performance Intelligence",
    desc: "Measurement is only useful if it changes a decision. Coaches learn to compare a person against themselves, tell a trend from a bad night, and write it down (what was measured, what was decided and why) in a form a client, physician, employer or project partner can rely on.",
  },
];

const OUTCOMES = [
  {
    title: "Certificate",
    body: "Issued only when both gates are complete, written knowledge and demonstrated practice.",
  },
  {
    title: "Coach upgrade",
    body: "Your account can move into the coach track so you’re ready for professional agreements.",
  },
  {
    title: "Placement eligibility",
    body: "Sign NDA + Code of Conduct to join the trusted pool for project dispatch.",
  },
  {
    title: "Stay active",
    body: "Maintain certification with a minimum of 20 CECs per year through Olynixx-approved learning.",
  },
];

export default function CertificationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (<div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          padding: "140px 24px 72px",
          background: "var(--ink)",
          color: "var(--cream)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
              Specialisations
            </p>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.4rem,5.5vw,3.75rem)",
                fontWeight: 500,
                lineHeight: 1.1,
                margin: "18px 0 20px",
              }}
            >
              We don&apos;t replace your certification.
              <br />
              We specialise it.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={180}>
            <p
              className="font-body"
              style={{
                fontSize: "1.1rem",
                color: "rgba(242,237,227,0.68)",
                lineHeight: 1.7,
                maxWidth: 540,
                margin: "0 auto 28px",
              }}
            >
              A dual-gate pathway of written examination and observed practical assessment, before you
              join the trusted pool.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={220}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
          <ScrollReveal delay={260}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
                marginTop: 36,
              }}
            >
              <Link
                href="/contact"
                className="ox-cta"
                style={{
                  padding: "14px 32px",
                  display: "inline-block",
                  textDecoration: "none",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Request access
              </Link>
              <Link
                href="/login"
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
                Sign in
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Who it's for */}
      <section style={{ padding: "56px 24px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <ScrollReveal className="text-center mx-auto max-w-2xl">
          <p className="ox-label mb-4">Who it&apos;s for</p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 500,
              marginBottom: 12,
            }}
          >
            Specialisation for serious practitioners
          </h2>
          <p
            className="font-body"
            style={{ color: "rgba(12,15,18,0.58)", fontSize: "1rem", lineHeight: 1.7 }}
          >
            Level 1 is built for people who already practise, and want a credential that holds under
            scrutiny.
          </p>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 28,
            marginTop: 40,
          }}
        >
          {AUDIENCE.map((item, i) => (<ScrollReveal key={item.title} delay={i * 60}>
              <div>
                <div
                  style={{
                    width: 40,
                    height: 1,
                    background: "var(--gold)",
                    marginBottom: 16,
                  }}
                  aria-hidden
                />
                <h3
                  className="font-display"
                  style={{ fontSize: "1.15rem", fontWeight: 500, color: "var(--teal)", marginBottom: 10 }}
                >
                  {item.title}
                </h3>
                <p
                  className="font-body"
                  style={{ color: "rgba(12,15,18,0.62)", lineHeight: 1.7, fontSize: "0.95rem" }}
                >
                  {item.body}
                </p>
              </div>
            </ScrollReveal>))}
        </div>
      </section>

      {/* Dual gate */}
      <section
        style={{
          padding: "48px 24px",
          background: "var(--ink)",
          color: "var(--cream)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <ScrollReveal className="text-center mx-auto max-w-2xl">
            <p
              className="font-display"
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ochre)",
                marginBottom: 16,
              }}
            >
              Dual-gate standard
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.6rem,3vw,2.2rem)",
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Knowledge and practice. Both required.
            </h2>
            <p
              className="font-body"
              style={{
                color: "rgba(242,237,227,0.65)",
                fontSize: "1rem",
                lineHeight: 1.7,
                marginBottom: 36,
              }}
            >
              A badge without either gate is marketing, not specialisation. Certificate unlocks only
              when both gates pass.
            </p>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 20,
              marginBottom: 28,
              alignItems: "stretch",
            }}
          >
            <ScrollReveal className="h-full">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "28px 20px",
                  background: "var(--cream)",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <DonutChart
                    value={100}
                    sublabel="Written"
                    colors={["var(--gold)"]}
                    size={128}
                  />
                </div>
                <p
                  className="font-display"
                  style={{ marginTop: 14, fontSize: "1rem", fontWeight: 500, color: "var(--ink)" }}
                >
                  Gate A: knowledge
                </p>
                <p
                  className="font-body"
                  style={{
                    marginTop: 6,
                    fontSize: "0.88rem",
                    color: "rgba(12,15,18,0.55)",
                    maxWidth: 240,
                    marginLeft: "auto",
                    marginRight: "auto",
                    flex: 1,
                  }}
                >
                  Supervised online MCQ · timed · 70% pass mark
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal className="h-full" delay={80}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "28px 20px",
                  background: "var(--cream)",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <DonutChart
                    value={100}
                    sublabel="Practice"
                    colors={["var(--mint)"]}
                    size={128}
                  />
                </div>
                <p
                  className="font-display"
                  style={{ marginTop: 14, fontSize: "1rem", fontWeight: 500, color: "var(--ink)" }}
                >
                  Gate B: demonstration
                </p>
                <p
                  className="font-body"
                  style={{
                    marginTop: 6,
                    fontSize: "0.88rem",
                    color: "rgba(12,15,18,0.55)",
                    maxWidth: 240,
                    marginLeft: "auto",
                    marginRight: "auto",
                    flex: 1,
                  }}
                >
                  Assessor-scored practical · PASS / FAIL
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <p
              className="font-body"
              style={{
                textAlign: "center",
                fontSize: "0.9rem",
                color: "rgba(242,237,227,0.5)",
              }}
            >
              Full scope and conduct expectations live in{" "}
              <Link href="/standards" style={{ color: "var(--gold)" }}>
                Standards &amp; Scope
              </Link>
              .
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Disciplines */}
      <section style={{ padding: "56px 24px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <ScrollReveal className="text-center mx-auto max-w-2xl">
          <p className="ox-label mb-4">Curriculum</p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 500,
              marginBottom: 12,
            }}
          >
            The three pillars
          </h2>
          <p
            className="font-body"
            style={{ color: "rgba(12,15,18,0.58)", fontSize: "1rem", lineHeight: 1.7 }}
          >
            Human Readiness, Recovery, and Performance Intelligence, the stack every Praxis
            specialist is expected to hold.
          </p>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 1,
            background: "rgba(150,118,43,0.35)",
            marginTop: 40,
          }}
        >
          {DISCIPLINES.map((d, i) => (<ScrollReveal key={d.num} delay={i * 70}>
              <div style={{ padding: "28px 24px", background: "var(--cream)", height: "100%" }}>
                <div
                  className="font-display"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: "var(--ochre)",
                    marginBottom: 12,
                  }}
                >
                  {d.num}
                </div>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--teal)", marginBottom: 10 }}
                >
                  {d.title}
                </h3>
                <p
                  className="font-body"
                  style={{ color: "rgba(12,15,18,0.62)", lineHeight: 1.7, fontSize: "0.95rem" }}
                >
                  {d.desc}
                </p>
              </div>
            </ScrollReveal>))}
        </div>

        <ScrollReveal>
          <p style={{ textAlign: "center", marginTop: 28 }}>
            <Link
              href="/focus"
              className="font-display"
              style={{
                fontSize: 13,
                letterSpacing: "0.08em",
                color: "var(--ink)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Explore Our Focus in depth →
            </Link>
          </p>
        </ScrollReveal>
      </section>

      {/* Six steps */}
      <section
        style={{
          padding: "48px 24px 56px",
          background: "var(--ox-cream-deep, #f0e8d8)",
          borderTop: "1px solid rgba(150,118,43,0.28)",
          borderBottom: "1px solid rgba(150,118,43,0.28)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <ScrollReveal className="text-center mx-auto max-w-2xl">
            <p className="ox-label mb-4">Pathway</p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.6rem,3vw,2.2rem)",
                fontWeight: 500,
                marginBottom: 40,
              }}
            >
              Six steps to the pool
            </h2>
          </ScrollReveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 1,
              background: "rgba(150,118,43,0.35)",
            }}
          >
            {STEPS.map((s, i) => (<ScrollReveal key={s.num} delay={i * 50}>
                <div style={{ padding: "28px 24px", height: "100%", background: "var(--cream)" }}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      color: "var(--ochre)",
                      marginBottom: 12,
                    }}
                  >
                    Step {s.num}
                  </div>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 500,
                      marginBottom: 10,
                      color: "var(--teal)",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="font-body"
                    style={{ color: "rgba(12,15,18,0.62)", lineHeight: 1.7, fontSize: "0.95rem" }}
                  >
                    {s.desc}
                  </p>
                </div>
              </ScrollReveal>))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section style={{ padding: "56px 24px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <ScrollReveal className="text-center mx-auto max-w-2xl">
          <p className="ox-label mb-4">After you pass</p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 500,
              marginBottom: 12,
            }}
          >
            Certification is the midpoint
          </h2>
          <p
            className="font-body"
            style={{ color: "rgba(12,15,18,0.58)", fontSize: "1rem", lineHeight: 1.7 }}
          >
            The product is a coach who can be trusted in a live performance environment, and
            dispatched with confidence.
          </p>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 28,
            marginTop: 40,
          }}
        >
          {OUTCOMES.map((o, i) => (<ScrollReveal key={o.title} delay={i * 50}>
              <div>
                <span
                  className="font-display"
                  style={{ color: "var(--gold)", fontSize: "1.25rem", display: "block", marginBottom: 10 }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 8, color: "var(--ink)" }}
                >
                  {o.title}
                </h3>
                <p
                  className="font-body"
                  style={{ color: "rgba(12,15,18,0.62)", lineHeight: 1.65, fontSize: "0.92rem" }}
                >
                  {o.body}
                </p>
              </div>
            </ScrollReveal>))}
        </div>

        <ScrollReveal>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
              marginTop: 36,
            }}
          >
            <Link
              href="/work-with-us"
              className="font-display"
              style={{
                fontSize: 13,
                letterSpacing: "0.06em",
                color: "var(--ink)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Join the pool →
            </Link>
            <Link
              href="/organisations"
              className="font-display"
              style={{
                fontSize: 13,
                letterSpacing: "0.06em",
                color: "var(--ink)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              For organisations →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section style={{ padding: "40px 24px 56px", maxWidth: 760, margin: "0 auto" }}>
        <ScrollReveal>
          <KhatamDivider className="mb-8" />
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem,3vw,2.1rem)",
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Frequently asked
          </h2>
          <p
            className="font-body"
            style={{
              textAlign: "center",
              color: "rgba(12,15,18,0.55)",
              marginBottom: 32,
              fontSize: "0.98rem",
            }}
          >
            Precise answers. No breathless claims.
          </p>
        </ScrollReveal>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {CONTACT_FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (<ScrollReveal key={faq.q} delay={Math.min(i * 40, 200)}>
                <div style={{ borderTop: "1px solid rgba(150,118,43,0.35)" }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 20,
                      padding: "20px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      className="font-display"
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 500,
                        color: "var(--ink)",
                        lineHeight: 1.35,
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      className="font-display"
                      aria-hidden
                      style={{
                        color: "var(--ochre)",
                        fontSize: "1.35rem",
                        flexShrink: 0,
                        lineHeight: 1,
                        transition: "transform 0.2s ease",
                        transform: isOpen ? "rotate(45deg)" : "none",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (<p
                      className="font-body"
                      style={{
                        padding: "0 0 20px",
                        color: "rgba(12,15,18,0.62)",
                        fontSize: "0.98rem",
                        lineHeight: 1.75,
                        maxWidth: 640,
                      }}
                    >
                      {faq.a}
                    </p>)}
                </div>
              </ScrollReveal>);
          })}
          <div style={{ borderTop: "1px solid rgba(150,118,43,0.35)" }} />
        </div>
      </section>

      {/* Closing */}
      <section
        style={{
          padding: "40px 24px 56px",
          background: "var(--teal-deep)",
          color: "var(--cream)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <ScrollReveal>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.5rem,3vw,2rem)",
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Ready to specialise?
            </h2>
            <p
              className="font-body italic"
              style={{
                fontSize: "1.05rem",
                color: "rgba(242,237,227,0.65)",
                marginBottom: 28,
              }}
            >
              Where trusted specialists are made.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/contact"
                className="ox-cta"
                style={{
                  padding: "12px 28px",
                  textDecoration: "none",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Request access
              </Link>
              <Link
                href="/login"
                className="font-display"
                style={{
                  padding: "12px 24px",
                  textDecoration: "none",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(242,237,227,0.45)",
                  color: "var(--cream)",
                  borderRadius: 2,
                }}
              >
                Sign in
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>);
}
