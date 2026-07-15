import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Focus — Three Pillars | Olynixx Academy",
  description: "Human Readiness, Recovery Intelligence, and Performance Intelligence — the three pillars of Olynixx Academy certification.",
};

export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
