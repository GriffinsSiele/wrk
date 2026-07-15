import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Olynixx Academy",
  description: "The story, values, and team behind Olynixx Academy — training the next generation of Human Readiness Coaches.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
