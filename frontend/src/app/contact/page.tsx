"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";
import { CONTACT_FAQS } from "@/lib/contact-faqs";

const faqs = CONTACT_FAQS;

const fieldStyle = {
  width: "100%",
  background: "var(--ox-input-bg)",
  border: "1px solid rgba(150,118,43,0.4)",
  borderRadius: 2,
  padding: "12px 16px",
  color: "var(--ink)",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block" as const,
  fontSize: 11,
  color: "var(--ochre)",
  marginBottom: 6,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
};

export default function ContactPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    phone: "",
    message: "",
  });
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

  return (
    <div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <section
        style={{
          position: "relative",
          padding: "140px 24px 80px",
          background: "var(--ink)",
          color: "var(--cream)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(27,122,107,0.28) 0%, transparent 55%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <ScrollReveal>
            <BrandMark variant="midnight" size={56} />
          </ScrollReveal>
          <ScrollReveal delay={80}>
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
              Contact
            </p>
          </ScrollReveal>
          <ScrollReveal delay={140}>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.4rem,5.5vw,3.5rem)",
                fontWeight: 500,
                lineHeight: 1.1,
                margin: "18px 0 20px",
              }}
            >
              Questions, answered precisely.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p
              className="font-body"
              style={{
                fontSize: "1.1rem",
                color: "rgba(242,237,227,0.68)",
                lineHeight: 1.7,
                maxWidth: 480,
                margin: "0 auto 32px",
              }}
            >
              Browse the FAQ, send a message, or email us directly. We respond within one business day.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={260}>
            <Strapline deployTone="cream" size="sm" />
          </ScrollReveal>
        </div>
      </section>

      {/* Channels */}
      <section style={{ padding: "56px 24px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 1,
            background: "rgba(150,118,43,0.35)",
          }}
        >
          {[
            {
              title: "General",
              body: "hello@olynixx.com",
              href: "mailto:hello@olynixx.com",
              note: "Learners, coaches, and general enquiries",
            },
            {
              title: "Organisations",
              body: "Partner programmes",
              href: "/organisations",
              note: "Deploy specialists into your programmes",
            },
            {
              title: "Join the pool",
              body: "Become a specialist",
              href: "/work-with-us",
              note: "Specialise and get placed",
            },
          ].map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 60}>
              <div style={{ padding: "28px 24px", background: "var(--cream)", height: "100%" }}>
                <p
                  className="font-display"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ochre)",
                    marginBottom: 12,
                  }}
                >
                  {c.title}
                </p>
                <Link
                  href={c.href}
                  className="font-display"
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 500,
                    color: "var(--teal)",
                    textDecoration: "none",
                    display: "inline-block",
                    marginBottom: 8,
                  }}
                >
                  {c.body}
                </Link>
                <p className="font-body" style={{ color: "rgba(12,15,18,0.55)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {c.note}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "64px 24px 40px", maxWidth: 760, margin: "0 auto" }}>
        <ScrollReveal>
          <KhatamDivider className="mb-10" />
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem,3vw,2.1rem)",
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Frequently asked
          </h2>
          <p
            className="font-body"
            style={{
              textAlign: "center",
              color: "rgba(12,15,18,0.55)",
              marginBottom: 40,
              fontSize: "0.98rem",
            }}
          >
            Precise answers. No breathless claims.
          </p>
        </ScrollReveal>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <ScrollReveal key={faq.q} delay={Math.min(i * 40, 200)}>
                <div style={{ borderTop: "1px solid rgba(150,118,43,0.35)" }}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 20,
                      padding: "22px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      className="font-display"
                      style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--ink)", lineHeight: 1.35 }}
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
                  {isOpen && (
                    <p
                      className="font-body"
                      style={{
                        padding: "0 0 24px",
                        color: "rgba(12,15,18,0.62)",
                        fontSize: "0.98rem",
                        lineHeight: 1.75,
                        maxWidth: 640,
                      }}
                    >
                      {faq.a}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
          <div style={{ borderTop: "1px solid rgba(150,118,43,0.35)" }} />
        </div>
      </section>

      {/* Form */}
      <section
        style={{
          padding: "56px 24px 96px",
          background: "rgba(13,59,62,0.04)",
          borderTop: "1px solid rgba(150,118,43,0.28)",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <ScrollReveal>
            <h2
              className="font-display"
              style={{ fontSize: "clamp(1.5rem,3vw,1.9rem)", fontWeight: 500, textAlign: "center", marginBottom: 8 }}
            >
              Send a message
            </h2>
            <p
              className="font-body"
              style={{
                color: "rgba(12,15,18,0.55)",
                textAlign: "center",
                marginBottom: 36,
                fontSize: "0.98rem",
              }}
            >
              We&apos;ll reply within one business day.
            </p>
          </ScrollReveal>

          {status === "sent" ? (
            <ScrollReveal>
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 28px",
                  border: "1px solid rgba(150,118,43,0.4)",
                  background: "var(--cream)",
                }}
              >
                <h3 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 500, marginBottom: 10, color: "var(--teal)" }}>
                  Message received
                </h3>
                <p className="font-body" style={{ color: "rgba(12,15,18,0.55)", marginBottom: 24 }}>
                  Thank you. We&apos;ll be in touch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="ox-ghost"
                  style={{ padding: "10px 20px", fontSize: 13, cursor: "pointer", background: "transparent" }}
                >
                  Send another
                </button>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={80}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { id: "name", label: "Full name", type: "text", placeholder: "Jane Smith", required: true },
                  { id: "email", label: "Email", type: "email", placeholder: "jane@company.com", required: true },
                  { id: "organisation", label: "Organisation (optional)", type: "text", placeholder: "Your organisation", required: false },
                  { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "+971 …", required: false },
                ].map((f) => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="font-display" style={labelStyle}>
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      required={f.required}
                      value={(form as Record<string, string>)[f.id]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                      className="font-body"
                      style={fieldStyle}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" className="font-display" style={labelStyle}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    placeholder="How can we help?"
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="font-body"
                    style={{ ...fieldStyle, resize: "vertical", minHeight: 120 }}
                  />
                </div>
                {status === "error" && (
                  <p className="font-body" style={{ color: "var(--bronze)", fontSize: "0.9rem" }}>
                    Unable to send right now. Email us at{" "}
                    <a href="mailto:hello@olynixx.com" style={{ color: "var(--teal)" }}>
                      hello@olynixx.com
                    </a>
                    .
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="ox-cta"
                  style={{
                    padding: "14px 28px",
                    fontSize: 13,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: status === "sending" ? "wait" : "pointer",
                    border: "none",
                    marginTop: 8,
                  }}
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            </ScrollReveal>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
