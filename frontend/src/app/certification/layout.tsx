import type { Metadata } from "next";
import { CourseJsonLd } from "@/components/seo/CourseJsonLd";

export const metadata: Metadata = {
  title: "Specialisations",
  description:
    "Dual-gate specialisation for performance coaches — written assessment and practical PASS — then join the deployable coach pool. We don't replace your certification; we specialise it.",
  alternates: { canonical: "/certification" },
  openGraph: {
    title: "Specialisations | Olynixx Praxis",
    description:
      "Dual-gate specialisation for performance coaches — written assessment and practical PASS — then join the deployable coach pool.",
    url: "/certification",
  },
};

export default function CertificationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CourseJsonLd />
      {children}
    </>
  );
}
