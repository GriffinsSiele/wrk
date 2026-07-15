"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const scopeTable = [
  { area: "Readiness Assessment", inScope: "Sleep, stress, nutrition status, HRV-based readiness screening", outOfScope: "Clinical diagnosis, medical assessment, prescribing medication" },
  { area: "Recovery Protocols", inScope: "Cold/heat therapy, breathwork, active recovery, NMS techniques", outOfScope: "Physiotherapy treatment, medical rehabilitation, surgery" },
  { area: "Performance Planning", inScope: "Periodisation, wellness questionnaires, wearable data interpretation", outOfScope: "Sports medicine decisions, injury management, clinical psychology" },
  { area: "Client Interaction", inScope: "Coaching, education, behaviour change frameworks", outOfScope: "Medical advice, diagnosis, prescribing therapeutic interventions" },
];

const standards = [
  { code: "STD-01", title: "Evidence-Based Practice", desc: "All coaching recommendations must be grounded in peer-reviewed research or established best practice frameworks." },
  { code: "STD-02", title: "Scope of Practice", desc: "Coaches operate strictly within the non-medical scope defined in this document. Any concern requiring medical intervention is referred onward." },
  { code: "STD-03", title: "Client Confidentiality", desc: "All client data, wellness records, and assessment results are treated as strictly confidential in line with UAE PDPL." },
  { code: "STD-04", title: "Continuing Education", desc: "Certified coaches must complete a minimum of 20 CECs per year to maintain active certification status." },
  { code: "STD-05", title: "Professional Conduct", desc: "Coaches represent Olynixx Academy in every engagement. Unprofessional conduct may result in certification suspension or revocation." },
  { code: "STD-06", title: "Conflict of Interest", desc: "Coaches must disclose any financial or personal relationships that may influence their coaching recommendations." },
];


export default function StandardsPage() {
  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Header */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <ScrollReveal><span className="ox-label"><span className="ox-dot" />Official Document</span></ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>
              Standards &amp; Scope of Practice
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ color: "var(--ox-muted)", marginBottom: 8 }}>Version 1.0 &mdash; Effective from Q3 2025</p>
            <p style={{ fontSize: "1rem", color: "var(--ox-muted)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
              This document defines the professional standards, scope of practice, and code of conduct for all Olynixx Academy certified coaches.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Standards */}
      <section style={{ padding: "56px 24px", maxWidth: 900, margin: "0 auto" }}>
        <ScrollReveal><h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 32 }}>Professional Standards</h2></ScrollReveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {standards.map((s, i) => (
            <ScrollReveal key={s.code} delay={i * 60}>
              <div className="ox-card-dark" style={{ padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--ox-accent)", background: "rgba(37,192,210,0.1)", padding: "4px 10px", borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{s.code}</span>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ color: "var(--ox-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Scope Table */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 1000, margin: "0 auto", borderTop: "1px solid var(--ox-line)" }}>
        <ScrollReveal><h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 32 }}>Scope of Practice</h2></ScrollReveal>
        <ScrollReveal delay={100}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--ox-line)" }}>
                  {["Area", "Within Scope", "Outside Scope"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--ox-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scopeTable.map((row, i) => (
                  <tr key={row.area} style={{ borderBottom: "1px solid var(--ox-line)", background: i % 2 === 0 ? "rgba(62,128,204,0.06)" : "transparent" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--ox-accent)", whiteSpace: "nowrap" }}>{row.area}</td>
                    <td style={{ padding: "14px 16px", color: "var(--ox-fg-dark)", lineHeight: 1.5 }}>{row.inScope}</td>
                    <td style={{ padding: "14px 16px", color: "rgba(46,60,142,0.7)", lineHeight: 1.5 }}>{row.outOfScope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
