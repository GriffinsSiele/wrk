"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Activity, BarChart2, Briefcase, CheckCircle, Target } from "react-feather";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const offerings = [
  { icon: Activity, title: "Sport Team Programmes", desc: "Readiness screening and recovery protocols for professional and amateur sport teams. Reduce injury rates, extend athlete careers." },
  { icon: Briefcase, title: "Corporate Wellbeing", desc: "Science-backed wellness interventions for organisations. Reduce sick days, improve focus, and build a high-performing workforce." },
  { icon: Target, title: "High-Performance Camps", desc: "Immersive readiness and recovery experiences for executive teams, elite athletes, and high-performing individuals." },
  { icon: BarChart2, title: "Data-Driven Reporting", desc: "Quantified wellbeing metrics delivered as board-ready reports. Demonstrate ROI on your wellness investment." },
];

export default function OrganisationsPage() {
  const [form, setForm] = useState({ name: "", email: "", organisation: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", organisation: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ background: "var(--ox-bg-dark)", color: "var(--ox-fg-dark)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "128px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="ox-aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <ScrollReveal><span className="ox-label"><span className="ox-dot" />For Organisations</span></ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0 20px", letterSpacing: "-0.02em" }}>
              Your people are your<br />greatest asset.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p style={{ fontSize: "1.15rem", color: "rgba(62,128,204,0.7)", lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
              Olynixx deploys certified Human Readiness Coaches into corporate, sport, and community environments through admin-reviewed enquiry and assignment workflows.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Offerings */}
      <section style={{ padding: "56px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 24 }}>
          {offerings.map((o, i) => (
            <ScrollReveal key={o.title} delay={i * 80}>
              <div className="ox-card-dark" style={{ padding: "32px 24px" }}>
                <div style={{ marginBottom: 16, color: "var(--ox-accent)" }}>
                  <o.icon size={28} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 10 }}>{o.title}</h3>
                <p style={{ color: "var(--ox-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>{o.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Enquiry Form */}
      <section style={{ padding: "56px 24px 84px", maxWidth: 680, margin: "0 auto" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Start a conversation</h2>
          <p style={{ color: "var(--ox-muted)", textAlign: "center", marginBottom: 40 }}>Tell us about your organisation and we&apos;ll be in touch within 48 hours.</p>
        </ScrollReveal>
        {status === "sent" ? (
          <ScrollReveal>
            <div style={{ textAlign: "center", padding: 48, background: "rgba(37,192,210,0.08)", borderRadius: 16, border: "1px solid rgba(37,192,210,0.2)" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", color: "var(--ox-accent)" }}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Enquiry received</h3>
              <p style={{ color: "var(--ox-muted)" }}>We&apos;ll be in touch within 48 hours.</p>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={100}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
                { id: "email", label: "Email", type: "email", placeholder: "jane@company.com" },
                { id: "organisation", label: "Organisation", type: "text", placeholder: "Your company or team" },
                { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "+971 50 000 0000" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: "block", fontSize: "0.8rem", color: "var(--ox-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    placeholder={f.placeholder}
                    required={f.id !== "phone"}
                    value={(form as Record<string, string>)[f.id]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                    style={{ width: "100%", background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", borderRadius: 8, padding: "12px 16px", color: "var(--ox-fg-dark)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" style={{ display: "block", fontSize: "0.8rem", color: "var(--ox-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Message</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us about your organisation, team size, and what you're looking to achieve..."
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  style={{ width: "100%", background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", borderRadius: 8, padding: "12px 16px", color: "var(--ox-fg-dark)", fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              <button type="submit" className="ox-cta" disabled={status === "sending"} style={{ padding: "14px 32px", fontSize: "1rem", border: "none", cursor: "pointer" }}>
                {status === "sending" ? "Sending..." : "Send enquiry"}
              </button>
              {status === "error" && <p style={{ color: "var(--ox-blue)", textAlign: "center", fontSize: "0.9rem" }}>Something went wrong. Please try again.</p>}
            </form>
          </ScrollReveal>
        )}
      </section>

      <Footer />
    </div>
  );
}
