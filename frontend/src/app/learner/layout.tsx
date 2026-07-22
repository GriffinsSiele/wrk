import type { Metadata } from "next";
import { PortalHeader } from "@/components/layout/PortalHeader";

export const metadata: Metadata = {
  title: "Learner Portal",
  robots: { index: false, follow: false },
};

const learnerNav = [
  { label: "Dashboard", href: "/learner" },
  { label: "Courses", href: "/learner/courses" },
  { label: "Quizzes", href: "/learner/quizzes" },
  { label: "Exam", href: "/learner/exam" },
  { label: "Certificate", href: "/learner/certificate" },
];

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  // ox-portal switches CSS tokens to the Deep Teal portal theme.
  return (
    <div className="ox-portal min-h-screen flex flex-col">
      <PortalHeader portalLabel="Learner Portal" items={learnerNav} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
