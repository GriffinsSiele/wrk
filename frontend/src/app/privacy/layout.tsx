import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Olynixx Praxis collects, uses, and protects personal data under applicable UAE PDPL requirements.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Olynixx Praxis",
    description:
      "How Olynixx Praxis collects, uses, and protects personal data under applicable UAE PDPL requirements.",
    url: "/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
