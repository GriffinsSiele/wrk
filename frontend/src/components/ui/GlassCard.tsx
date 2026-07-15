"use client";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function GlassCard({ children, className = "", dark = false }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.08)"}`,
        background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
        boxShadow: "0 8px 32px rgba(46,60,142,0.08)",
      }}
    >
      {children}
    </div>
  );
}
