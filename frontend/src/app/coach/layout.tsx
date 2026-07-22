import type { Metadata } from "next";
import { PortalHeader } from "@/components/layout/PortalHeader";

export const metadata: Metadata = {
  title: "Coach Portal",
  robots: { index: false, follow: false },
};

const coachNav = [
  { label: "Dashboard", href: "/coach" },
  { label: "Projects", href: "/coach/projects" },
  { label: "Profile", href: "/coach/profile" },
  { label: "Agreements", href: "/coach/agreements" },
  { label: "CECs", href: "/coach/cecs" },
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  // ox-portal switches CSS tokens to the Deep Teal portal theme.
  return (
    <div className="ox-portal min-h-screen flex flex-col">
      <PortalHeader portalLabel="Coach Portal" items={coachNav} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
