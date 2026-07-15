"use client";

import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";

interface Certificate {
  id: number;
  certification_level: string;
  issued_at: string;
  verification_code: string;
  status?: string;
  pdf_url?: string | null;
}

export default function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [practicals, setPracticals] = useState<{ id: number; result: string; certification_level?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certResp, practicalResp] = await Promise.all([
          fetch("/api/proxy/certificates/me", { cache: "no-store" }),
          fetch("/api/proxy/compliance/practical-assessments/me", { cache: "no-store" }),
        ]);
        if (certResp.ok) setCertificates(await certResp.json());
        if (practicalResp.ok) setPracticals(await practicalResp.json());
      } catch {
        /* API unavailable */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="max-w-6xl w-full mx-auto px-4 md:px-6 py-6">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="font-outfit font-bold text-3xl mb-1" style={{ color: "var(--ox-fg)" }}>
              My Certificates
            </h1>
            <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
              Certificates issue only after both written exam pass and practical assessment PASS.
            </p>
          </div>
        </ScrollReveal>

        {practicals.length > 0 && (
          <div className="mb-6 rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
            <p className="text-[12px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--ox-muted)" }}>
              Practical assessment status
            </p>
            {practicals.slice(0, 3).map((p) => (
              <p key={p.id} className="text-[13px]" style={{ color: "var(--ox-fg)" }}>
                {p.certification_level || "Level 1"} — <strong>{p.result}</strong>
              </p>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--ox-accent)", borderTopColor: "transparent" }}
            />
          </div>
        ) : certificates.length === 0 ? (
          <ScrollReveal>
            <GlassCard className="p-10 text-center max-w-lg mx-auto">
              <h2 className="font-outfit font-bold text-xl mb-2" style={{ color: "var(--ox-fg)" }}>
                No certificates yet
              </h2>
              <p className="text-[14px] mb-6 leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                Complete your courses, pass the online written exam, and receive a practical assessment PASS
                to unlock automatic certificate issuance and coach pool entry.
              </p>
              <a
                href="/learner/exam"
                className="ox-cta inline-flex items-center h-10 rounded-full px-6 text-[13px] font-semibold"
              >
                Book online exam
              </a>
            </GlassCard>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert, idx) => (
              <ScrollReveal key={cert.id} delay={idx * 80}>
                <GlassCard className="overflow-hidden">
                  <div
                    className="h-2 w-full"
                    style={{
                      background: "linear-gradient(90deg, var(--ox-accent), var(--ox-indigo), var(--ox-blue))",
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span
                          className="inline-block text-[11px] uppercase tracking-[0.2em] font-semibold mb-2"
                          style={{ color: "var(--ox-accent)" }}
                        >
                          {cert.status || "ACTIVE"}
                        </span>
                        <h3 className="font-outfit font-bold text-lg" style={{ color: "var(--ox-fg)" }}>
                          {cert.certification_level}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: "var(--ox-muted)" }}>Issue date</span>
                        <span className="font-medium" style={{ color: "var(--ox-fg)" }}>
                          {new Date(cert.issued_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: "var(--ox-muted)" }}>Verification</span>
                        <span
                          className="font-mono text-[12px] px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(37,192,210,0.08)",
                            color: "var(--ox-accent)",
                          }}
                        >
                          {cert.verification_code}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        )}
    </main>
  );
}
