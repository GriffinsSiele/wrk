import type { Metadata } from "next";
import { CourseJsonLd } from "@/components/seo/CourseJsonLd";

export const metadata: Metadata = {
  title: "Specialisations",
  description:
    "Dual-gate specialisation in Human Readiness, Recovery, and Performance Intelligence. Written examination and observed practical assessment, then join the trusted pool. We don't replace your certification; we specialise it.",
  alternates: { canonical: "/certification" },
  openGraph: {
    title: "Specialisations | Olynixx Praxis",
    description:
      "Dual-gate specialisation in Human Readiness, Recovery, and Performance Intelligence. Then join the trusted pool.",
    url: "/certification",
  },
};

export default function CertificationLayout({ children }: { children: React.ReactNode }) {
  return (<>
      <CourseJsonLd />
      {children}
    </>);
}
