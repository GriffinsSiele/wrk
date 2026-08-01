import type { Metadata } from "next";
import { PILLARS_INLINE, SITE_POSITIONING, WHO_WE_ARE } from "@/lib/brand-copy";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_POSITIONING} ${WHO_WE_ARE} Pillars: ${PILLARS_INLINE}.`,
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
