"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand/BrandMark";

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
  // Portal roots must not stay "active" for every nested route.
  if (PORTAL_ROOTS.has(href)) return false;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  // Keep Courses highlighted under /learner/courses/[id].
  if (href.includes("/courses") && pathname.startsWith("/learner/courses")) return true;
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
          <BrandMark variant="transparent" size={32} />
          <div className="min-w-0">
            <div
              className="font-display text-[12px] tracking-[0.16em] uppercase leading-tight truncate"
              style={{ color: "var(--cream)" }}
            >
              {portalLabel}
            </div>
            {activeItem && (
              <div
                className="text-[10px] font-display tracking-[0.14em] uppercase truncate md:hidden"
                style={{ color: "var(--ochre)" }}
              >
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
                className="relative px-3.5 py-2 text-[13px] font-display whitespace-nowrap transition-colors"
                style={{
                  color: active ? "var(--cream)" : "rgba(242,237,227,0.55)",
                  borderBottom: active ? "1px solid var(--gold)" : "1px solid transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          <form action={logout} className="hidden md:block">
            <button
              type="submit"
              className="h-9 px-3.5 text-[12px] font-display tracking-[0.08em] uppercase transition-colors"
              style={{ color: "rgba(242,237,227,0.55)", border: "1px solid rgba(150,118,43,0.45)", borderRadius: 2 }}
            >
              Sign out
            </button>
          </form>
          <button
            type="button"
            className="md:hidden w-9 h-9 grid place-items-center"
            style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="text-base leading-none">{mobileOpen ? "×" : "≡"}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{ background: "var(--teal-deep)", borderColor: "rgba(150,118,43,0.4)" }}
        >
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-[13px] font-display"
                style={{
                  color: active ? "var(--cream)" : "rgba(242,237,227,0.7)",
                  borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <form action={logout} className="pt-1">
            <button
              type="submit"
              className="w-full text-left px-3 py-2.5 text-[13px] font-display"
              style={{ color: "rgba(242,237,227,0.55)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
