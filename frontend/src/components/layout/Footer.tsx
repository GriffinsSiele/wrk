"use client";
import Link from "next/link";
import Image from "next/image";
import { olynixxLogo } from "@/assets/logo";

export function Footer() {
  return (
    <footer
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(62,128,204,0.08) 100%)",
        color: "var(--ox-indigo)",
        borderTop: "1px solid rgba(62,128,204,0.2)",
      }}
      className="px-6 py-12"
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg overflow-hidden border" style={{ borderColor: "var(--ox-line)" }}>
                <Image
                  src={olynixxLogo}
                  alt="Olynixx Academy logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="font-semibold tracking-tight" style={{ color: "var(--ox-indigo)" }}>OLYNIXX</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ox-muted)' }}>
              Setting the standard in non-medical human readiness, recovery, and performance intelligence.
            </p>
          </div>

          {[
            { title: "Platform", links: [
              { label: "Our Focus", href: "/focus" },
              { label: "Get Certified", href: "/certification" },
              { label: "For Organisations", href: "/organisations" },
              { label: "Become a Coach", href: "/work-with-us" },
            ]},
            { title: "Resources", links: [
              { label: "Standards & Scope", href: "/standards" },
              { label: "FAQ", href: "/contact" },
              { label: "Contact", href: "/contact" },
            ]},
            { title: "Legal", links: [
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-5"
                  style={{ color: 'var(--ox-indigo)' }}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}-${l.href}`}>
                    <Link href={l.href}
                      className="text-[13px] transition-colors"
                      style={{ color: 'var(--ox-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ox-fg-dark)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ox-muted)')}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col md:flex-row justify-between items-center text-[12px]"
             style={{ borderTop: '1px solid rgba(62,128,204,0.24)', color: 'var(--ox-muted)' }}>
          <p>© {new Date().getFullYear()} Olynixx Academy. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for human performance.</p>
        </div>
      </div>
    </footer>
  );
}
