import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Focus",
  description:
    "Human Readiness, Recovery Intelligence, and Performance Intelligence — the three disciplines of Olynixx Praxis.",
  alternates: { canonical: "/focus" },
  openGraph: {
    title: "Our Focus | Olynixx Praxis",
    description:
      "Human Readiness, Recovery Intelligence, and Performance Intelligence — the three disciplines of Olynixx Praxis.",
    url: "/focus",
  },
};

export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
