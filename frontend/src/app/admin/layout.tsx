"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth";
import { BarChart2, BookOpen, FileText, Settings, Users, UserCheck, Folder, CheckSquare } from "react-feather";
import { olynixxLogo } from "@/assets/logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="flex min-h-screen md:h-screen overflow-hidden" style={{ background: "var(--ox-bg-mid)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-60 md:static md:top-0 md:bottom-auto md:z-auto flex flex-col flex-shrink-0 transition-transform duration-200 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "rgba(255,255,255,0.94)", borderRight: "1px solid rgba(62,128,204,0.22)" }}
      >
        <div className="h-16 flex items-center px-5" style={{ borderBottom: "1px solid rgba(62,128,204,0.18)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border" style={{ borderColor: "var(--ox-line)" }}>
              <Image
                src={olynixxLogo}
                alt="Olynixx Academy logo"
                width={32}
                height={32}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="font-semibold tracking-tight text-sm" style={{ color: "var(--ox-indigo)" }}>
              OLYNIXX <span style={{ color: "var(--ox-blue)" }}>ADMIN</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors text-[rgba(46,60,142,0.75)] hover:bg-[rgba(62,128,204,0.12)] hover:text-[var(--ox-fg-dark)]">
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid rgba(62,128,204,0.18)" }}>
          <form action={logout}>
            <button type="submit"
              className="w-full px-3 py-2 text-[13px] rounded-lg text-left transition-colors"
              style={{ color: "var(--ox-blue)" }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-30 md:hidden"
          style={{ background: "rgba(10,10,10,0.18)" }}
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 ox-glass-nav">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden w-9 h-9 rounded-lg grid place-items-center border"
              style={{ borderColor: "var(--ox-line)", color: "var(--ox-indigo)" }}
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label={mobileNavOpen ? "Close admin menu" : "Open admin menu"}
              aria-expanded={mobileNavOpen}
            >
              <span className="text-base leading-none">{mobileNavOpen ? "x" : "="}</span>
            </button>
            <h1 className="text-lg md:text-xl font-bold font-outfit" style={{ color: "var(--ox-fg)" }}>Admin Dashboard</h1>
          </div>
          <div className="w-9 h-9 rounded-full grid place-items-center text-sm font-bold"
               style={{ background: "rgba(62,128,204,0.14)", color: "var(--ox-indigo)" }}>
            A
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
