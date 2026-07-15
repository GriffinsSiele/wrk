"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const faqs = [
  { q: "Who is the Level 1 certification for?", a: "The certification is designed for non-medical professionals — personal trainers, strength and conditioning coaches, sport coaches, occupational health practitioners, and corporate wellbeing leads who want to elevate their practice with a recognised, science-backed credential." },
  { q: "How long does the course take?", a: "The course is self-paced. Most learners complete all modules within 6–8 weeks studying 3–5 hours per week. You can take as long as you need before booking your exam." },
  { q: "What is the exam format?", a: "Certification uses a dual gate: a supervised online written exam (multiple-choice, 60 minutes, 70% pass mark, max 3 attempts) plus a practical assessment scored PASS/FAIL by an assessor." },
  { q: "Is the certification recognised internationally?", a: "Yes. The Olynixx Level 1 certification is aligned with REPs UAE, ACE, and NASM frameworks. We are in active dialogue with additional accreditation bodies for global recognition." },
  { q: "What happens after I pass?", a: "Once both the written exam and practical assessment are passed, your certificate is issued automatically, your account upgrades to Coach, and you can sign mandatory agreements (NDA + Code of Conduct) to become placement-eligible for project dispatch." },
  { q: "Can organisations enrol multiple learners?", a: "Yes. We offer group enrolment and bespoke corporate packages. Use the contact form or visit the For Organisations page to start a conversation." },
  { q: "What is the CECs requirement to maintain certification?", a: "Certified coaches must complete a minimum of 20 Continuing Education Credits (CECs) per year to maintain active status. CECs can be earned through Olynixx-approved workshops, courses, and events." },
];

export default function ContactPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <ScrollReveal><span className="ox-label"><span className="ox-dot" />Contact &amp; FAQ</span></ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>We&apos;re here to help.</h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ fontSize: "1.1rem", color: "var(--ox-muted)", lineHeight: 1.7 }}>Browse the frequently asked questions below, or reach out directly.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: "56px 24px", maxWidth: 800, margin: "0 auto" }}>
        <ScrollReveal><h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 32 }}>Frequently Asked Questions</h2></ScrollReveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 50}>
              <div
                className="ox-card-dark"
                style={{ overflow: "hidden", cursor: "pointer" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{faq.q}</span>
                  <span style={{ color: "var(--ox-accent)", fontSize: "1.2rem", flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </div>
                {open === i && (
                  <div style={{ padding: "0 24px 20px", color: "var(--ox-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 700, margin: "0 auto", textAlign: "center", borderTop: "1px solid var(--ox-line)" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 16 }}>Still have questions?</h2>
          <p style={{ color: "var(--ox-muted)", marginBottom: 32 }}>Email us directly and we will respond within one business day.</p>
          <a href="mailto:hello@olynixx.com" className="ox-cta" style={{ padding: "14px 40px", display: "inline-block", textDecoration: "none", fontSize: "1rem" }}>hello@olynixx.com</a>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
