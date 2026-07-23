"use client";

import { useEffect, useState } from "react";

type Agreement = {
  id: number;
  agreement_type: string;
  version: string;
  signed_at?: string | null;
};

export default function CoachAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [placementEligible, setPlacementEligible] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [aResp, pResp] = await Promise.all([
      fetch("/api/proxy/compliance/agreements/me", { cache: "no-store" }),
      fetch("/api/proxy/coaches/me/profile", { cache: "no-store" }),
    ]);
    if (aResp.ok) setAgreements(await aResp.json());
    if (pResp.ok) {
      const data = await pResp.json();
      setPlacementEligible(Boolean(data?.coach_attributes?.placement_eligible));
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function sign(agreementType: string) {
    setMessage("");
    const resp = await fetch("/api/proxy/compliance/agreements/me/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agreement_type: agreementType, version: "1.0" }),
    });
    if (!resp.ok) {
      setMessage("Failed to sign agreement");
      return;
    }
    setMessage(`${agreementType.replaceAll("_", " ")} signed`);
    load();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-display text-3xl mb-2" style={{ fontWeight: 500 }}>Placement Agreements</h1>
        <p className="font-body text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
          Project assignment requires placement eligibility: active certificate + signed NDA and Code of Conduct.
        </p>

        <div
          className="rounded-sm p-4 mb-5 font-body text-[14px]"
          style={{
            background: "rgba(12,15,18,0.28)",
            border: "1px solid rgba(150,118,43,0.45)",
            color: "var(--ox-fg)",
          }}
        >
          Placement status:{" "}
          <strong style={{ color: placementEligible ? "var(--mint)" : "var(--ochre)" }}>
            {placementEligible ? "Eligible" : "Not eligible"}
          </strong>
        </div>

        <div className="space-y-3">
          {agreements.map((a) => (
            <div
              key={a.id}
              className="rounded-sm p-5 flex items-center justify-between gap-4"
              style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}
            >
              <div>
                <p className="font-semibold text-[15px]">{a.agreement_type.replaceAll("_", " ")}</p>
                <p className="font-body text-[12px] mt-1" style={{ color: "var(--ox-muted)" }}>
                  Version {a.version}
                  {a.signed_at ? ` · Signed ${new Date(a.signed_at).toLocaleString()}` : " · Awaiting signature"}
                </p>
              </div>
              {a.signed_at ? (
                <span
                  className="font-display text-[11px] tracking-[0.14em] uppercase"
                  style={{ color: "var(--mint)", borderBottom: "1px solid rgba(150,118,43,0.55)" }}
                >
                  Signed
                </span>
              ) : (
                <button
                  onClick={() => sign(a.agreement_type)}
                  className="ox-cta h-9 px-5 text-[13px] font-semibold"
                >
                  Sign
                </button>
              )}
            </div>
          ))}
        </div>
        {message && <p className="font-body text-sm mt-4" style={{ color: "var(--mint)" }}>{message}</p>}
    </main>
  );
}
