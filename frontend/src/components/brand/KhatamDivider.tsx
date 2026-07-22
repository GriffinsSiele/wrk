/** Hairline bronze rule with a khatam node — page 08 divider system. */
export function KhatamDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-hidden
    >
      <div className="flex-1 h-px" style={{ background: "var(--bronze)", opacity: 0.45 }} />
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3.2" fill="var(--gold)" />
        <circle cx="10" cy="10" r="6.5" stroke="var(--bronze)" strokeWidth="0.8" fill="none" opacity="0.7" />
      </svg>
      <div className="flex-1 h-px" style={{ background: "var(--bronze)", opacity: 0.45 }} />
    </div>
  );
}
