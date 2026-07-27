"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle, Clock } from "react-feather";

type Certificate = {
  id: number;
  certification_level: string;
  issued_at: string;
  verification_code: string;
  status?: string;
  pdf_url?: string | null;
};

type Practical = {
  id: number;
  result: string;
  certification_level?: string;
  assessed_at?: string;
};

type GateStatus = {
  written_passed: boolean;
  has_practical_pass: boolean;
  has_certificate: boolean;
};

function statusLabel(status?: string) {
  const value = (status || "ACTIVE").toString().toUpperCase();
  if (value === "ACTIVE") return "Active";
  if (value === "REVOKED") return "Revoked";
  if (value === "EXPIRED") return "Expired";
  return value.replace(/_/g, " ");
}

export default function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [gates, setGates] = useState<GateStatus>({
    written_passed: false,
    has_practical_pass: false,
    has_certificate: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function copyVerificationCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(null);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setError("");
      try {
        const [certResp, practicalResp, dashResp] = await Promise.all([
          fetch("/api/proxy/certificates/me", { cache: "no-store" }),
          fetch("/api/proxy/compliance/practical-assessments/me", { cache: "no-store" }),
          fetch("/api/proxy/courses/my/dashboard", { cache: "no-store" }),
        ]);

        if (certResp.ok) {
          setCertificates(await certResp.json());
        } else {
          setError("Unable to load certificates");
        }

        if (practicalResp.ok) {
          setPracticals(await practicalResp.json());
        }

        if (dashResp.ok) {
          const dash = await dashResp.json();
          setGates({
            written_passed: Boolean(dash.written_passed),
            has_practical_pass: Boolean(dash.has_practical_pass),
            has_certificate: Boolean(dash.has_certificate),
          });
        }
      } catch {
        setError("Unable to load certificate status");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // OR dashboard flags with list endpoints so the UI stays correct if one source lags.
  const practicalPass = gates.has_practical_pass || practicals.some((p) => p.result === "PASS");
  const gateSteps = [
    {
      label: "Written exam",
      done: gates.written_passed,
      detail: gates.written_passed ? "Passed and approved" : "Book and pass the online written exam",
      href: "/learner/exam",
    },
    {
      label: "Practical assessment",
      done: practicalPass,
      detail: practicalPass ? "PASS recorded" : "Awaiting practical assessment PASS",
      href: "/learner/exam",
    },
    {
      label: "Certificate issued",
      done: gates.has_certificate || certificates.length > 0,
      detail:
        gates.has_certificate || certificates.length > 0
          ? "Certificate available below"
          : "Issues automatically after both gates",
      href: null,
    },
  ];

  return (
    <main className="max-w-5xl w-full mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--cream)", fontWeight: 500 }}>
          My certificates
        </h1>
        <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
          Certificates issue only after both written exam pass and practical assessment PASS.
        </p>
      </div>

      <section
        className="mb-6 p-5"
        style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
      >
        <p
          className="font-display text-[11px] tracking-[0.16em] uppercase mb-4"
          style={{ color: "var(--ochre)" }}
        >
          Dual-gate pathway
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {gateSteps.map((step) => (
            <div
              key={step.label}
              className="p-4"
              style={{
                border: `1px solid ${step.done ? "rgba(42,161,135,0.45)" : "rgba(150,118,43,0.35)"}`,
                background: step.done ? "rgba(42,161,135,0.1)" : "rgba(12,15,18,0.25)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {step.done ? (
                  <CheckCircle size={16} style={{ color: "var(--mint)" }} />
                ) : (
                  <Clock size={16} style={{ color: "var(--ochre)" }} />
                )}
                <span
                  className="font-display text-[12px] tracking-[0.12em] uppercase"
                  style={{ color: step.done ? "var(--mint)" : "var(--ochre)" }}
                >
                  {step.done ? "Complete" : "Pending"}
                </span>
              </div>
              <h2 className="font-display text-[15px] mb-1" style={{ color: "var(--cream)", fontWeight: 500 }}>
                {step.label}
              </h2>
              <p className="font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
                {step.detail}
              </p>
              {step.href && !step.done && (
                <Link href={step.href} className="inline-block mt-3 text-[13px]" style={{ color: "var(--gold)" }}>
                  Continue →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {practicals.length > 0 && (
        <section
          className="mb-6 p-5"
          style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
        >
          <p
            className="font-display text-[11px] tracking-[0.16em] uppercase mb-3"
            style={{ color: "var(--ochre)" }}
          >
            Practical assessment status
          </p>
          <div className="space-y-2">
            {practicals.slice(0, 5).map((p) => {
              const passed = p.result === "PASS";
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 text-[13px] font-body">
                  <span style={{ color: "var(--cream)" }}>
                    {p.certification_level || "Level 1"}
                    {p.assessed_at
                      ? ` · ${new Date(p.assessed_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </span>
                  <span
                    className="font-display text-[11px] tracking-[0.12em] uppercase"
                    style={{
                      color: passed ? "var(--mint)" : "var(--bronze)",
                      borderBottom: "1px solid rgba(150,118,43,0.55)",
                    }}
                  >
                    {p.result}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
          />
        </div>
      ) : error && certificates.length === 0 ? (
        <div
          className="p-8 text-center"
          style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
        >
          <p className="font-body text-[14px]" style={{ color: "var(--gold-bright)" }}>
            {error}
          </p>
        </div>
      ) : certificates.length === 0 ? (
        <div
          className="p-8 text-center"
          style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
        >
          <Award size={28} className="mx-auto mb-3" style={{ color: "var(--ochre)" }} />
          <h2 className="font-display text-xl mb-2" style={{ color: "var(--cream)", fontWeight: 500 }}>
            No certificates yet
          </h2>
          <p className="font-body text-[14px] mb-6 leading-relaxed max-w-md mx-auto" style={{ color: "var(--ox-muted)" }}>
            Complete your modules, pass the online written exam, and receive a practical assessment PASS to unlock
            automatic certificate issuance and coach pool entry.
          </p>
          <Link href="/learner/exam" className="ox-cta inline-flex items-center h-10 px-6 text-[13px] font-semibold">
            Go to exam
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const active = (cert.status || "ACTIVE").toString().toUpperCase() === "ACTIVE";
            return (
              <article
                key={cert.id}
                style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
              >
                <div className="h-1.5 w-full" style={{ background: "var(--gold)" }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span
                        className="inline-block font-display text-[11px] tracking-[0.16em] uppercase mb-2"
                        style={{
                          color: active ? "var(--mint)" : "var(--bronze)",
                          borderBottom: "1px solid rgba(150,118,43,0.55)",
                        }}
                      >
                        {statusLabel(cert.status)}
                      </span>
                      <h3 className="font-display text-lg leading-snug" style={{ color: "var(--cream)", fontWeight: 500 }}>
                        {cert.certification_level}
                      </h3>
                    </div>
                    <Award size={20} style={{ color: "var(--gold)" }} />
                  </div>

                  <div className="space-y-3 mb-5 font-body text-[13px]">
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "var(--ox-muted)" }}>Issue date</span>
                      <span style={{ color: "var(--cream)" }}>
                        {cert.issued_at
                          ? new Date(cert.issued_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 items-center">
                      <span style={{ color: "var(--ox-muted)" }}>Verification</span>
                      <span
                        className="font-mono text-[12px] px-2 py-0.5"
                        style={{
                          background: "rgba(217,172,74,0.12)",
                          color: "var(--gold)",
                          border: "1px solid rgba(150,118,43,0.35)",
                        }}
                      >
                        {cert.verification_code}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyVerificationCode(cert.verification_code)}
                      className="h-9 px-4 text-[12px] font-display inline-flex items-center"
                      style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
                    >
                      {copiedCode === cert.verification_code ? "Copied" : "Copy verification code"}
                    </button>
                    <a
                      href={`/api/proxy/certificates/${cert.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="ox-ghost-light h-9 px-4 text-[12px] font-medium inline-flex items-center"
                    >
                      View / download PDF
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
