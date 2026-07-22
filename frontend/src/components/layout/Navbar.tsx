"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Our Focus", href: "/focus" },
    { label: "Specialisations", href: "/certification" },
    { label: "Organisations", href: "/organisations" },
  ];
  const quickLinks = [
    { label: "Standards", href: "/standards" },
    { label: "Contact", href: "/contact" },
    { label: "Join the pool", href: "/work-with-us" },
    { label: "Sign in", href: "/login" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[4.25rem] ox-glass-nav transition-colors duration-300 ${
        scrolled ? "ox-nav-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" aria-label="Olynixx Praxis home">
          <BrandLockup variant="cream" markSize={36} tone="dark" />
        </Link>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-0.5">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-[13px] font-display tracking-[0.04em] transition-colors"
              style={{
                color: isActive(item.href) ? "var(--ink)" : "rgba(12,15,18,0.55)",
                borderBottom: isActive(item.href) ? "1px solid var(--gold)" : "1px solid transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="lg:hidden w-9 h-9 grid place-items-center border"
            style={{ borderColor: "var(--bronze)", color: "var(--ink)", borderRadius: 2 }}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="font-display text-lg leading-none">{mobileOpen ? "×" : "≡"}</span>
          </button>
          <Link
            href="/login"
            className="hidden sm:inline-flex h-9 items-center px-3 text-[13px] font-display"
            style={{ color: "rgba(12,15,18,0.55)" }}
          >
            Sign in
          </Link>
          <Link
            href="/certification"
            className="ox-cta hidden sm:inline-flex items-center h-9 px-5 text-[12px] tracking-[0.12em] uppercase"
          >
            View specialisations
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden absolute inset-x-0 top-[4.25rem] border-t px-4 py-5 space-y-1 text-center"
          style={{ background: "var(--cream)", borderColor: "rgba(150,118,43,0.35)" }}
        >
          {[...navLinks, ...quickLinks].map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="block rounded-sm px-3 py-2.5 text-[14px] font-display"
              style={{
                color: isActive(item.href) ? "var(--ink)" : "rgba(12,15,18,0.7)",
                borderBottom: isActive(item.href) ? "1px solid var(--gold)" : "none",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/work-with-us"
            className="ox-cta mt-3 inline-flex items-center justify-center h-10 px-6 text-[12px] tracking-[0.12em] uppercase"
            onClick={() => setMobileOpen(false)}
          >
            Join the pool
          </Link>
        </div>
      )}
    </header>
  );
}
