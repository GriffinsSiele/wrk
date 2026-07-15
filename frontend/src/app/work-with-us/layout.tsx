import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work With Us | Become a Coach | Olynixx Academy",
  description: "Join the Olynixx coach pool. Get certified, get matched to projects, and build a coaching career grounded in science.",
};

export default function WorkWithUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
