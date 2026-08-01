"use client";
import Link from "next/link";
import { Instagram, Linkedin, Twitter, Youtube } from "react-feather";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Strapline } from "@/components/brand/Strapline";
import { KhatamDivider } from "@/components/brand/KhatamDivider";

const SOCIAL = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/olynixx",
    Icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/olynixx",
    Icon: Instagram,
  },
  {
    label: "X",
    href: "https://x.com/olynixx",
    Icon: Twitter,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@olynixx",
    Icon: Youtube,
  },
] as const;

export function Footer() {
  return (
    <footer
      className="px-6 py-8 sm:py-10"
      style={{ background: "var(--teal-deep)", color: "var(--cream)" }}
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 mb-6">
          <div>
            <BrandLockup variant="transparent" markSize={40} tone="light" />
            <p
              className="font-body italic text-[14px] leading-relaxed mt-3 max-w-xs"
              style={{ color: "rgba(242,237,227,0.7)" }}
            >
              Where trusted specialists are made. Specialisation and certification for non-medical human
              performance coaches.
            </p>
            <Strapline className="mt-3" deployTone="cream" size="sm" />
            <div className="mt-4 flex items-center gap-2.5" aria-label="Social media">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="ox-social-icon inline-flex h-8 w-8 items-center justify-center transition-colors"
                  style={{
                    color: "rgba(242,237,227,0.55)",
                    border: "1px solid rgba(150,118,43,0.35)",
                    borderRadius: 2,
                  }}
                >
                  <Icon size={14} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Platform",
              links: [
                { label: "Our Focus", href: "/focus" },
                { label: "Specialisations", href: "/certification" },
                { label: "Organisations", href: "/organisations" },
                { label: "Join the pool", href: "/work-with-us" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Standards & Scope", href: "/standards" },
                { label: "Contact", href: "/contact" },
                { label: "About", href: "/about" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="font-display text-[11px] tracking-[0.28em] uppercase mb-3"
                style={{ color: "var(--ochre)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="font-body text-[14px] transition-colors"
                      style={{ color: "rgba(242,237,227,0.65)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <KhatamDivider className="mb-4 opacity-80" />

        <div
          className="flex flex-col md:flex-row justify-between items-center gap-2 text-[12px] font-body"
          style={{ color: "rgba(242,237,227,0.45)" }}
        >
          <p>© {new Date().getFullYear()} Olynixx Praxis. All rights reserved.</p>
          <p className="italic">A RiseUp company.</p>
        </div>
      </div>
    </footer>
  );
}
