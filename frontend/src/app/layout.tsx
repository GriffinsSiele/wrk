import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Olynixx Academy | Human Readiness & Performance Intelligence",
  description: "Setting the standard in non-medical human readiness, recovery, and performance intelligence. Get certified or hire expert coaches.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--ox-bg)', color: 'var(--ox-fg)' }}>
        {children}
      </body>
    </html>
  );
}
