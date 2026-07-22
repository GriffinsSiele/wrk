import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Where trusted specialists are made. Learn how Olynixx Praxis turns performance coaches into deployable specialists through dual-gate certification.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Olynixx Praxis",
    description:
      "Where trusted specialists are made. Learn how Olynixx Praxis turns performance coaches into deployable specialists through dual-gate certification.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
