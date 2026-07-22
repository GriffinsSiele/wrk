import type { Metadata } from "next";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { CONTACT_FAQS } from "@/lib/contact-faqs";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about specialisation, certification, or deploying Praxis coaches? Browse the FAQ or send us a message.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Olynixx Praxis",
    description:
      "Questions about specialisation, certification, or deploying Praxis coaches? Browse the FAQ or send us a message.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqJsonLd items={CONTACT_FAQS.map((f) => ({ question: f.q, answer: f.a }))} />
      {children}
    </>
  );
}
