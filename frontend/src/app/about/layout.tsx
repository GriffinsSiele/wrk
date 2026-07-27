import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Where trusted specialists are made. Olynixx Praxis specialises non-medical human performance coaches across readiness, recovery, and performance intelligence — including health, nutrition, and wellness programming.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Olynixx Praxis",
    description:
      "Where trusted specialists are made. Everything works on somebody. That is exactly the problem.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
