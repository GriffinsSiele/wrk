import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Organisations",
  description:
    "Deploy Praxis-certified specialists into corporate, sport, and project environments — taught, tested, and vouched for.",
  alternates: { canonical: "/organisations" },
  openGraph: {
    title: "For Organisations | Olynixx Praxis",
    description:
      "Deploy Praxis-certified specialists into corporate, sport, and project environments — taught, tested, and vouched for.",
    url: "/organisations",
  },
};

export default function OrganisationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
