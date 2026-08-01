import type { Metadata } from "next";
import { DEPLOY_WHERE, SITE_POSITIONING } from "@/lib/brand-copy";

export const metadata: Metadata = {
  title: "For Organisations",
  description: `The trusted pool. Certified specialists placed into ${DEPLOY_WHERE}. ${SITE_POSITIONING}`,
  alternates: { canonical: "/organisations" },
  openGraph: {
    title: "For Organisations | Olynixx Praxis",
    description: `The trusted pool. Certified specialists placed into ${DEPLOY_WHERE}.`,
    url: "/organisations",
  },
};

export default function OrganisationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
