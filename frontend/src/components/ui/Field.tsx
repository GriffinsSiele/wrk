import type { ReactNode } from "react";

/** Persistent field label — placeholders disappear once a value is entered. */
export function Field({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={`block space-y-1 min-w-0 ${className}`}>
      <span
        className="block font-display text-[11px] tracking-[0.12em] uppercase"
        style={{ color: "var(--ochre)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
