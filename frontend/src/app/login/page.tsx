"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { olynixxLogo } from "@/assets/logo";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "var(--ox-bg-dark)" }}>
      {/* Aurora */}
      <div className="ox-aurora fixed inset-0 pointer-events-none" aria-hidden />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image
            src={olynixxLogo}
            alt="Olynixx Academy official logo"
            width={112}
            height={112}
            className="w-28 h-28 mx-auto mb-6 object-contain"
          />
          <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--ox-fg-dark)" }}>Sign in</h1>
          <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
            Access your portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
             style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", backdropFilter: "blur(12px)", boxShadow: "var(--ox-shadow)" }}>
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-[12px] font-medium mb-2"
                     style={{ color: "var(--ox-muted)" }}>
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="e.g. admin@olynixx.com"
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: "var(--ox-input-bg)",
                  border: "1px solid var(--ox-line)",
                  color: "var(--ox-fg-dark)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ox-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ox-line)")}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] font-medium mb-2"
                     style={{ color: "var(--ox-muted)" }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="e.g. admin123"
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: "var(--ox-input-bg)",
                  border: "1px solid var(--ox-line)",
                  color: "var(--ox-fg-dark)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ox-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ox-line)")}
              />
            </div>

            {state?.error && (
              <div className="text-[13px] text-center py-2.5 px-4 rounded-xl"
                   style={{ background: "var(--ox-surface-strong)", color: "var(--ox-blue)", border: "1px solid var(--ox-line)" }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="ox-cta w-full h-12 rounded-full text-[15px] font-semibold mt-2"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 text-center" style={{ borderTop: "1px solid var(--ox-line)" }}>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--ox-muted)" }}>
              Demo accounts
            </p>
            <div className="space-y-1.5 text-[12px] font-mono" style={{ color: "var(--ox-muted)" }}>
              <p>admin@olynixx.com / admin123</p>
              <p>coach@olynixx.com / coach123</p>
              <p>learner@olynixx.com / learner123</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-[13px] transition-colors" style={{ color: "var(--ox-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ox-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ox-muted)")}>
            ← Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
