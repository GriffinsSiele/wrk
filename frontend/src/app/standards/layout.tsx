import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standards & Scope of Practice | Olynixx Academy",
  description: "The official standards, scope of practice, and code of conduct for Olynixx Academy certified Human Readiness Coaches.",
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
