"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { Award, BarChart2, BookOpen, Calendar, Globe, Video } from "react-feather";

const steps = [
  { num: "01", title: "Enrol", desc: "Create your learner account and enrol in the Level 1 certification course. Immediate access to all video modules and materials.", icon: BookOpen },
  { num: "02", title: "Study", desc: "Complete self-paced video modules across the three pillars — Human Readiness, Recovery Intelligence, and Performance Intelligence.", icon: Video },
  { num: "03", title: "Practise", desc: "Work through module quizzes and case studies. Track your progress in your learner dashboard.", icon: BarChart2 },
  { num: "04", title: "Book Online Exam", desc: "When ready, book your supervised online written exam and complete your timed digital attempt.", icon: Calendar },
  { num: "05", title: "Pass Written + Practical", desc: "Score 70%+ on the written exam and receive a practical assessment PASS. Both are required before certification.", icon: Award },
  { num: "06", title: "Join the Coach Pool", desc: "Your account upgrades to Coach automatically. Sign NDA and Code of Conduct to become placement-eligible for project dispatch.", icon: Globe },
];

const accreditations = [
  { name: "REPs UAE", detail: "Registered Exercise Professionals UAE" },
  { name: "ACE", detail: "American Council on Exercise" },
  { name: "NASM", detail: "National Academy of Sports Medicine" },
];

export default function CertificationPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <ScrollReveal>
            <span className="ox-label"><span className="ox-dot" />Certification Path</span>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>
              From learner<br />to certified coach.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ fontSize: "1.1rem", color: "var(--ox-muted)", lineHeight: 1.7, marginBottom: 40 }}>
              Olynixx Academy&apos;s Level 1 certification is recognised by leading industry bodies and designed for non-medical professionals who work with human performance.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <Link href="/login" className="ox-cta" style={{ padding: "16px 40px", display: "inline-block", textDecoration: "none", fontSize: "1rem" }}>
              Start your certification
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "56px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal>
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, marginBottom: 64 }}>Six steps to certification</h2>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {steps.map((s, i) => (
            <ScrollReveal key={s.num} delay={i * 80}>
              <div className="ox-card-dark" style={{ padding: "32px 28px", height: "100%" }}>
                <div style={{ marginBottom: 12, color: "var(--ox-accent)" }}>
                  <s.icon size={28} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ox-accent)", fontWeight: 700 }}>Step {s.num}</span>
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "var(--ox-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Accreditations */}
      <section style={{ padding: "56px 24px", textAlign: "center", borderTop: "1px solid var(--ox-line)" }}>
        <ScrollReveal>
          <span className="ox-label" style={{ justifyContent: "center", marginBottom: 24, display: "flex" }}><span className="ox-dot" />Recognised By</span>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginTop: 16 }}>
            {accreditations.map((a) => (
              <div key={a.name} className="ox-card-dark" style={{ padding: "24px 40px", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ox-accent)", marginBottom: 6 }}>{a.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--ox-muted)" }}>{a.detail}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ teaser */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 16 }}>Questions?</h2>
          <p style={{ color: "var(--ox-muted)", marginBottom: 32 }}>We have answered the most common ones. Or reach out directly.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/contact" className="ox-ghost" style={{ padding: "12px 28px", textDecoration: "none" }}>View FAQ</Link>
            <Link href="/login" className="ox-cta" style={{ padding: "12px 28px", textDecoration: "none" }}>Enrol now</Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
