import { PortalHeader } from "@/components/layout/PortalHeader";

const coachNav = [
  { label: "Dashboard", href: "/coach" },
  { label: "Projects", href: "/coach/projects" },
  { label: "Profile", href: "/coach/profile" },
  { label: "Agreements", href: "/coach/agreements" },
  { label: "CECs", href: "/coach/cecs" },
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ox-bg)", color: "var(--ox-fg)" }}>
      <PortalHeader portalLabel="Coach Portal" items={coachNav} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
