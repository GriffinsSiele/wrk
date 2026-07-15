import { PortalHeader } from "@/components/layout/PortalHeader";

const learnerNav = [
  { label: "Dashboard", href: "/learner" },
  { label: "Courses", href: "/learner/courses/1" },
  { label: "Quizzes", href: "/learner/quizzes" },
  { label: "Exam", href: "/learner/exam" },
  { label: "Certificate", href: "/learner/certificate" },
];

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ox-bg)", color: "var(--ox-fg)" }}>
      <PortalHeader portalLabel="Learner Portal" items={learnerNav} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
