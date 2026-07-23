"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { BarChart2, BookOpen, FileText, Settings, Users, UserCheck, Folder, CheckSquare } from "react-feather";
import { BrandMark } from "@/components/brand/BrandMark";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = [
    { label: "Overview", href: "/admin", icon: BarChart2 },
    { label: "Talent Pool", href: "/admin/coaches", icon: Users },
    { label: "Users", href: "/admin/users", icon: UserCheck },
    { label: "Projects", href: "/admin/projects", icon: Folder },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Exams", href: "/admin/exams", icon: FileText },
    { label: "Practicals", href: "/admin/practicals", icon: CheckSquare },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="ox-portal flex min-h-screen md:h-screen overflow-hidden">
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-60 md:static md:top-0 md:bottom-auto md:z-auto flex flex-col flex-shrink-0 transition-transform duration-200 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "rgba(12,15,18,0.28)", borderRight: "1px solid rgba(150,118,43,0.35)" }}
      >
        <div className="h-16 flex items-center px-5" style={{ borderBottom: "1px solid rgba(150,118,43,0.35)" }}>
          <div className="flex items-center gap-2.5">
            <BrandMark variant="transparent" size={32} />
            <div>
              <div className="font-display text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--cream)" }}>
                Olynixx
              </div>
              <div className="font-display text-[9px] tracking-[0.28em] uppercase" style={{ color: "var(--ochre)" }}>
                Admin
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-display transition-colors"
                style={{
                  color: active ? "var(--cream)" : "rgba(242,237,227,0.55)",
                  borderLeft: active ? "2px solid var(--bronze)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid rgba(150,118,43,0.35)" }}>
          <form action={logout}>
            <button
              type="submit"
              className="w-full px-3 py-2 text-[12px] font-display tracking-[0.1em] uppercase text-left"
              style={{ color: "var(--ochre)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-30 md:hidden"
          style={{ background: "rgba(12,15,18,0.5)" }}
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto min-w-0">
        <header
          className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30"
          style={{ background: "var(--teal-deep)", borderBottom: "1px solid rgba(150,118,43,0.35)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden w-9 h-9 grid place-items-center"
              style={{ border: "1px solid rgba(150,118,43,0.4)", color: "var(--cream)", borderRadius: 2 }}
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label={mobileNavOpen ? "Close admin menu" : "Open admin menu"}
              aria-expanded={mobileNavOpen}
            >
              <span className="text-base leading-none">{mobileNavOpen ? "×" : "≡"}</span>
            </button>
            <h1 className="text-lg md:text-xl font-display tracking-[-0.01em]" style={{ color: "var(--cream)", fontWeight: 500 }}>
              Admin
            </h1>
          </div>
          <div
            className="w-9 h-9 grid place-items-center text-sm font-display"
            style={{ border: "1px solid rgba(150,118,43,0.4)", color: "var(--ochre)", borderRadius: 2 }}
          >
            A
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
