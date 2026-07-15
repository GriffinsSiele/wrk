import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Certified | Olynixx Academy",
  description:
    "Become a Level 1 Human Readiness Coach: study online, pass the written exam and practical assessment, earn your certificate, and join the coach pool.",
};

export default function CertificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
