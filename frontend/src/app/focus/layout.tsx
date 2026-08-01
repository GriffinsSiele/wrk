import type { Metadata } from "next";
import { PILLARS_INLINE } from "@/lib/brand-copy";

export const metadata: Metadata = {
  title: "Our Focus",
  description: `${PILLARS_INLINE}, the three pillars of Olynixx Praxis.`,
  alternates: { canonical: "/focus" },
  openGraph: {
    title: "Our Focus | Olynixx Praxis",
    description: `${PILLARS_INLINE}, the three pillars of Olynixx Praxis.`,
    url: "/focus",
  },
};

export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
