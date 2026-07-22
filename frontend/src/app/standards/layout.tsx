import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standards & Scope of Practice",
  description:
    "Professional standards, scope of practice, and code of conduct for Olynixx Praxis certified coaches.",
  alternates: { canonical: "/standards" },
  openGraph: {
    title: "Standards & Scope of Practice | Olynixx Praxis",
    description:
      "Professional standards, scope of practice, and code of conduct for Olynixx Praxis certified coaches.",
    url: "/standards",
  },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
