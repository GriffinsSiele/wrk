"use client";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

/** Flat surface card, no glass, blur, or drop-shadow (Praxis v1.1). */
export function GlassCard({ children, className = "", dark = false }: GlassCardProps) {
  return (<div
      className={className}
      style={{
        border: `1px solid ${dark ? "rgba(150,118,43,0.4)" : "rgba(150,118,43,0.35)"}`,
        background: dark ? "rgba(12,15,18,0.35)" : "var(--cream)",
        borderRadius: 2,
      }}
    >
      {children}
    </div>);
}
