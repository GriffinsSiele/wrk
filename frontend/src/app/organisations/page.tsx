"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";

const offerings = [
  {
    title: "Corporate programmes",
    desc: "Certified specialists placed where performance matters within a clear non-medical scope of practice.",
  },
  {
    title: "Health projects",
    desc: "Specialists who measure capacity first, then set the input, screened, assessed, and referred when clinical patterns appear.",
  },
  {
    title: "Sport & partner facilities",
    desc: "Taught, tested, and vouched for. Assigned from the trusted pool through admin-reviewed dispatch across the UAE.",
  },
  {
    title: "Reporting",
    desc: "What was measured, what was decided and why, in a form a client, physician, employer or project partner can rely on.",
  },
];

export default function OrganisationsPage() {
  const [form, setForm] = useState({ name: "", email: "", organisation: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/proxy/leads/", {
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

  return (<div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "140px 24px 72px", background: "var(--ink)", color: "var(--cream)", textAlign: "center" }}>
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
              Organisations
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,5.5vw,3.5rem)", fontWeight: 500, lineHeight: 1.1, margin: "18px 0 20px" }}>
              Every specialist we send has been taught, tested, and vouched for.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="font-body" style={{ fontSize: "1.1rem", color: "rgba(242,237,227,0.68)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 28px" }}>
              The trusted pool. Certified specialists placed into corporate programmes, health projects, sport, and
              partner facilities across the UAE, through admin-reviewed assignment.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: "72px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 28 }}>
          {offerings.map((o, i) => (<ScrollReveal key={o.title} delay={i * 70}>
              <div style={{ paddingTop: 16, borderTop: "1px solid rgba(150,118,43,0.35)" }}>
                <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 10, color: "var(--teal)" }}>
                  {o.title}
                </h3>
                <p className="font-body" style={{ color: "rgba(12,15,18,0.62)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {o.desc}
                </p>
              </div>
            </ScrollReveal>))}
        </div>
      </section>

      <section style={{ padding: "24px 24px 96px", maxWidth: 560, margin: "0 auto" }}>
        <ScrollReveal>
          <h2 className="font-display" style={{ fontSize: "1.75rem", fontWeight: 500, textAlign: "center", marginBottom: 8 }}>
            Start a conversation
          </h2>
          <p className="font-body" style={{ color: "rgba(12,15,18,0.55)", textAlign: "center", marginBottom: 40 }}>
            Tell us about your organisation and we&apos;ll respond promptly.
          </p>
        </ScrollReveal>
        {status === "sent" ? (<div style={{ textAlign: "center", padding: 40, border: "1px solid rgba(150,118,43,0.4)" }}>
            <h3 className="font-display" style={{ fontSize: "1.2rem", fontWeight: 500, marginBottom: 8 }}>Enquiry received</h3>
            <p className="font-body" style={{ color: "rgba(12,15,18,0.55)" }}>We&apos;ll be in touch shortly.</p>
          </div>) : (<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { id: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
              { id: "email", label: "Email", type: "email", placeholder: "jane@company.com" },
              { id: "organisation", label: "Organisation", type: "text", placeholder: "Your organisation" },
              { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "+971 …" },
            ].map((f) => (<div key={f.id}>
                <label htmlFor={f.id} className="font-display" style={{ display: "block", fontSize: 11, color: "var(--ochre)", marginBottom: 6, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  placeholder={f.placeholder}
                  required={f.id !== "phone"}
                  value={(form as Record<string, string>)[f.id]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                  className="font-body"
                  style={{ width: "100%", background: "var(--ox-input-bg)", border: "1px solid rgba(150,118,43,0.4)", borderRadius: 2, padding: "12px 16px", color: "var(--ink)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>))}
            <div>
              <label htmlFor="message" className="font-display" style={{ display: "block", fontSize: 11, color: "var(--ochre)", marginBottom: 6, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Team size, context, and what you need…"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="font-body"
                style={{ width: "100%", background: "var(--ox-input-bg)", border: "1px solid rgba(150,118,43,0.4)", borderRadius: 2, padding: "12px 16px", color: "var(--ink)", fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
            <button type="submit" className="ox-cta" disabled={status === "sending"} style={{ padding: "14px 32px", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              {status === "sending" ? "Sending…" : "Send enquiry"}
            </button>
            {status === "error" && (<p className="font-body" style={{ color: "var(--ochre)", textAlign: "center", fontSize: "0.9rem" }}>
                Something went wrong. Please try again.
              </p>)}
          </form>)}
      </section>

      <Footer />
    </div>);
}
