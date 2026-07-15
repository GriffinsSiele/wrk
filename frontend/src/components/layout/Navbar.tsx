"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { olynixxLogo } from "@/assets/logo";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Our Focus", href: "/focus" },
    { label: "Get Certified", href: "/certification" },
    { label: "For Organisations", href: "/organisations" }
  ];
  const quickLinks = [
    { label: "Standards", href: "/standards" },
    { label: "Contact", href: "/contact" },
    { label: "Work With Us", href: "/work-with-us" },
    { label: "Login", href: "/login" },
    { label: "Learner Portal", href: "/learner" },
    { label: "Coach Portal", href: "/coach" },
    { label: "Admin Portal", href: "/admin" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b ox-glass-nav transition-all duration-500 ${
        scrolled
          ? "shadow-[0_18px_36px_-28px_rgba(46,60,142,0.55)]"
          : "shadow-[0_12px_28px_-24px_rgba(46,60,142,0.35)]"
      }`}
    >
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight" style={{ color: 'var(--ox-fg)' }}>
          <div className="w-8 h-8 rounded-lg overflow-hidden border" style={{ borderColor: "var(--ox-line)" }}>
            <Image
              src={olynixxLogo}
              alt="Olynixx Academy logo"
              width={32}
              height={32}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span>OLYNIXX</span>
        </Link>

        {/* Nav links – centered */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-[13px] transition-all duration-200 ${
                isActive(item.href)
                  ? "font-semibold shadow-[0_10px_24px_-20px_rgba(46,60,142,0.75)]"
                  : "font-medium hover:bg-[rgba(62,128,204,0.1)] hover:-translate-y-px"
              }`}
              style={{
                color: isActive(item.href) ? "var(--ox-fg-dark)" : "var(--ox-muted)",
                background: isActive(item.href) ? "rgba(62,128,204,0.14)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="md:hidden w-9 h-9 rounded-lg grid place-items-center border"
            style={{ borderColor: "var(--ox-line)", color: "var(--ox-fg)" }}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="text-base leading-none">{mobileOpen ? "x" : "="}</span>
          </button>
          <Link href="/login"
            className="hidden sm:inline-flex h-9 items-center px-3 text-[13px] transition-colors"
            style={{ color: 'var(--ox-muted)' }}>
            Sign in
          </Link>
          <Link href="/certification"
            className="ox-cta hidden sm:inline-flex items-center h-9 rounded-full px-5 text-[13px] font-semibold">
            Get certified
          </Link>
        </div>
      </div>
      {mobileOpen && (
        <div
          className="md:hidden absolute inset-x-0 top-16 border-t px-4 py-4 space-y-1 text-center"
          style={{
            background: "rgba(255,255,255,0.96)",
            borderColor: "var(--ox-line)",
            backdropFilter: "blur(14px)",
          }}
        >
          {[...navLinks, ...quickLinks].map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                isActive(item.href) ? "font-semibold" : "font-medium"
              }`}
              style={{
                color: isActive(item.href) ? "var(--ox-fg-dark)" : "var(--ox-fg)",
                background: isActive(item.href) ? "rgba(62,128,204,0.14)" : "transparent",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/certification"
            className="ox-cta mt-2 inline-flex items-center justify-center h-9 rounded-full px-5 text-[13px] font-semibold"
            onClick={() => setMobileOpen(false)}
          >
            Get certified
          </Link>
        </div>
      )}
    </header>
  );
}
