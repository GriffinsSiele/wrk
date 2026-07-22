import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Olynixx Praxis website, learner platform, coach portal, and related services.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Olynixx Praxis",
    description:
      "Terms governing use of the Olynixx Praxis website, learner platform, coach portal, and related services.",
    url: "/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
