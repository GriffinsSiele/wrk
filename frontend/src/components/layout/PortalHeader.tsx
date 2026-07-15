"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { logout } from "@/app/actions/auth";
import { olynixxLogo } from "@/assets/logo";

type PortalNavItem = {
  label: string;
  href: string;
};

type PortalHeaderProps = {
  portalLabel: string;
  items: PortalNavItem[];
};

const PORTAL_ROOTS = new Set(["/learner", "/coach", "/admin"]);

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  // Portal roots should only highlight on exact match
  if (PORTAL_ROOTS.has(href)) return false;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  // Courses deep-link: treat any /learner/courses/* as Courses
  if (href.includes("/courses/") && pathname.startsWith("/learner/courses")) return true;
  return false;
}

export function PortalHeader({ portalLabel, items }: PortalHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => items.find((item) => isActivePath(pathname, item.href)),
    [items, pathname]
  );

  return (
    <header className="sticky top-0 z-40 ox-glass-nav">
      <div className="h-14 md:h-16 max-w-7xl mx-auto w-full flex items-center gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div
            className="w-8 h-8 rounded-lg overflow-hidden border shrink-0"
            style={{ borderColor: "var(--ox-line)" }}
          >
            <Image
              src={olynixxLogo}
              alt="Olynixx Academy logo"
              width={32}
              height={32}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[13px] leading-tight truncate" style={{ color: "var(--ox-fg)" }}>
              {portalLabel}
            </div>
            {activeItem && (
              <div className="text-[10px] uppercase tracking-[0.14em] truncate md:hidden" style={{ color: "var(--ox-muted)" }}>
                {activeItem.label}
              </div>
            )}
          </div>
        </div>

        <nav
          className="hidden md:flex flex-1 items-center justify-center gap-0.5 mx-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors"
                style={{
                  color: active ? "var(--ox-indigo)" : "var(--ox-muted)",
                  background: active ? "rgba(62,128,204,0.12)" : "transparent",
                }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--ox-accent), var(--ox-blue))" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          <form action={logout} className="hidden md:block">
            <button
              type="submit"
              className="h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{ color: "var(--ox-muted)", border: "1px solid var(--ox-line)" }}
            >
              Sign out
            </button>
          </form>
          <button
            type="button"
            className="md:hidden w-9 h-9 rounded-lg grid place-items-center border"
            style={{ borderColor: "var(--ox-line)", color: "var(--ox-fg)" }}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="text-base leading-none">{mobileOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{
            background: "rgba(255,255,255,0.98)",
            borderColor: "var(--ox-line)",
            backdropFilter: "blur(14px)",
          }}
        >
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-[13px] font-medium"
                style={{
                  color: active ? "var(--ox-indigo)" : "var(--ox-fg)",
                  background: active ? "rgba(62,128,204,0.12)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <form action={logout} className="pt-1">
            <button
              type="submit"
              className="w-full text-left rounded-lg px-3 py-2.5 text-[13px]"
              style={{ color: "var(--ox-muted)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
