import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Pool",
  description:
    "Earn the specialisation. Join the pool. Get placed. We don't replace your certification, we specialise it.",
  alternates: { canonical: "/work-with-us" },
  openGraph: {
    title: "Join the Pool | Olynixx Praxis",
    description:
      "Earn the specialisation. Join the pool. Get placed. We don't replace your certification, we specialise it.",
    url: "/work-with-us",
  },
};

export default function WorkWithUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
