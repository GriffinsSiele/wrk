"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Strapline } from "@/components/brand/Strapline";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--ink)" }}
    >
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <BrandLockup
            variant="midnight"
            markSize={72}
            layout="stacked"
            tone="light"
            className="mb-2"
          />
          <Strapline className="mt-6 justify-center" deployTone="cream" size="sm" />
        </div>

        <div
          className="p-8"
          style={{ background: "rgba(242,237,227,0.04)", border: "1px solid rgba(150,118,43,0.4)" }}
        >
          <h1
            className="font-display text-2xl mb-1 text-center"
            style={{ color: "var(--cream)", fontWeight: 500 }}
          >
            Sign in
          </h1>
          <p className="font-body text-[14px] text-center mb-8" style={{ color: "rgba(242,237,227,0.55)" }}>
            Access your portal
          </p>

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block font-display text-[11px] tracking-[0.18em] uppercase mb-2"
                style={{ color: "var(--ochre)" }}
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-[14px] font-body outline-none"
                style={{
                  background: "rgba(12,15,18,0.5)",
                  border: "1px solid rgba(150,118,43,0.4)",
                  color: "var(--cream)",
                  borderRadius: 2,
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(150,118,43,0.4)")}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block font-display text-[11px] tracking-[0.18em] uppercase mb-2"
                style={{ color: "var(--ochre)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 text-[14px] font-body outline-none"
                style={{
                  background: "rgba(12,15,18,0.5)",
                  border: "1px solid rgba(150,118,43,0.4)",
                  color: "var(--cream)",
                  borderRadius: 2,
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(150,118,43,0.4)")}
              />
            </div>

            {state?.error && (
              <div
                className="text-[13px] font-body text-center py-2.5 px-4"
                style={{
                  background: "rgba(217,172,74,0.08)",
                  color: "var(--gold-bright)",
                  border: "1px solid rgba(150,118,43,0.4)",
                }}
              >
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="ox-cta w-full h-12 text-[13px] tracking-[0.14em] uppercase mt-2"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: "1px solid rgba(150,118,43,0.3)" }}>
            <p className="font-body text-[13px]" style={{ color: "rgba(242,237,227,0.5)" }}>
              Need an account?{" "}
              <Link href="/contact" style={{ color: "var(--gold)" }}>
                Request access
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="font-display text-[13px] tracking-[0.06em]"
            style={{ color: "rgba(242,237,227,0.5)" }}
          >
            ← Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
