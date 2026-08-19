"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [issuedToken, setIssuedToken] = useState("");

  async function requestToken(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const resp = await fetch("/api/proxy/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await resp.json().catch(() => ({}));
    setMessage(data.message || "Request submitted");
    if (data.reset_token) {
      setIssuedToken(data.reset_token);
      setToken(data.reset_token);
    }
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const resp = await fetch("/api/proxy/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setMessage(typeof data.detail === "string" ? data.detail : "Reset failed");
      return;
    }
    setMessage("Password updated. You can sign in.");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md space-y-6 p-6" style={{ border: "1px solid rgba(150,118,43,0.35)" }}>
        <div>
          <h1 className="font-display text-3xl" style={{ fontWeight: 500 }}>
            Reset password
          </h1>
          <p className="font-body text-[14px] mt-2" style={{ color: "var(--ox-muted)" }}>
            Works for learner, coach, and admin accounts. Request a reset token, then set a new password (at least 10 characters). On the demo stack the token is shown here. Production must deliver the token by email and must not print it in the response.
          </p>
        </div>
        {message && (
          <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--teal)" }}>
            {message}
          </p>
        )}
        {issuedToken && (
          <p className="font-body text-[12px] break-all" style={{ color: "var(--ox-muted)" }}>
            Dev token: {issuedToken}
          </p>
        )}
        <form onSubmit={requestToken} className="space-y-2">
          <label className="block font-display text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ochre)" }}>
            Email
          </label>
          <input
            type="email"
            required
            placeholder="you@olynixx.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 font-body text-sm"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}
          />
          <button type="submit" className="ox-ghost-light h-10 px-5 text-[13px] w-full">
            Request reset
          </button>
        </form>
        <form onSubmit={resetPassword} className="space-y-2">
          <label className="block font-display text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ochre)" }}>
            Reset token
          </label>
          <input
            required
            placeholder="Paste the token from email or the demo response"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full h-10 px-3 font-body text-sm"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}
          />
          <label className="block font-display text-[11px] tracking-[0.12em] uppercase pt-2" style={{ color: "var(--ochre)" }}>
            New password
          </label>
          <input
            type="password"
            required
            minLength={10}
            placeholder="At least 10 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 font-body text-sm"
            style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}
          />
          <button type="submit" className="ox-cta h-10 px-5 text-[13px] font-semibold w-full">
            Update password
          </button>
        </form>
        <Link href="/login" className="font-body text-[13px]" style={{ color: "var(--bronze)" }}>
          Back to login
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-8 font-body">Loading…</main>}>
      <ResetForm />
    </Suspense>
  );
}
